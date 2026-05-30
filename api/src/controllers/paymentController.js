import crypto from "crypto";
import Razorpay from "razorpay";
import { db } from "../config/db.js";
import { getAdvisorAmount, toPaise, PRICING } from "../config/pricing.js";
import { sendActivationEmail } from "../config/email.js";

const APP_URL = process.env.APP_URL || "https://digitalhubli.com";

/* Lazy singleton so the server still boots if keys are missing during setup */
let _rzp = null;
function rzp() {
  if (!_rzp) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay keys are not configured on the server.");
    }
    _rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _rzp;
}

/* Count how many companies an advisor selected */
async function getCompanyCount(advisorId) {
  const [[row]] = await db.query(
    "SELECT COUNT(*) AS cnt FROM AdvisorCompany WHERE advisorId = ?",
    [advisorId]
  );
  return row?.cnt || 0;
}

/* Resolve the advisor for this request.
   - Renewals: authenticated, advisorId comes from the JWT (req.user.id)
   - New signups: not yet logged in, advisorId passed in the body */
async function resolveAdvisor(req) {
  const advisorId = req.user?.id ? Number(req.user.id) : Number(req.body.userId);
  if (!advisorId) return null;

  const [[advisor]] = await db.query(
    "SELECT id, name, email, phone, role FROM `User` WHERE id = ? LIMIT 1",
    [advisorId]
  );
  if (!advisor || advisor.role !== "ADVISOR") return null;
  return advisor;
}

/* ─────────────────────────────────────────────────
   GET QUOTE  (authenticated advisor → renewal page)
   Returns the price this advisor should pay.
───────────────────────────────────────────────── */
export const getQuote = async (req, res) => {
  try {
    const advisorId = Number(req.user.id);
    const companyCount = await getCompanyCount(advisorId);
    const amount = getAdvisorAmount(companyCount);
    return res.status(200).json({
      amount,
      currency: PRICING.CURRENCY,
      companyCount,
    });
  } catch (err) {
    console.error("getQuote error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/* ─────────────────────────────────────────────────
   CREATE ORDER
   Works for both new-signup activation and renewal.
   Amount is ALWAYS computed on the server.
───────────────────────────────────────────────── */
export const createOrder = async (req, res) => {
  try {
    const advisor = await resolveAdvisor(req);
    if (!advisor) return res.status(404).json({ message: "Advisor not found." });

    const companyCount = await getCompanyCount(advisor.id);
    const amountRupees = getAdvisorAmount(companyCount);

    const order = await rzp().orders.create({
      amount: toPaise(amountRupees),
      currency: PRICING.CURRENCY,
      receipt: `adv_${advisor.id}_${Date.now()}`,
      notes: { advisorId: String(advisor.id), companyCount: String(companyCount) },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,         // paise (for Razorpay checkout)
      amountRupees,                 // rupees (for display)
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      advisorId: advisor.id,
      companyCount,
      prefill: {
        name: advisor.name || "",
        email: advisor.email || "",
        contact: advisor.phone || "",
      },
    });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ message: err.message || "Could not create order." });
  }
};

/* ─────────────────────────────────────────────────
   VERIFY PAYMENT + ACTIVATE
   Verifies the Razorpay signature, then activates the
   advisor and writes the subscription. Amount is
   re-computed on the server (never trusted from client).
───────────────────────────────────────────────── */
export const verifyPayment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId, // advisorId for the not-yet-logged-in signup case
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details." });
    }

    // 1) Verify signature
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed." });
    }

    // 2) Resolve advisor
    const advisorId = req.user?.id ? Number(req.user.id) : Number(userId);
    const [[advisor]] = await connection.query(
      "SELECT id, name, email, role FROM `User` WHERE id = ? LIMIT 1",
      [advisorId]
    );
    if (!advisor || advisor.role !== "ADVISOR") {
      return res.status(404).json({ message: "Advisor not found." });
    }

    // 3) Re-compute amount on the server
    const [[cc]] = await connection.query(
      "SELECT COUNT(*) AS cnt FROM AdvisorCompany WHERE advisorId = ?",
      [advisorId]
    );
    const amountPaid = getAdvisorAmount(cc?.cnt || 0);

    // 4) Plan / duration (defaults to plan 1 / 365 days)
    const [[sub]] = await connection.query(
      "SELECT planId FROM `Subscription` WHERE advisorId = ? LIMIT 1",
      [advisorId]
    );
    const planId = sub?.planId || 1;
    const [[plan]] = await connection.query(
      "SELECT durationDays FROM `SubscriptionPlan` WHERE id = ? LIMIT 1",
      [planId]
    );
    const durationDays = plan?.durationDays || 365;

    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await connection.beginTransaction();

    // 5) Activate user
    await connection.query(
      "UPDATE `User` SET isActive = 1, updatedAt = NOW() WHERE id = ?",
      [advisorId]
    );

    // 6) Upsert subscription
    const [[existing]] = await connection.query(
      "SELECT id FROM `Subscription` WHERE advisorId = ? LIMIT 1",
      [advisorId]
    );

    if (existing) {
      await connection.query(
        `UPDATE \`Subscription\`
         SET status='ACTIVE', planId=?, amountPaid=?, paymentRef=?,
             startDate=?, expiryDate=?, updatedAt=NOW()
         WHERE advisorId=?`,
        [planId, amountPaid, razorpay_payment_id, startDate, expiryDate, advisorId]
      );
    } else {
      await connection.query(
        `INSERT INTO \`Subscription\`
         (advisorId, planId, status, amountPaid, paymentRef, startDate, expiryDate, createdAt, updatedAt)
         VALUES (?, ?, 'ACTIVE', ?, ?, ?, ?, NOW(), NOW())`,
        [advisorId, planId, amountPaid, razorpay_payment_id, startDate, expiryDate]
      );
    }

    await connection.commit();

    // 7) Activation email (non-blocking)
    if (advisor.email) {
      sendActivationEmail({
        to: advisor.email,
        name: advisor.name,
        expiryDate,
        amountPaid,
        loginUrl: APP_URL,
      }).catch((e) => console.error("Activation email failed:", e));
    }

    return res.status(200).json({
      message: "Payment verified. Your account is now active.",
      subscription: { status: "ACTIVE", startDate, expiryDate, amountPaid },
    });
  } catch (err) {
    await connection.rollback();
    console.error("verifyPayment error:", err);
    return res.status(500).json({ message: "Server error." });
  } finally {
    connection.release();
  }
};

/* ─────────────────────────────────────────────────
   WEBHOOK (optional but recommended for production)
   Mount with express.raw — see paymentRoutes.js note.
   Razorpay calls this even if the user closes the tab,
   so activation is reliable.
───────────────────────────────────────────────── */
export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body) // req.body must be the RAW buffer here
      .digest("hex");

    if (signature !== expected) {
      return res.status(400).json({ message: "Invalid webhook signature." });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const advisorId = Number(payment.notes?.advisorId);
      if (advisorId) {
        const [[cc]] = await db.query(
          "SELECT COUNT(*) AS cnt FROM AdvisorCompany WHERE advisorId = ?",
          [advisorId]
        );
        const amountPaid = getAdvisorAmount(cc?.cnt || 0);
        const [[plan]] = await db.query(
          "SELECT durationDays FROM `SubscriptionPlan` WHERE id = 1 LIMIT 1"
        );
        const durationDays = plan?.durationDays || 365;
        const start = new Date();
        const expiry = new Date(start.getTime() + durationDays * 86400000);

        await db.query("UPDATE `User` SET isActive=1, updatedAt=NOW() WHERE id=?", [advisorId]);
        await db.query(
          `UPDATE \`Subscription\`
           SET status='ACTIVE', amountPaid=?, paymentRef=?, startDate=?, expiryDate=?, updatedAt=NOW()
           WHERE advisorId=?`,
          [amountPaid, payment.id, start, expiry, advisorId]
        );
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("razorpayWebhook error:", err);
    return res.status(500).json({ message: "Webhook error." });
  }
};
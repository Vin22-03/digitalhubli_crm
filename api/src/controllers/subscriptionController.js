import { db } from "../config/db.js";
import {
  sendActivationEmail,
  sendPlanUpdatedEmail,
} from "../config/email.js";

const APP_URL = process.env.APP_URL || "https://digitalhubli.com";

/* ─────────────────────────────────────────────────
   GET ALL SUBSCRIPTIONS (admin)
   Returns all advisors with their subscription info
───────────────────────────────────────────────── */
export const getAllSubscriptions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         u.id, u.name, u.email, u.phone, u.brandName, u.isActive, u.createdAt AS signupDate,
         s.id         AS sub_id,
         s.status     AS sub_status,
         s.amountPaid,
         s.discountNote,
         s.startDate,
         s.expiryDate,
         s.paymentRef,
         s.activationNote,
         s.planId,
         s.createdAt  AS sub_createdAt,
         p.name       AS plan_name,
         p.basePrice  AS plan_basePrice,
         p.durationDays,
         activator.name AS activatedByName
       FROM \`User\` u
       LEFT JOIN \`Subscription\` s       ON s.advisorId = u.id
       LEFT JOIN \`SubscriptionPlan\` p   ON p.id = s.planId
       LEFT JOIN \`User\` activator       ON activator.id = s.activatedById
       WHERE u.role = 'ADVISOR'
       ORDER BY u.createdAt DESC`
    );

    const subscriptions = rows.map((r) => ({
      advisor: {
        id:        r.id,
        name:      r.name,
        email:     r.email,
        phone:     r.phone,
        brandName: r.brandName,
        isActive:  Boolean(r.isActive),
        signupDate: r.signupDate,
      },
      subscription: r.sub_id ? {
        id:             r.sub_id,
        status:         r.sub_status,
        amountPaid:     r.amountPaid,
        discountNote:   r.discountNote,
        startDate:      r.startDate,
        expiryDate:     r.expiryDate,
        paymentRef:     r.paymentRef,
        activationNote: r.activationNote,
        planId:         r.planId,
        planName:       r.plan_name,
        planBasePrice:  r.plan_basePrice,
        durationDays:   r.durationDays,
        activatedBy:    r.activatedByName,
        createdAt:      r.sub_createdAt,
      } : null,
    }));

    return res.status(200).json({ subscriptions });
  } catch (err) {
    console.error("getAllSubscriptions error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/* ─────────────────────────────────────────────────
   GET SUBSCRIPTION PLANS (admin)
───────────────────────────────────────────────── */
export const getSubscriptionPlans = async (req, res) => {
  try {
    const [plans] = await db.query(
      `SELECT * FROM \`SubscriptionPlan\` ORDER BY basePrice ASC`
    );
    return res.status(200).json({ plans });
  } catch (err) {
    console.error("getSubscriptionPlans error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/* ─────────────────────────────────────────────────
   UPDATE SUBSCRIPTION PLAN PRICE (admin)
   Lets you change the price/duration of any plan
───────────────────────────────────────────────── */
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { name, basePrice, durationDays, description } = req.body;

    if (!basePrice || !durationDays) {
      return res.status(400).json({ message: "Price and duration are required." });
    }

    await db.query(
      `UPDATE \`SubscriptionPlan\`
       SET name = ?, basePrice = ?, durationDays = ?, description = ?, updatedAt = NOW()
       WHERE id = ?`,
      [name, Number(basePrice), Number(durationDays), description || null, Number(planId)]
    );

    const [[plan]] = await db.query(`SELECT * FROM \`SubscriptionPlan\` WHERE id = ?`, [Number(planId)]);
    return res.status(200).json({ message: "Plan updated successfully.", plan });
  } catch (err) {
    console.error("updateSubscriptionPlan error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/* ─────────────────────────────────────────────────
   ACTIVATE ADVISOR (admin manually confirms payment)
   - Sets isActive = 1 on User
   - Creates/updates Subscription record
   - Sends activation email via Brevo
───────────────────────────────────────────────── */
export const activateAdvisor = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { advisorId } = req.params;
    const {
      amountPaid,
      discountNote,
      paymentRef,
      activationNote,
      planId,
      customDurationDays, // override duration if needed
    } = req.body;

    const numId = Number(advisorId);

    // fetch advisor
    const [[advisor]] = await connection.query(
      `SELECT id, name, email, phone, role FROM \`User\` WHERE id = ? LIMIT 1`,
      [numId]
    );
    if (!advisor || advisor.role !== "ADVISOR") {
      return res.status(404).json({ message: "Advisor not found." });
    }

    // fetch plan
    const resolvedPlanId = planId ? Number(planId) : 1;
    const [[plan]] = await connection.query(
      `SELECT * FROM \`SubscriptionPlan\` WHERE id = ?`,
      [resolvedPlanId]
    );
    if (!plan) return res.status(400).json({ message: "Plan not found." });

    const durationDays = customDurationDays ? Number(customDurationDays) : plan.durationDays;
    const startDate    = new Date();
    const expiryDate   = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await connection.beginTransaction();

    // activate user
    await connection.query(
      `UPDATE \`User\` SET isActive = 1, updatedAt = NOW() WHERE id = ?`,
      [numId]
    );

    // upsert subscription
    const [[existing]] = await connection.query(
      `SELECT id FROM \`Subscription\` WHERE advisorId = ? LIMIT 1`,
      [numId]
    );

    if (existing) {
      await connection.query(
        `UPDATE \`Subscription\`
         SET status = 'ACTIVE', planId = ?, amountPaid = ?, discountNote = ?,
             paymentRef = ?, activationNote = ?, startDate = ?, expiryDate = ?,
             activatedById = ?, updatedAt = NOW()
         WHERE advisorId = ?`,
        [
          resolvedPlanId,
          amountPaid ? Number(amountPaid) : plan.basePrice,
          discountNote || null,
          paymentRef || null,
          activationNote || null,
          startDate,
          expiryDate,
          req.user.id,
          numId,
        ]
      );
    } else {
      await connection.query(
        `INSERT INTO \`Subscription\`
         (advisorId, planId, status, amountPaid, discountNote, paymentRef, activationNote,
          startDate, expiryDate, activatedById, createdAt, updatedAt)
         VALUES (?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          numId,
          resolvedPlanId,
          amountPaid ? Number(amountPaid) : plan.basePrice,
          discountNote || null,
          paymentRef || null,
          activationNote || null,
          startDate,
          expiryDate,
          req.user.id,
        ]
      );
    }

    await connection.commit();

    // send activation email (non-blocking — don't fail if email fails)
    if (advisor.email) {
      sendActivationEmail({
        to:         advisor.email,
        name:       advisor.name,
        expiryDate,
        amountPaid: amountPaid || plan.basePrice,
        loginUrl:   APP_URL,
      }).catch((e) => console.error("Activation email failed:", e));
    }

    return res.status(200).json({
      message: `${advisor.name} activated successfully. Activation email sent.`,
      advisor: { id: numId, name: advisor.name, email: advisor.email },
      subscription: { status: "ACTIVE", startDate, expiryDate, amountPaid },
    });
  } catch (err) {
    await connection.rollback();
    console.error("activateAdvisor error:", err);
    return res.status(500).json({ message: "Server error." });
  } finally {
    connection.release();
  }
};

/* ─────────────────────────────────────────────────
   EXTEND / CHANGE PLAN (admin)
   - Extend expiry, change amount, add discount note
   - Sends plan updated email
───────────────────────────────────────────────── */
export const updateAdvisorSubscription = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { advisorId } = req.params;
    const { extendDays, newExpiryDate, amountPaid, discountNote, activationNote, planId } = req.body;

    const numId = Number(advisorId);

    const [[advisor]] = await connection.query(
      `SELECT id, name, email FROM \`User\` WHERE id = ? AND role = 'ADVISOR' LIMIT 1`,
      [numId]
    );
    if (!advisor) return res.status(404).json({ message: "Advisor not found." });

    const [[sub]] = await connection.query(
      `SELECT * FROM \`Subscription\` WHERE advisorId = ? LIMIT 1`,
      [numId]
    );
    if (!sub) return res.status(404).json({ message: "No subscription found for this advisor." });

    // Calculate new expiry
    let expiryDate;
    if (newExpiryDate) {
      expiryDate = new Date(newExpiryDate);
    } else if (extendDays) {
      const base = sub.expiryDate ? new Date(sub.expiryDate) : new Date();
      if (base < new Date()) base.setTime(new Date().getTime()); // if already expired, extend from today
      expiryDate = new Date(base.getTime() + Number(extendDays) * 24 * 60 * 60 * 1000);
    } else {
      return res.status(400).json({ message: "Provide extendDays or newExpiryDate." });
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE \`Subscription\`
       SET status = 'ACTIVE',
           expiryDate = ?,
           ${amountPaid  ? "amountPaid = ?,"         : ""}
           ${discountNote !== undefined ? "discountNote = ?," : ""}
           ${activationNote !== undefined ? "activationNote = ?," : ""}
           ${planId ? "planId = ?," : ""}
           activatedById = ?,
           updatedAt = NOW()
       WHERE advisorId = ?`,
      [
        expiryDate,
        ...(amountPaid        ? [Number(amountPaid)]   : []),
        ...(discountNote !== undefined ? [discountNote || null]   : []),
        ...(activationNote !== undefined ? [activationNote || null] : []),
        ...(planId            ? [Number(planId)]        : []),
        req.user.id,
        numId,
      ]
    );

    // ensure user is active
    await connection.query(
      `UPDATE \`User\` SET isActive = 1, updatedAt = NOW() WHERE id = ?`,
      [numId]
    );

    await connection.commit();

    if (advisor.email) {
      sendPlanUpdatedEmail({
        to:         advisor.email,
        name:       advisor.name,
        expiryDate,
        note:       activationNote || discountNote || null,
      }).catch((e) => console.error("Plan update email failed:", e));
    }

    return res.status(200).json({
      message: "Subscription updated. Email sent to advisor.",
      expiryDate,
    });
  } catch (err) {
    await connection.rollback();
    console.error("updateAdvisorSubscription error:", err);
    return res.status(500).json({ message: "Server error." });
  } finally {
    connection.release();
  }
};

/* ─────────────────────────────────────────────────
   DEACTIVATE ADVISOR (admin)
───────────────────────────────────────────────── */
export const deactivateAdvisor = async (req, res) => {
  try {
    const { advisorId } = req.params;
    const { reason } = req.body;
    const numId = Number(advisorId);

    const [[advisor]] = await db.query(
      `SELECT id, name, role FROM \`User\` WHERE id = ? LIMIT 1`, [numId]
    );
    if (!advisor || advisor.role !== "ADVISOR") {
      return res.status(404).json({ message: "Advisor not found." });
    }

    await db.query(`UPDATE \`User\` SET isActive = 0, updatedAt = NOW() WHERE id = ?`, [numId]);
    await db.query(
      `UPDATE \`Subscription\` SET status = 'CANCELLED', activationNote = ?, updatedAt = NOW() WHERE advisorId = ?`,
      [reason || "Deactivated by admin", numId]
    );

    return res.status(200).json({ message: `${advisor.name} deactivated.` });
  } catch (err) {
    console.error("deactivateAdvisor error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/* ─────────────────────────────────────────────────
   GET MY SUBSCRIPTION (advisor)
   Used to show expiry info on advisor dashboard
───────────────────────────────────────────────── */
export const getMySubscription = async (req, res) => {
  try {
    const [[sub]] = await db.query(
      `SELECT s.status, s.startDate, s.expiryDate, s.amountPaid,
              p.name AS planName, p.basePrice
       FROM \`Subscription\` s
       LEFT JOIN \`SubscriptionPlan\` p ON p.id = s.planId
       WHERE s.advisorId = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (!sub) {
      return res.status(200).json({ subscription: null });
    }

    const now        = new Date();
    const expiry     = sub.expiryDate ? new Date(sub.expiryDate) : null;
    const daysLeft   = expiry ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)) : null;
    const isExpired  = expiry ? expiry < now : false;

    return res.status(200).json({
      subscription: {
        status:    sub.status,
        startDate: sub.startDate,
        expiryDate: sub.expiryDate,
        daysLeft,
        isExpired,
        planName:  sub.planName,
        amountPaid: sub.amountPaid,
      },
    });
  } catch (err) {
    console.error("getMySubscription error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
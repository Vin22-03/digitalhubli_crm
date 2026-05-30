import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendSignupReceivedEmail, sendPasswordResetEmail } from "../config/email.js";

// ── Password validation ──
function validatePassword(password) {
  if (!password || password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least 1 uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least 1 lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least 1 number.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return "Password must contain at least 1 special character (!@#$%^&*).";
  return null;
}

import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

const normalizeUser = (user) => ({
  ...user,
  isActive: Boolean(user.isActive),
  mustChangePassword: Boolean(user.mustChangePassword),
});

/* ─────────────────────────────────────────
   ADVISOR SELF-SIGNUP
   Creates account with isActive = 0 (inactive until payment)
───────────────────────────────────────── */
export const registerAdvisor = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { name, email, phone, password, companyIds } = req.body;

    // --- basic validation ---
    if (!name?.trim())     return res.status(400).json({ message: "Name is required." });
    if (!email?.trim())    return res.status(400).json({ message: "Email is required." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ message: "Please enter a valid email address." });
    if (!phone?.trim())    return res.status(400).json({ message: "Mobile number is required." });
    if (!/^\d{10}$/.test(phone.trim())) return res.status(400).json({ message: "Mobile number must be exactly 10 digits." });
    if (!password) return res.status(400).json({ message: "Password is required." });
    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ message: pwdError });
    if (!Array.isArray(companyIds) || companyIds.length === 0)
      return res.status(400).json({ message: "Please select at least one company." });

    // --- check duplicates ---
    const [existingPhone] = await db.query(
      "SELECT id FROM `User` WHERE phone = ? LIMIT 1",
      [phone.trim()]
    );
    if (existingPhone.length > 0)
      return res.status(400).json({ message: "Mobile number is already registered." });

    const [existingEmail] = await db.query(
      "SELECT id FROM `User` WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );
    if (existingEmail.length > 0)
      return res.status(400).json({ message: "Email is already registered." });

    // --- validate companies exist ---
    const [validCompanies] = await db.query(
      `SELECT id FROM \`Company\` WHERE id IN (?) AND isActive = 1`,
      [companyIds]
    );
    if (validCompanies.length !== companyIds.length)
      return res.status(400).json({ message: "One or more selected companies are invalid." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.beginTransaction();

    // isActive = 0 → inactive until payment
    const [result] = await connection.query(
      `INSERT INTO \`User\`
       (name, email, phone, password, role, isActive, mustChangePassword, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'ADVISOR', 0, 0, NOW(), NOW())`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        hashedPassword,
      ]
    );

    const newUserId = result.insertId;

    // link advisor to chosen companies
    const companyInserts = companyIds.map((cId) => [newUserId, Number(cId)]);
    await connection.query(
      `INSERT INTO AdvisorCompany (advisorId, companyId, createdAt) VALUES ?`,
      [companyInserts.map(([a, c]) => [a, c, new Date()])]
    );

    await connection.commit();

    // Create pending subscription record
    await db.query(
      `INSERT IGNORE INTO \`Subscription\` (advisorId, planId, status, createdAt, updatedAt)
       VALUES (?, 1, 'PENDING', NOW(), NOW())`,
      [newUserId]
    );

    // Send signup received email (non-blocking)
    if (email) {
      sendSignupReceivedEmail({
        to:   email.trim().toLowerCase(),
        name: name.trim(),
      }).catch((e) => console.error("Signup email failed:", e));
    }

    return res.status(201).json({
      message: "Account created. Please complete payment to activate your account.",
      userId: newUserId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("registerAdvisor error:", error);
    return res.status(500).json({ message: "Server error." });
  } finally {
    connection.release();
  }
};

/* ─────────────────────────────────────────
   LOGIN  (email OR mobile + password)
───────────────────────────────────────── */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Email/mobile and password are required.",
      });
    }

    const trimmed = identifier.trim();

    // decide if it looks like an email or a phone
    const isEmail = trimmed.includes("@");

    const [rows] = await db.query(
      `SELECT id, name, email, phone, password, role, isActive, mustChangePassword, brandName
       FROM \`User\`
       WHERE ${isEmail ? "email = ?" : "phone = ?"}
       LIMIT 1`,
      [isEmail ? trimmed.toLowerCase() : trimmed]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const user = normalizeUser(rows[0]);

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is not active. Please complete payment to activate.",
        pendingPayment: true,
        userId: user.id,
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        brandName: user.brandName,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   FORGOT PASSWORD — sends OTP to email
───────────────────────────────────────── */
export const forgotPasswordRequest = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: "Email or mobile is required." });
    }

    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");

    const [userRows] = await db.query(
      `SELECT id, name, email, phone FROM \`User\` WHERE ${isEmail ? "email = ?" : "phone = ?"} LIMIT 1`,
      [isEmail ? trimmed.toLowerCase() : trimmed]
    );

    // always return same message (don't leak whether account exists)
    const safeMsg = "If the account exists, a verification code has been sent to the registered email.";

    if (userRows.length === 0) {
      return res.status(200).json({ message: safeMsg });
    }

    const user = userRows[0];

    if (!user.email) {
      return res.status(200).json({ message: safeMsg });
    }

    // Invalidate any existing pending OTPs for this user
    await db.query(
      `UPDATE PasswordResetRequest SET status = 'REJECTED', updatedAt = NOW()
       WHERE userId = ? AND status = 'PENDING'`,
      [user.id]
    );

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    await db.query(
      `INSERT INTO PasswordResetRequest (userId, requestedBy, status, resolvedNote, createdAt, updatedAt)
       VALUES (?, ?, 'PENDING', ?, NOW(), NOW())`,
      [user.id, user.phone, otp]
    );

    // Send OTP email (non-blocking failure won't crash the request)
    sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      otp,
    }).catch((e) => console.error("Password reset email failed:", e));

    return res.status(200).json({ message: safeMsg });
  } catch (error) {
    console.error("forgotPasswordRequest error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   RESET PASSWORD WITH OTP
   Validates the OTP (15-minute window), sets new password.
───────────────────────────────────────── */
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ message: "Email/mobile, OTP, and new password are required." });
    }

    const pwError = validatePassword(newPassword);
    if (pwError) return res.status(400).json({ message: pwError });

    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");

    const [userRows] = await db.query(
      `SELECT id FROM \`User\` WHERE ${isEmail ? "email = ?" : "phone = ?"} LIMIT 1`,
      [isEmail ? trimmed.toLowerCase() : trimmed]
    );

    if (userRows.length === 0) {
      return res.status(400).json({ message: "Invalid code or account not found." });
    }

    const userId = userRows[0].id;

    // Find the PENDING OTP for this user (most recent)
    const [otpRows] = await db.query(
      `SELECT id, resolvedNote, createdAt FROM PasswordResetRequest
       WHERE userId = ? AND status = 'PENDING'
       ORDER BY createdAt DESC LIMIT 1`,
      [userId]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ message: "No pending reset request. Please request a new code." });
    }

    const request = otpRows[0];
    const storedOtp = request.resolvedNote;
    const createdAt = new Date(request.createdAt);
    const now = new Date();
    const minutesElapsed = (now - createdAt) / (1000 * 60);

    // Check expiry (15 minutes)
    if (minutesElapsed > 15) {
      await db.query(
        `UPDATE PasswordResetRequest SET status = 'REJECTED', resolvedNote = 'Expired', updatedAt = NOW() WHERE id = ?`,
        [request.id]
      );
      return res.status(400).json({ message: "Code has expired. Please request a new one." });
    }

    // Check OTP match
    if (storedOtp !== otp.trim()) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // OTP is valid — hash new password and update
    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE \`User\` SET password = ?, mustChangePassword = 0, updatedAt = NOW() WHERE id = ?`,
      [hashed, userId]
    );

    // Mark request completed
    await db.query(
      `UPDATE PasswordResetRequest SET status = 'COMPLETED', resolvedNote = 'Self-service reset', updatedAt = NOW() WHERE id = ?`,
      [request.id]
    );

    return res.status(200).json({ message: "Password reset successfully. You can now login." });
  } catch (error) {
    console.error("resetPasswordWithOTP error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   GET ME  (current logged-in user)
───────────────────────────────────────── */
export const getMe = async (req, res) => {
  try {
    const [userRows] = await db.query(
      `SELECT id, name, email, phone, brandName, role, isActive, mustChangePassword,
              bio, dob, photoUrl, advisorUrl, officeAddress, advisorRole, brandLogoUrl, createdAt
       FROM \`User\`
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = normalizeUser(userRows[0]);

    const [companyRows] = await db.query(
      `SELECT c.id, c.code, c.name
       FROM AdvisorCompany ac
       JOIN \`Company\` c ON c.id = ac.companyId
       WHERE ac.advisorId = ?`,
      [user.id]
    );

    return res.status(200).json({
      message: "Current user fetched successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        brandName: user.brandName,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
        bio: user.bio,
        dob: user.dob,
        photoUrl: user.photoUrl,
        advisorUrl: user.advisorUrl,
        officeAddress: user.officeAddress,
        advisorRole: user.advisorRole,
        brandLogoUrl: user.brandLogoUrl,
        createdAt: user.createdAt,
        companies: companyRows,
      },
    });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   GET COMPANIES (public - for signup form)
───────────────────────────────────────── */
export const getPublicCompanies = async (req, res) => {
  try {
    const [companies] = await db.query(
      `SELECT id, code, name FROM \`Company\` WHERE isActive = 1 ORDER BY name ASC`
    );
    return res.status(200).json({ companies });
  } catch (error) {
    console.error("getPublicCompanies error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
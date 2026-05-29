import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized. Token missing." });
    }

    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-check isActive from DB on every request
    // This ensures expired/deactivated advisors are blocked immediately
    const [[user]] = await db.query(
      `SELECT id, role, isActive FROM \`User\` WHERE id = ? LIMIT 1`,
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ message: "Account not found." });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive. Please contact support.",
        inactive: true,
      });
    }

    req.user = { ...decoded, role: user.role }; // always use DB role, not token role
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};
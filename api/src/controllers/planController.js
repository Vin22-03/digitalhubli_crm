import { db } from "../config/db.js";

export const getPlans = async (req, res) => {
  try {
    const { companyId, age, search = "" } = req.query;

    const where = ["p.isActive = 1"];
    const params = [];

    if (companyId) {
      where.push("p.companyId = ?");
      params.push(Number(companyId));
    }

    if (age) {
      where.push("(p.minAge IS NULL OR p.minAge <= ?)");
      where.push("(p.maxAge IS NULL OR p.maxAge >= ?)");
      params.push(Number(age), Number(age));
    }

    if (search) {
      where.push("(p.name LIKE ? OR p.code LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const [plans] = await db.query(
      `SELECT p.*, c.name AS company_name, c.code AS company_code
       FROM \`Plan\` p
       JOIN \`Company\` c ON c.id = p.companyId
       WHERE ${where.join(" AND ")}
       ORDER BY p.name ASC`,
      params
    );

    res.status(200).json({ plans });
  } catch (error) {
    console.error("getPlans error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { companyId, name, code, minAge, maxAge, brochureUrl, description } = req.body;

    if (!companyId || !name) {
      return res.status(400).json({ message: "Company and plan name are required." });
    }

    const [result] = await db.query(
      `INSERT INTO \`Plan\`
       (companyId, name, code, minAge, maxAge, brochureUrl, description, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        Number(companyId),
        name.trim(),
        code || null,
        minAge ? Number(minAge) : null,
        maxAge ? Number(maxAge) : null,
        brochureUrl || null,
        description || null,
      ]
    );

    res.status(201).json({
      message: "Plan created successfully.",
      planId: result.insertId,
    });
  } catch (error) {
    console.error("createPlan error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
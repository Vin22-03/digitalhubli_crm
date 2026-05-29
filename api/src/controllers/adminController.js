import bcrypt from "bcryptjs";
import { db } from "../config/db.js";
import { BRAND } from "../config/branding.js";

const DEFAULT_TEMPLATE_BODY = `Dear *{client_name}*,

Thank you for your valuable time.

We are sharing a suitable *{template_title}* from *{advisor_brand}*.

For more details, please contact:
*{advisor_name}*
*{advisor_mobile}*
*{advisor_url}*

Team - *{advisor_brand}*
{advisor_tagline}`;

/* =========================
   COMPANIES
========================= */

export const getAllCompanies = async (req, res) => {
  try {
    const [companies] = await db.query(
      `SELECT id, code, name
       FROM \`Company\`
       WHERE isActive = 1
       ORDER BY name ASC`
    );
    return res.status(200).json({ message: "Companies fetched successfully.", companies });
  } catch (error) {
    console.error("getAllCompanies error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const createCompany = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ message: "Company name and code are required." });

    const [[existing]] = await db.query(`SELECT id FROM \`Company\` WHERE code = ? LIMIT 1`, [code.trim().toUpperCase()]);
    if (existing) return res.status(409).json({ message: "A company with this code already exists." });

    const [result] = await db.query(
      `INSERT INTO \`Company\` (name, code, isActive, createdAt, updatedAt) VALUES (?, ?, 1, NOW(), NOW())`,
      [name.trim(), code.trim().toUpperCase()]
    );
    return res.status(201).json({ message: "Company created successfully.", company: { id: result.insertId, name: name.trim(), code: code.trim().toUpperCase() } });
  } catch (error) { console.error("createCompany error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ message: "Company name and code are required." });
    await db.query(`UPDATE \`Company\` SET name = ?, code = ?, updatedAt = NOW() WHERE id = ?`, [name.trim(), code.trim().toUpperCase(), Number(companyId)]);
    return res.status(200).json({ message: "Company updated successfully." });
  } catch (error) { console.error("updateCompany error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const toggleCompanyStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    const [[company]] = await db.query(`SELECT id, isActive FROM \`Company\` WHERE id = ? LIMIT 1`, [Number(companyId)]);
    if (!company) return res.status(404).json({ message: "Company not found." });
    const newStatus = company.isActive ? 0 : 1;
    await db.query(`UPDATE \`Company\` SET isActive = ?, updatedAt = NOW() WHERE id = ?`, [newStatus, Number(companyId)]);
    return res.status(200).json({ message: "Company status updated.", isActive: Boolean(newStatus) });
  } catch (error) { console.error("toggleCompanyStatus error:", error); return res.status(500).json({ message: "Server error." }); }
};

/* =========================
   INSURANCE PLAN MANAGEMENT
========================= */

export const getAllPlansAdmin = async (req, res) => {
  try {
    const [plans] = await db.query(
      `SELECT p.id, p.companyId, p.name, p.code, p.minAge, p.maxAge,
              p.brochureUrl, p.description, p.isActive, p.createdAt,
              c.name AS company_name, c.code AS company_code
       FROM \`Plan\` p
       JOIN \`Company\` c ON c.id = p.companyId
       ORDER BY c.name ASC, p.name ASC`
    );
    return res.status(200).json({ plans });
  } catch (error) { console.error("getAllPlansAdmin error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const createInsurancePlan = async (req, res) => {
  try {
    const { companyId, name, code, minAge, maxAge, brochureUrl, description } = req.body;
    if (!companyId || !name) return res.status(400).json({ message: "Company and plan name are required." });

    const [result] = await db.query(
      `INSERT INTO \`Plan\` (companyId, name, code, minAge, maxAge, brochureUrl, description, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [Number(companyId), name.trim(), code || null, minAge ? Number(minAge) : null, maxAge ? Number(maxAge) : null, brochureUrl || null, description || null]
    );
    return res.status(201).json({ message: "Plan created successfully.", planId: result.insertId });
  } catch (error) { console.error("createInsurancePlan error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const updateInsurancePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { name, code, minAge, maxAge, brochureUrl, description } = req.body;
    if (!name) return res.status(400).json({ message: "Plan name is required." });

    await db.query(
      `UPDATE \`Plan\` SET name = ?, code = ?, minAge = ?, maxAge = ?, brochureUrl = ?, description = ?, updatedAt = NOW() WHERE id = ?`,
      [name.trim(), code || null, minAge ? Number(minAge) : null, maxAge ? Number(maxAge) : null, brochureUrl || null, description || null, Number(planId)]
    );
    return res.status(200).json({ message: "Plan updated successfully." });
  } catch (error) { console.error("updateInsurancePlan error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const toggleInsurancePlanStatus = async (req, res) => {
  try {
    const { planId } = req.params;
    const [[plan]] = await db.query(`SELECT id, isActive FROM \`Plan\` WHERE id = ? LIMIT 1`, [Number(planId)]);
    if (!plan) return res.status(404).json({ message: "Plan not found." });
    const newStatus = plan.isActive ? 0 : 1;
    await db.query(`UPDATE \`Plan\` SET isActive = ?, updatedAt = NOW() WHERE id = ?`, [newStatus, Number(planId)]);
    return res.status(200).json({ message: "Plan status updated.", isActive: Boolean(newStatus) });
  } catch (error) { console.error("toggleInsurancePlanStatus error:", error); return res.status(500).json({ message: "Server error." }); }
};

/* =========================
   ADVISORS
========================= */

export const getAllAdvisors = async (req, res) => {
  try {
    const [advisors] = await db.query(
      `SELECT id, name, email, phone, brandName, advisorUrl, role, isActive, mustChangePassword, createdAt
       FROM \`User\` WHERE role = 'ADVISOR' ORDER BY createdAt DESC`
    );
    const advisorIds = advisors.map((a) => a.id);
    let companiesByAdvisor = {};
    if (advisorIds.length > 0) {
      const [companyRows] = await db.query(
        `SELECT ac.advisorId, c.id, c.code, c.name FROM AdvisorCompany ac JOIN \`Company\` c ON c.id = ac.companyId WHERE ac.advisorId IN (?)`,
        [advisorIds]
      );
      companiesByAdvisor = companyRows.reduce((acc, row) => {
        if (!acc[row.advisorId]) acc[row.advisorId] = [];
        acc[row.advisorId].push({ id: row.id, code: row.code, name: row.name });
        return acc;
      }, {});
    }
    return res.status(200).json({
      message: "Advisors fetched successfully.",
      advisors: advisors.map((a) => ({ ...a, isActive: Boolean(a.isActive), mustChangePassword: Boolean(a.mustChangePassword), companies: companiesByAdvisor[a.id] || [] })),
    });
  } catch (error) { console.error("getAllAdvisors error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const createAdvisor = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { name, email, phone, password, brandName, companyIds, advisorUrl } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ message: "Name, phone, and password are required." });
    if (!Array.isArray(companyIds) || companyIds.length === 0) return res.status(400).json({ message: "At least one company must be assigned." });
    const numericCompanyIds = companyIds.map(Number);
    const [existingRows] = await connection.query(`SELECT id FROM \`User\` WHERE phone = ? LIMIT 1`, [phone]);
    if (existingRows.length > 0) return res.status(400).json({ message: "Phone number already exists." });
    if (email) {
      const [existingEmail] = await connection.query(`SELECT id FROM \`User\` WHERE email = ? LIMIT 1`, [email.trim().toLowerCase()]);
      if (existingEmail.length > 0) return res.status(400).json({ message: "Email already exists." });
    }
    const [companies] = await connection.query(`SELECT id, code, name FROM Company WHERE id IN (?) AND isActive = 1`, [numericCompanyIds]);
    if (companies.length !== numericCompanyIds.length) return res.status(400).json({ message: "One or more selected companies are invalid." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const finalAdvisorUrl = advisorUrl && advisorUrl.trim() ? advisorUrl.trim() : null;
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO \`User\` (name, email, phone, password, brandName, advisorUrl, role, isActive, mustChangePassword, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'ADVISOR', 1, 0, NOW(), NOW())`,
      [name, email ? email.trim().toLowerCase() : null, phone, hashedPassword, brandName || null, finalAdvisorUrl]
    );
    const advisorId = result.insertId;
    for (const companyId of numericCompanyIds) {
      await connection.query(`INSERT INTO AdvisorCompany (advisorId, companyId) VALUES (?, ?)`, [advisorId, companyId]);
    }
    await connection.commit();
    return res.status(201).json({ message: "Advisor created successfully.", user: { id: advisorId, name, phone, advisorUrl: finalAdvisorUrl, role: "ADVISOR", mustChangePassword: true, companies } });
  } catch (error) { await connection.rollback(); console.error("createAdvisor error:", error); return res.status(500).json({ message: "Server error." }); } finally { connection.release(); }
};

export const updateAdvisor = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { advisorId } = req.params;
    const { name, email, phone, brandName, companyIds, advisorUrl } = req.body;
    const numericAdvisorId = Number(advisorId);
    if (!name || !phone) return res.status(400).json({ message: "Name and phone are required." });
    if (!Array.isArray(companyIds) || companyIds.length === 0) return res.status(400).json({ message: "At least one company must be assigned." });
    const numericCompanyIds = companyIds.map(Number);
    const [advisorRows] = await connection.query(`SELECT id, role FROM \`User\` WHERE id = ? LIMIT 1`, [numericAdvisorId]);
    if (advisorRows.length === 0 || advisorRows[0].role !== "ADVISOR") return res.status(404).json({ message: "Advisor not found." });
    const [phoneRows] = await connection.query(`SELECT id FROM \`User\` WHERE phone = ? AND id != ? LIMIT 1`, [phone, numericAdvisorId]);
    if (phoneRows.length > 0) return res.status(400).json({ message: "Phone number already exists." });
    if (email) {
      const [emailRows] = await connection.query(`SELECT id FROM \`User\` WHERE email = ? AND id != ? LIMIT 1`, [email.trim().toLowerCase(), numericAdvisorId]);
      if (emailRows.length > 0) return res.status(400).json({ message: "Email already exists." });
    }
    const [companies] = await connection.query(`SELECT id, code, name FROM Company WHERE id IN (?) AND isActive = 1`, [numericCompanyIds]);
    if (companies.length !== numericCompanyIds.length) return res.status(400).json({ message: "One or more selected companies are invalid." });
    const finalAdvisorUrl = advisorUrl && advisorUrl.trim() ? advisorUrl.trim() : null;
    await connection.beginTransaction();
    await connection.query(`UPDATE \`User\` SET name = ?, email = ?, phone = ?, brandName = ?, advisorUrl = ?, updatedAt = NOW() WHERE id = ?`, [name, email ? email.trim().toLowerCase() : null, phone, brandName || null, finalAdvisorUrl, numericAdvisorId]);
    await connection.query(`DELETE FROM AdvisorCompany WHERE advisorId = ?`, [numericAdvisorId]);
    for (const companyId of numericCompanyIds) { await connection.query(`INSERT INTO AdvisorCompany (advisorId, companyId) VALUES (?, ?)`, [numericAdvisorId, companyId]); }
    await connection.commit();
    return res.status(200).json({ message: "Advisor updated successfully.", advisor: { id: numericAdvisorId, name, phone, advisorUrl: finalAdvisorUrl, role: "ADVISOR", companies } });
  } catch (error) { await connection.rollback(); console.error("updateAdvisor error:", error); return res.status(500).json({ message: "Server error." }); } finally { connection.release(); }
};

export const resetAdvisorPassword = async (req, res) => {
  try {
    const { advisorId } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: "New password is required." });
    const [advisorRows] = await db.query(`SELECT id, role FROM \`User\` WHERE id = ? LIMIT 1`, [Number(advisorId)]);
    if (advisorRows.length === 0 || advisorRows[0].role !== "ADVISOR") return res.status(404).json({ message: "Advisor not found." });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(`UPDATE \`User\` SET password = ?, mustChangePassword = 1, updatedAt = NOW() WHERE id = ?`, [hashedPassword, Number(advisorId)]);
    return res.status(200).json({ message: "Advisor password reset successfully." });
  } catch (error) { console.error("resetAdvisorPassword error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const toggleAdvisorStatus = async (req, res) => {
  try {
    const { advisorId } = req.params;
    const [advisorRows] = await db.query(`SELECT id, name, phone, role, isActive, mustChangePassword FROM \`User\` WHERE id = ? LIMIT 1`, [Number(advisorId)]);
    if (advisorRows.length === 0 || advisorRows[0].role !== "ADVISOR") return res.status(404).json({ message: "Advisor not found." });
    const newStatus = advisorRows[0].isActive ? 0 : 1;
    await db.query(`UPDATE \`User\` SET isActive = ?, updatedAt = NOW() WHERE id = ?`, [newStatus, Number(advisorId)]);
    return res.status(200).json({ message: `Advisor ${newStatus ? "activated" : "deactivated"} successfully.`, advisor: { ...advisorRows[0], isActive: Boolean(newStatus), mustChangePassword: Boolean(advisorRows[0].mustChangePassword) } });
  } catch (error) { console.error("toggleAdvisorStatus error:", error); return res.status(500).json({ message: "Server error." }); }
};

/* =========================
   PASSWORD RESET REQUESTS
========================= */

export const getPasswordResetRequests = async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT prr.id, prr.userId, prr.requestedBy AS phone, prr.requestNote AS message, prr.status, prr.adminNote, prr.handledById, prr.completedAt, prr.createdAt, prr.updatedAt,
              u.id AS user_id, u.name AS user_name, u.phone AS user_phone, u.role AS user_role,
              hb.id AS handledBy_id, hb.name AS handledBy_name, hb.phone AS handledBy_phone, hb.role AS handledBy_role
       FROM PasswordResetRequest prr
       LEFT JOIN \`User\` u ON u.id = prr.userId
       LEFT JOIN \`User\` hb ON hb.id = prr.handledById
       ORDER BY prr.createdAt DESC`
    );
    const formattedRequests = requests.map((r) => ({
      id: r.id, phone: r.phone || r.user_phone || "", message: r.message || "", status: r.status, createdAt: r.createdAt, completedAt: r.completedAt || null, adminNote: r.adminNote || "",
      user: r.user_id ? { id: r.user_id, name: r.user_name, phone: r.user_phone, role: r.user_role } : null,
      handledBy: r.handledBy_id ? { id: r.handledBy_id, name: r.handledBy_name, phone: r.handledBy_phone, role: r.handledBy_role } : null,
    }));
    return res.status(200).json({ message: "Password reset requests fetched successfully.", requests: formattedRequests });
  } catch (error) { console.error("getPasswordResetRequests error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const completePasswordResetRequest = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { requestId } = req.params;
    const { newPassword, adminNote } = req.body;
    if (!newPassword) return res.status(400).json({ message: "New password is required." });
    const [requestRows] = await connection.query(`SELECT id, userId, status FROM PasswordResetRequest WHERE id = ? LIMIT 1`, [Number(requestId)]);
    if (requestRows.length === 0) return res.status(404).json({ message: "Reset request not found." });
    if (requestRows[0].status !== "PENDING") return res.status(400).json({ message: "This request has already been processed." });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.beginTransaction();
    await connection.query(`UPDATE \`User\` SET password = ?, updatedAt = NOW() WHERE id = ?`, [hashedPassword, requestRows[0].userId]);
    await connection.query(`UPDATE PasswordResetRequest SET status = 'COMPLETED', adminNote = ?, handledById = ?, completedAt = NOW(), updatedAt = NOW() WHERE id = ?`, [adminNote || null, req.user.id, Number(requestId)]);
    await connection.commit();
    return res.status(200).json({ message: "Password reset completed successfully." });
  } catch (error) { await connection.rollback(); console.error("completePasswordResetRequest error:", error); return res.status(500).json({ message: "Server error." }); } finally { connection.release(); }
};

export const rejectPasswordResetRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNote } = req.body;
    const [requestRows] = await db.query(`SELECT id, status FROM PasswordResetRequest WHERE id = ? LIMIT 1`, [Number(requestId)]);
    if (requestRows.length === 0) return res.status(404).json({ message: "Reset request not found." });
    if (requestRows[0].status !== "PENDING") return res.status(400).json({ message: "This request has already been processed." });
    await db.query(`UPDATE PasswordResetRequest SET status = 'REJECTED', adminNote = ?, handledById = ?, completedAt = NOW(), updatedAt = NOW() WHERE id = ?`, [adminNote || null, req.user.id, Number(requestId)]);
    return res.status(200).json({ message: "Password reset request rejected successfully." });
  } catch (error) { console.error("rejectPasswordResetRequest error:", error); return res.status(500).json({ message: "Server error." }); }
};

/* =========================
   TEMPLATES — with planId support
========================= */

export const createTemplate = async (req, res) => {
  try {
    const { companyId, planId, title, tagline, body, minAge, maxAge, pdfUrl } = req.body;

    if (!companyId || !title) {
      return res.status(400).json({ message: "Company and title are required." });
    }

    const [companyRows] = await db.query(`SELECT id, code, name, isActive FROM \`Company\` WHERE id = ? LIMIT 1`, [Number(companyId)]);
    if (companyRows.length === 0 || !companyRows[0].isActive) return res.status(400).json({ message: "Invalid company selected." });

    // Validate planId if provided
    if (planId) {
      const [planRows] = await db.query(`SELECT id, companyId FROM \`Plan\` WHERE id = ? LIMIT 1`, [Number(planId)]);
      if (planRows.length === 0) return res.status(400).json({ message: "Invalid plan selected." });
      if (planRows[0].companyId !== Number(companyId)) return res.status(400).json({ message: "Plan does not belong to the selected company." });
    }

    const finalBody = body?.trim() ? body.trim() : DEFAULT_TEMPLATE_BODY;

    const [result] = await db.query(
      `INSERT INTO \`Template\`
       (companyId, planId, title, tagline, body, minAge, maxAge, pdfUrl, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        Number(companyId),
        planId ? Number(planId) : null,
        title,
        tagline || null,
        finalBody,
        minAge !== undefined && minAge !== null && minAge !== "" ? Number(minAge) : null,
        maxAge !== undefined && maxAge !== null && maxAge !== "" ? Number(maxAge) : null,
        pdfUrl || null,
      ]
    );

    const [templateRows] = await db.query(
      `SELECT t.*, c.id AS company_id, c.code AS company_code, c.name AS company_name,
              p.id AS plan_id, p.name AS plan_name, p.code AS plan_code
       FROM \`Template\` t
       JOIN \`Company\` c ON c.id = t.companyId
       LEFT JOIN \`Plan\` p ON p.id = t.planId
       WHERE t.id = ? LIMIT 1`,
      [result.insertId]
    );
    const t = templateRows[0];

    return res.status(201).json({
      message: "Template created successfully.",
      template: {
        ...t, isActive: Boolean(t.isActive),
        company: { id: t.company_id, code: t.company_code, name: t.company_name },
        plan: t.plan_id ? { id: t.plan_id, name: t.plan_name, code: t.plan_code } : null,
      },
    });
  } catch (error) { console.error("createTemplate error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const getAllTemplates = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const companyId = req.query.companyId && req.query.companyId !== "ALL" ? Number(req.query.companyId) : null;

    const whereParts = [];
    const params = [];
    if (companyId) { whereParts.push("t.companyId = ?"); params.push(companyId); }
    if (search) { whereParts.push("(t.title LIKE ? OR t.tagline LIKE ? OR c.name LIKE ?)"); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const [templates] = await db.query(
      `SELECT t.*, c.id AS company_id, c.code AS company_code, c.name AS company_name,
              p.id AS plan_id, p.name AS plan_name, p.code AS plan_code
       FROM \`Template\` t
       JOIN \`Company\` c ON c.id = t.companyId
       LEFT JOIN \`Plan\` p ON p.id = t.planId
       ${whereSql}
       ORDER BY c.name ASC, p.name ASC, t.title ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM \`Template\` t JOIN \`Company\` c ON c.id = t.companyId ${whereSql}`,
      params
    );

    const formattedTemplates = templates.map((t) => ({
      id: t.id, companyId: t.companyId, planId: t.planId, title: t.title, tagline: t.tagline, body: t.body,
      minAge: t.minAge, maxAge: t.maxAge, pdfUrl: t.pdfUrl, isActive: Boolean(t.isActive), createdAt: t.createdAt, updatedAt: t.updatedAt,
      company: { id: t.company_id, code: t.company_code, name: t.company_name },
      plan: t.plan_id ? { id: t.plan_id, name: t.plan_name, code: t.plan_code } : null,
    }));

    return res.status(200).json({
      message: "Templates fetched successfully.",
      templates: formattedTemplates,
      pagination: { page, limit, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limit) },
    });
  } catch (error) { console.error("getAllTemplates error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { companyId, planId, title, tagline, body, minAge, maxAge, pdfUrl } = req.body;

    if (!companyId || !title) return res.status(400).json({ message: "Company and title are required." });

    const [templateRows] = await db.query(`SELECT id FROM \`Template\` WHERE id = ? LIMIT 1`, [Number(templateId)]);
    if (templateRows.length === 0) return res.status(404).json({ message: "Template not found." });

    const [companyRows] = await db.query(`SELECT id, isActive FROM \`Company\` WHERE id = ? LIMIT 1`, [Number(companyId)]);
    if (companyRows.length === 0 || !companyRows[0].isActive) return res.status(400).json({ message: "Invalid company selected." });

    if (planId) {
      const [planRows] = await db.query(`SELECT id, companyId FROM \`Plan\` WHERE id = ? LIMIT 1`, [Number(planId)]);
      if (planRows.length === 0) return res.status(400).json({ message: "Invalid plan selected." });
      if (planRows[0].companyId !== Number(companyId)) return res.status(400).json({ message: "Plan does not belong to the selected company." });
    }

    await db.query(
      `UPDATE \`Template\`
       SET companyId = ?, planId = ?, title = ?, tagline = ?, body = ?, minAge = ?, maxAge = ?, pdfUrl = ?, updatedAt = NOW()
       WHERE id = ?`,
      [
        Number(companyId),
        planId ? Number(planId) : null,
        title,
        tagline || null,
        body?.trim() ? body.trim() : DEFAULT_TEMPLATE_BODY,
        minAge !== undefined && minAge !== null && minAge !== "" ? Number(minAge) : null,
        maxAge !== undefined && maxAge !== null && maxAge !== "" ? Number(maxAge) : null,
        pdfUrl || null,
        Number(templateId),
      ]
    );

    const [updatedRows] = await db.query(
      `SELECT t.*, c.id AS company_id, c.code AS company_code, c.name AS company_name,
              p.id AS plan_id, p.name AS plan_name, p.code AS plan_code
       FROM \`Template\` t JOIN \`Company\` c ON c.id = t.companyId LEFT JOIN \`Plan\` p ON p.id = t.planId
       WHERE t.id = ? LIMIT 1`,
      [Number(templateId)]
    );
    const u = updatedRows[0];

    return res.status(200).json({
      message: "Template updated successfully.",
      template: {
        id: u.id, companyId: u.companyId, planId: u.planId, title: u.title, tagline: u.tagline, body: u.body,
        minAge: u.minAge, maxAge: u.maxAge, pdfUrl: u.pdfUrl, isActive: Boolean(u.isActive), createdAt: u.createdAt, updatedAt: u.updatedAt,
        company: { id: u.company_id, code: u.company_code, name: u.company_name },
        plan: u.plan_id ? { id: u.plan_id, name: u.plan_name, code: u.plan_code } : null,
      },
    });
  } catch (error) { console.error("updateTemplate error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const toggleTemplateStatus = async (req, res) => {
  try {
    const { templateId } = req.params;
    const [templateRows] = await db.query(`SELECT id, isActive FROM \`Template\` WHERE id = ? LIMIT 1`, [Number(templateId)]);
    if (templateRows.length === 0) return res.status(404).json({ message: "Template not found." });
    const newStatus = templateRows[0].isActive ? 0 : 1;
    await db.query(`UPDATE \`Template\` SET isActive = ?, updatedAt = NOW() WHERE id = ?`, [newStatus, Number(templateId)]);
    const [updatedRows] = await db.query(`SELECT * FROM \`Template\` WHERE id = ? LIMIT 1`, [Number(templateId)]);
    return res.status(200).json({ message: `Template ${newStatus ? "activated" : "deactivated"} successfully.`, template: { ...updatedRows[0], isActive: Boolean(updatedRows[0].isActive) } });
  } catch (error) { console.error("toggleTemplateStatus error:", error); return res.status(500).json({ message: "Server error." }); }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const [templateRows] = await db.query(`SELECT id FROM \`Template\` WHERE id = ? LIMIT 1`, [Number(templateId)]);
    if (templateRows.length === 0) return res.status(404).json({ message: "Template not found." });
    const [usageRows] = await db.query(`SELECT COUNT(*) AS count FROM \`LeadActivity\` WHERE templateId = ?`, [Number(templateId)]);
    if (usageRows[0].count > 0) return res.status(400).json({ message: "This template has been used already. Deactivate it instead of deleting." });
    await db.query(`DELETE FROM \`Template\` WHERE id = ?`, [Number(templateId)]);
    return res.status(200).json({ message: "Template deleted successfully." });
  } catch (error) { console.error("deleteTemplate error:", error); return res.status(500).json({ message: "Server error." }); }
};

/* =========================
   PERFORMANCE (kept for backward compatibility but no longer used in UI)
========================= */

export const getAdvisorPerformance = async (req, res) => {
  return res.status(200).json({ message: "Performance view removed.", summary: { totalAdvisors: 0, activeAdvisors: 0, totalLeads: 0, totalConverted: 0 }, advisors: [] });
};

export const getAdvisorLeadsForAdmin = async (req, res) => {
  return res.status(200).json({ message: "Advisor leads view removed.", advisor: null, leads: [] });
};
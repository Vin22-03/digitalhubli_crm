import { db } from "../config/db.js";

export const getTemplatesForAdvisor = async (req, res) => {
  try {
    const { companyId, age, planId } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required." });
    }

    const numericCompanyId = Number(companyId);
    const numericAge =
      age !== undefined && age !== null && age !== "" ? Number(age) : null;

    const numericPlanId =
      planId !== undefined && planId !== null && planId !== ""
        ? Number(planId)
        : null;

    const [userRows] = await db.query(
      `SELECT id, role FROM \`User\` WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userRows[0];

    if (user.role !== "ADMIN") {
      const [allowedRows] = await db.query(
        `SELECT companyId FROM AdvisorCompany WHERE advisorId = ?`,
        [user.id]
      );

      const allowedCompanyIds = allowedRows.map((row) => Number(row.companyId));

      if (!allowedCompanyIds.includes(numericCompanyId)) {
        return res.status(403).json({
          message: "You are not allowed to access templates for this company.",
        });
      }
    }

    const params = [numericCompanyId];

    let planCondition = "";
    if (numericPlanId !== null) {
      planCondition = `AND t.planId = ?`;
      params.push(numericPlanId);
    }

    let ageCondition = "";
    if (numericAge !== null) {
      ageCondition = `
        AND (p.minAge IS NULL OR p.minAge <= ?)
        AND (p.maxAge IS NULL OR p.maxAge >= ?)
      `;
      params.push(numericAge, numericAge);
    }

    const [templates] = await db.query(
      `SELECT 
         t.*,

         c.id AS company_id,
         c.code AS company_code,
         c.name AS company_name,

         p.id AS plan_id,
         p.name AS plan_name,
         p.code AS plan_code,
         p.minAge AS plan_minAge,
         p.maxAge AS plan_maxAge,
         p.brochureUrl AS plan_brochureUrl,
         p.description AS plan_description

       FROM \`Template\` t
       JOIN \`Company\` c ON c.id = t.companyId
       LEFT JOIN \`Plan\` p ON p.id = t.planId

       WHERE t.companyId = ?
       AND t.isActive = 1
       ${planCondition}
       ${ageCondition}

       ORDER BY t.title ASC, t.createdAt DESC`,
      params
    );

    const formattedTemplates = templates.map((t) => ({
      id: t.id,
      companyId: t.companyId,
      planId: t.planId,
      title: t.title,
      tagline: t.tagline,
      body: t.body,
      minAge: t.minAge,
      maxAge: t.maxAge,
      pdfUrl: t.pdfUrl,
      isActive: Boolean(t.isActive),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,

      company: {
        id: t.company_id,
        code: t.company_code,
        name: t.company_name,
      },

      plan: t.plan_id
        ? {
            id: t.plan_id,
            name: t.plan_name,
            code: t.plan_code,
            minAge: t.plan_minAge,
            maxAge: t.plan_maxAge,
            brochureUrl: t.plan_brochureUrl,
            description: t.plan_description,
          }
        : null,
    }));

    return res.status(200).json({
      message: "Templates fetched successfully.",
      templates: formattedTemplates,
    });
  } catch (error) {
    console.error("getTemplatesForAdvisor error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
export const getPlansForAdvisor = async (req, res) => {
  try {
    const { companyId, age } = req.query;

    if (!companyId) {
      return res.status(400).json({
        message: "companyId is required.",
      });
    }

    const params = [Number(companyId)];

    let ageCondition = "";

    if (age) {
      ageCondition = `
        AND (minAge IS NULL OR minAge <= ?)
        AND (maxAge IS NULL OR maxAge >= ?)
      `;

      params.push(Number(age), Number(age));
    }

    const [plans] = await db.query(
      `SELECT *
       FROM \`Plan\`
       WHERE companyId = ?
       AND isActive = 1
       ${ageCondition}
       ORDER BY name ASC`,
      params
    );

    return res.status(200).json({
      message: "Plans fetched successfully.",
      plans,
    });
  } catch (error) {
    console.error("getPlansForAdvisor error:", error);

    return res.status(500).json({
      message: "Server error.",
    });
  }
};
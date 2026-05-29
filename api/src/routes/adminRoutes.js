import express from "express";

import {
  getAllCompanies,
  createCompany,
  updateCompany,
  toggleCompanyStatus,

  getAllPlansAdmin,
  createInsurancePlan,
  updateInsurancePlan,
  toggleInsurancePlanStatus,

  getAllAdvisors,
  createAdvisor,
  updateAdvisor,
  resetAdvisorPassword,
  toggleAdvisorStatus,

  getPasswordResetRequests,
  completePasswordResetRequest,
  rejectPasswordResetRequest,

  createTemplate,
  getAllTemplates,
  updateTemplate,
  toggleTemplateStatus,
  deleteTemplate,

  getAdvisorPerformance,
  getAdvisorLeadsForAdmin,
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   COMPANY MANAGEMENT
========================= */
router.get("/companies", protect, adminOnly, getAllCompanies);
router.post("/companies", protect, adminOnly, createCompany);
router.put("/companies/:companyId", protect, adminOnly, updateCompany);
router.patch("/companies/:companyId/toggle", protect, adminOnly, toggleCompanyStatus);

/* =========================
   INSURANCE PLAN MANAGEMENT
========================= */
router.get("/plans", protect, adminOnly, getAllPlansAdmin);
router.post("/plans", protect, adminOnly, createInsurancePlan);
router.put("/plans/:planId", protect, adminOnly, updateInsurancePlan);
router.patch("/plans/:planId/toggle", protect, adminOnly, toggleInsurancePlanStatus);

/* =========================
   ADVISOR MANAGEMENT
========================= */
router.get("/advisors", protect, adminOnly, getAllAdvisors);
router.post("/advisors", protect, adminOnly, createAdvisor);
router.put("/advisors/:advisorId", protect, adminOnly, updateAdvisor);
router.patch("/advisors/:advisorId/password", protect, adminOnly, resetAdvisorPassword);
router.patch("/advisors/:advisorId/toggle", protect, adminOnly, toggleAdvisorStatus);

/* =========================
   PASSWORD RESET REQUESTS
========================= */
router.get("/password-requests", protect, adminOnly, getPasswordResetRequests);
router.post("/password-requests/:requestId/complete", protect, adminOnly, completePasswordResetRequest);
router.post("/password-requests/:requestId/reject", protect, adminOnly, rejectPasswordResetRequest);

/* =========================
   TEMPLATE MANAGEMENT
========================= */
router.get("/templates", protect, adminOnly, getAllTemplates);
router.post("/templates", protect, adminOnly, createTemplate);
router.put("/templates/:templateId", protect, adminOnly, updateTemplate);
router.patch("/templates/:templateId/toggle", protect, adminOnly, toggleTemplateStatus);
router.delete("/templates/:templateId", protect, adminOnly, deleteTemplate);

/* =========================
   PERFORMANCE
========================= */
router.get("/advisor-performance", protect, adminOnly, getAdvisorPerformance);
router.get("/advisor-leads/:advisorId", protect, adminOnly, getAdvisorLeadsForAdmin);
router.get("/advisors/:advisorId/leads", protect, adminOnly, getAdvisorLeadsForAdmin);
router.get("/advisors/performance", protect, adminOnly, getAdvisorPerformance);

export default router;
import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getAllSubscriptions,
  getSubscriptionPlans,
  updateSubscriptionPlan,
  activateAdvisor,
  updateAdvisorSubscription,
  deactivateAdvisor,
  getMySubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

/* ── Admin routes ── */
router.get("/",                                    protect, adminOnly, getAllSubscriptions);
router.get("/plans",                               protect, adminOnly, getSubscriptionPlans);
router.put("/plans/:planId",                       protect, adminOnly, updateSubscriptionPlan);
router.post("/advisors/:advisorId/activate",       protect, adminOnly, activateAdvisor);
router.patch("/advisors/:advisorId/update",        protect, adminOnly, updateAdvisorSubscription);
router.patch("/advisors/:advisorId/deactivate",    protect, adminOnly, deactivateAdvisor);

/* ── Advisor route ── */
router.get("/my",                                  protect, getMySubscription);

export default router;
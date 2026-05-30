import express from "express";
import { createPlan, getPlans } from "../controllers/planController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getPlans);
router.post("/", protect, adminOnly, createPlan);

export default router;
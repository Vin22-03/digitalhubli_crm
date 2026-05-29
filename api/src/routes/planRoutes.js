import express from "express";
import { createPlan, getPlans } from "../controllers/planController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getPlans);
router.post("/", protect, createPlan);

export default router;
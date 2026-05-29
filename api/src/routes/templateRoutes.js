import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getTemplatesForAdvisor,
  getPlansForAdvisor,
} from "../controllers/templateController.js";

const router = express.Router();

router.get("/plans", protect, getPlansForAdvisor);
router.get("/", protect, getTemplatesForAdvisor);

export default router;
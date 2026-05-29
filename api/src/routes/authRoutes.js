import express from "express";
import {
  registerAdvisor,
  login,
  forgotPasswordRequest,
  getMe,
  getPublicCompanies,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// public routes
router.post("/signup",                registerAdvisor);
router.post("/login",                 login);
router.post("/forgot-password-request", forgotPasswordRequest);
router.get("/companies",              getPublicCompanies); // for signup dropdown

// protected
router.get("/me", protect, getMe);

export default router;
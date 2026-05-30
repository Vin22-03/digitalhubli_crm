import express from "express";
import {
  registerAdvisor,
  login,
  forgotPasswordRequest,
  resetPasswordWithOTP,
  getMe,
  getPublicCompanies,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// public routes
router.post("/signup",                registerAdvisor);
router.post("/login",                 login);
router.post("/forgot-password-request", forgotPasswordRequest);
router.post("/reset-password",        resetPasswordWithOTP);
router.get("/companies",              getPublicCompanies); // for signup dropdown

// protected
router.get("/me", protect, getMe);

export default router;
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOrder,
  verifyPayment,
  getQuote,
  razorpayWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

/* Public — needed because a brand-new advisor (isActive=0)
   cannot log in yet, so they pay from the signup success screen.
   The amount is computed on the server, so this is safe. */
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

/* Authenticated — used by logged-in advisors on the renewal page */
router.get("/quote", protect, getQuote);

/* Optional webhook. IMPORTANT: it needs the RAW body, not parsed JSON.
   Do NOT mount this router behind the global express.json().
   Instead, register the webhook directly in app.js BEFORE express.json():

     app.post("/payments/webhook",
       express.raw({ type: "application/json" }),
       razorpayWebhook);

   (Left here for reference; prefer the app.js registration above.) */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

export default router;
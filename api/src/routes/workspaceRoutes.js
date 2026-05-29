import express from "express";
import { BRAND } from "../config/branding.js";

const router = express.Router();

// Returns public branding info — no auth needed (used on login/signup pages)
router.get("/me", (req, res) => {
  res.json({
    workspace: {
      businessName: BRAND.companyName,
      tagline: BRAND.tagline,
      supportPhone: BRAND.supportPhone,
      logoUrl: null,
    },
  });
});

export default router;
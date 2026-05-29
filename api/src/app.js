import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import chatflowRoutes from "./routes/chatflowRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";

import { db } from "./config/db.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsPath = process.env.UPLOADS_DIR || "/home/u674178439/uploads";
const appPath = path.join(__dirname, "../public");

const uploadFolders = [
  uploadsPath,
  path.join(uploadsPath, "resources"),
  path.join(uploadsPath, "profiles"),
  path.join(uploadsPath, "brands"),
];

uploadFolders.forEach((folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

app.use(cors());
app.use(express.json());

/* =========================
   STATIC FILES
========================= */
app.use("/uploads", express.static(uploadsPath));
app.use(express.static(appPath));

/* =========================
   HEALTH CHECKS
========================= */
app.get("/api-health", (req, res) => {
  res.send("API is running 🚀");
});

app.get("/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");

    res.json({
      success: true,
      message: "mysql2 database connected successfully",
      result: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "mysql2 database connection failed",
      error: error.message,
    });
  }
});

/* =========================
   API ROUTES
========================= */
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/templates", templateRoutes);
app.use("/leads", leadRoutes);
app.use("/contacts", contactRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/profile", profileRoutes);
app.use("/resources", resourceRoutes);
app.use("/workspace", workspaceRoutes);
app.use("/api/plans", planRoutes);
app.use("/subscriptions", subscriptionRoutes);

/* =========================
   PUBLIC CHATFLOW ROUTES
========================= */
app.use("/", chatflowRoutes);

/* =========================
   REACT FALLBACK
========================= */
app.get("*", (req, res) => {
  if (req.accepts("html")) {
    return res.sendFile(path.join(appPath, "index.html"));
  }

  return res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
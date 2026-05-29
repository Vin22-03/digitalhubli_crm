import express from "express";
import { renderAdvisorChatflow } from "../controllers/chatflowController.js";

const router = express.Router();

router.get("/tata-aig-medicare-select/:phone", renderAdvisorChatflow);

// optional old URL support
router.get("/chatflow/:phone", renderAdvisorChatflow);

export default router;
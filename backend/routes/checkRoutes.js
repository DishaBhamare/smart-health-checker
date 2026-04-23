import express from "express";
import {
  checkSymptoms,
  getUserLastCheck,
  getUserHistory
} from "../controllers/checkController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Protected Routes

// Run diagnosis
router.post("/check", protect, checkSymptoms);

// Get last check of specific user
router.get("/last/:userId", protect, getUserLastCheck);

// 🔥 Get full history of logged-in user
router.get("/history", protect, getUserHistory);

export default router;
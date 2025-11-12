import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreak } from "../controllers/streak.controller.js";

const router = express.Router();

router.get("/:userId", protectRoute, getStreak);

export default router;

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { trackEvent, getAnalytics, getSystemStats } from "../controllers/analytics.controller.js";

const router = express.Router();

router.post("/track", protectRoute, trackEvent);
router.get("/", protectRoute, getAnalytics);
router.get("/stats", protectRoute, getSystemStats);

export default router;

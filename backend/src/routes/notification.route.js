import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { storeToken, updateSettings, getSettings } from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/token", protectRoute, storeToken);
router.get("/settings", protectRoute, getSettings);
router.put("/settings", protectRoute, updateSettings);

export default router;
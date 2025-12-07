import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { callLimiter } from "../middleware/rateLimiter.middleware.js";
import { initiateCall, getCallHistory, updateCallStatus } from "../controllers/call.controller.js";

const router = express.Router();

router.post("/initiate", protectRoute, callLimiter, initiateCall);
router.get("/history", protectRoute, getCallHistory);
router.put("/:callId/status", protectRoute, updateCallStatus);

export default router;

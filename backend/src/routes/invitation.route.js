import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendInvitation, getInvitations } from "../controllers/invitation.controller.js";

const router = express.Router();

router.post("/send", protectRoute, sendInvitation);
router.get("/", protectRoute, getInvitations);

export default router;

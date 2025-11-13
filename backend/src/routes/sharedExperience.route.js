import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createSharedExperience,
  joinSharedExperience,
  leaveSharedExperience,
  updateSharedExperience,
  getActiveExperiences
} from "../controllers/sharedExperience.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createSharedExperience);
router.post("/:id/join", protectRoute, joinSharedExperience);
router.post("/:id/leave", protectRoute, leaveSharedExperience);
router.put("/:id/update", protectRoute, updateSharedExperience);
router.get("/chat/:chatId", protectRoute, getActiveExperiences);

export default router;
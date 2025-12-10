import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getProgress,
  addXP,
  updateGameResult,
  getLeaderboard,
  purchaseCosmetic,
  equipCosmetic,
} from "../controllers/gameProgress.controller.js";

const router = express.Router();

router.get("/", protectRoute, getProgress);
router.post("/xp", protectRoute, addXP);
router.post("/game-result", protectRoute, updateGameResult);
router.get("/leaderboard", protectRoute, getLeaderboard);
router.post("/cosmetic/purchase", protectRoute, purchaseCosmetic);
router.post("/cosmetic/equip", protectRoute, equipCosmetic);

export default router;

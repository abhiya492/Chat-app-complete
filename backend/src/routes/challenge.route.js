import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createChallenge,
  respondToChallenge,
  getPlayerStats,
  updateGameResult,
  getOnlinePlayers,
} from "../controllers/challenge.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createChallenge);
router.post("/respond/:challengeId", protectRoute, respondToChallenge);
router.get("/stats/:userId?", protectRoute, getPlayerStats);
router.post("/result", protectRoute, updateGameResult);
router.post("/online-players", protectRoute, getOnlinePlayers);

export default router;

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createRoom,
  getActiveRooms,
  getRoom,
  endRoom,
  getUserRooms,
} from "../controllers/room.controller.js";

const router = express.Router();

router.post("/", protectRoute, createRoom);
router.get("/", getActiveRooms);
router.get("/my-rooms", protectRoute, getUserRooms);
router.get("/:id", getRoom);
router.delete("/:id", protectRoute, endRoom);

export default router;

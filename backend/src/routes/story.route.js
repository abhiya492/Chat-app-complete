import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createStory,
  getStories,
  getMyStories,
  viewStory,
  deleteStory,
  getStoryViewers,
} from "../controllers/story.controller.js";

const router = express.Router();

router.post("/", protectRoute, createStory);
router.get("/", protectRoute, getStories);
router.get("/my", protectRoute, getMyStories);
router.post("/view/:storyId", protectRoute, viewStory);
router.delete("/:storyId", protectRoute, deleteStory);
router.get("/viewers/:storyId", protectRoute, getStoryViewers);

export default router;

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { messageLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMember,
  removeMember,
  updateMemberRole,
  joinByInviteCode,
  updateGroupSettings,
  deleteGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

// Group CRUD
router.post("/", protectRoute, messageLimiter, createGroup);
router.get("/", protectRoute, getUserGroups);
router.get("/:groupId", protectRoute, getGroupDetails);
router.put("/:groupId", protectRoute, updateGroupSettings);
router.delete("/:groupId", protectRoute, deleteGroup);

// Member management
router.post("/:groupId/members", protectRoute, addMember);
router.delete("/:groupId/members/:userId", protectRoute, removeMember);
router.put("/:groupId/members/:userId/role", protectRoute, updateMemberRole);

// Invite system
router.post("/join", protectRoute, joinByInviteCode);

export default router;
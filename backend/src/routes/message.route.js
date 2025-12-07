import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getMessages, 
  getUsersForSidebar, 
  sendMessage,
  addReaction,
  removeReaction,
  editMessage,
  deleteMessage,
  markAsDelivered,
  markAsRead,
  pinMessage,
  forwardMessage,
  searchMessages,
  getPinnedMessages,
  deleteChat
} from "../controllers/message.controller.js";
import { getScheduledMessages, cancelScheduledMessage } from "../controllers/scheduledMessage.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/search", protectRoute, searchMessages);
router.get("/scheduled", protectRoute, getScheduledMessages);
router.get("/pinned/:id", protectRoute, getPinnedMessages);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/react/:messageId", protectRoute, addReaction);
router.post("/delivered/:messageId", protectRoute, markAsDelivered);
router.post("/read/:messageId", protectRoute, markAsRead);
router.post("/pin/:messageId", protectRoute, pinMessage);
router.post("/forward/:messageId", protectRoute, forwardMessage);
router.delete("/react/:messageId", protectRoute, removeReaction);
router.put("/edit/:messageId", protectRoute, editMessage);
router.delete("/chat/:userId", protectRoute, deleteChat);
router.delete("/scheduled/:messageId", protectRoute, cancelScheduledMessage);
router.delete("/:messageId", protectRoute, deleteMessage);

export default router;

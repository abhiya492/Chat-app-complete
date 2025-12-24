import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { messageLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  sendContactRequest,
  acceptContactRequest,
  rejectContactRequest,
  getContacts,
  getPendingRequests,
  getSentRequests,
  removeContact,
  updateContact,
  searchUsers,
  getContactGroups,
} from "../controllers/contact.controller.js";

const router = express.Router();

// Contact management
router.get("/", protectRoute, getContacts);
router.get("/pending", protectRoute, getPendingRequests);
router.get("/sent", protectRoute, getSentRequests);
router.get("/groups", protectRoute, getContactGroups);
router.get("/search", protectRoute, searchUsers);

router.post("/request/:userId", protectRoute, messageLimiter, sendContactRequest);
router.put("/accept/:requestId", protectRoute, acceptContactRequest);
router.delete("/reject/:requestId", protectRoute, rejectContactRequest);
router.delete("/:contactId", protectRoute, removeContact);
router.put("/:contactId", protectRoute, updateContact);

export default router;
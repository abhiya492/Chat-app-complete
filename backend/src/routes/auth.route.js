import express from 'express';
import { checkAuth, login, logout, signup, updateProfile, forgotPassword, resetPassword, blockUser, unblockUser, updatePublicKey } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.middleware.js';


const router = express.Router();

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

router.put("/update-profile",protectRoute,updateProfile);
router.put("/update-public-key",protectRoute,updatePublicKey);
router.post("/block/:userId",protectRoute,blockUser);
router.post("/unblock/:userId",protectRoute,unblockUser);

router.get("/check",protectRoute,checkAuth);

router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.post("/test-email", async (req, res) => {
  try {
    await sendOTPEmail(process.env.EMAIL_USER, "123456");
    res.json({ message: "Test email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
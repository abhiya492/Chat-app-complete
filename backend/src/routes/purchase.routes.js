import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getProducts,
    getProduct,
    createOrder,
    verifyPayment,
    getUserPurchases,
    applyPurchasedItem,
    addToWallet,
    verifyWalletRecharge,
    purchaseWithWallet,
} from "../controllers/purchase.controller.js";

const router = express.Router();

// Public routes
router.get("/products", getProducts);
router.get("/products/:id", getProduct);

// Protected routes
router.use(protectRoute);

// Purchase operations
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/my-purchases", getUserPurchases);
router.post("/apply-item", applyPurchasedItem);

// Wallet operations
router.post("/wallet/add", addToWallet);
router.post("/wallet/verify", verifyWalletRecharge);
router.post("/wallet/purchase", purchaseWithWallet);

export default router;
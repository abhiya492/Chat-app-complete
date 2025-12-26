import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// UPI Payment Details
const UPI_CONFIG = {
  upiId: process.env.UPI_ID || 'yourname@paytm', // Your UPI ID
  qrCode: process.env.QR_CODE_URL || 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=QR+CODE', // Static QR code image
  accountName: process.env.ACCOUNT_NAME || 'Chat App Business'
};

// Subscription plans with Indian pricing
const PLANS = {
  free: { price: 0, duration: 0, features: ['Unlimited messages', 'Voice & Video calls (with ads)', '100MB storage', '10 users max', 'Basic chat features', 'Ads supported'] },
  pro: { price: 199, duration: 30, features: ['Ad-free experience', 'Ad-free calls', '10GB storage', '100 users', 'File sharing', 'Priority support'] },
  enterprise: { price: 499, duration: 30, features: ['Everything in Pro', '50GB storage', 'Unlimited users', 'Custom branding', 'Admin dashboard', 'API access', 'White-label'] }
};

// Get payment details
router.get('/payment-info/:plan', protectRoute, async (req, res) => {
  try {
    const { plan } = req.params;
    
    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const paymentId = `PAY_${Date.now()}_${req.user._id}`;
    
    // Generate UPI payment URL
    const upiUrl = `upi://pay?pa=${UPI_CONFIG.upiId}&pn=${UPI_CONFIG.accountName}&am=${PLANS[plan].price}&cu=INR&tn=ChatApp ${plan} subscription - ${paymentId}`;
    
    res.json({
      paymentId,
      plan,
      amount: PLANS[plan].price,
      upiId: UPI_CONFIG.upiId,
      upiUrl,
      qrCode: UPI_CONFIG.qrCode,
      instructions: [
        `Pay ₹${PLANS[plan].price} to UPI ID: ${UPI_CONFIG.upiId}`,
        `Use reference: ${paymentId}`,
        'Upload payment screenshot below',
        'We will verify and activate your subscription within 24 hours'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload payment proof
router.post('/upload-proof', protectRoute, upload.single('screenshot'), async (req, res) => {
  try {
    const { paymentId, plan, transactionId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Payment screenshot required' });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    
    // Save payment request
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        paymentRequests: {
          paymentId,
          plan,
          amount: PLANS[plan].price,
          transactionId,
          screenshot: result.secure_url,
          status: 'pending',
          createdAt: new Date()
        }
      }
    });

    res.json({ 
      message: 'Payment proof uploaded successfully! We will verify and activate your subscription within 24 hours.',
      paymentId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Verify payments
router.post('/verify/:paymentId', protectRoute, async (req, res) => {
  try {
    // Only admin can verify (add admin check)
    const { paymentId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    
    const user = await User.findOne({ 'paymentRequests.paymentId': paymentId });
    if (!user) {
      return res.status(404).json({ error: 'Payment request not found' });
    }

    const paymentRequest = user.paymentRequests.find(p => p.paymentId === paymentId);
    
    if (status === 'approved') {
      // Activate subscription
      user.subscription = {
        plan: paymentRequest.plan,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + PLANS[paymentRequest.plan].duration * 24 * 60 * 60 * 1000),
        paymentId
      };
    }
    
    // Update payment status
    paymentRequest.status = status;
    paymentRequest.verifiedAt = new Date();
    
    await user.save();
    
    res.json({ message: `Payment ${status} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get plans
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

// Get user subscription status
router.get('/status', protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription paymentRequests');
    res.json({
      subscription: user.subscription || { plan: 'free', status: 'active' },
      pendingPayments: user.paymentRequests?.filter(p => p.status === 'pending') || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
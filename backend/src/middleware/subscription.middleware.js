import User from '../models/user.model.js';
import Message from '../models/message.model.js';

export const checkSubscriptionLimits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const subscription = user.subscription || { plan: 'free', status: 'active' };

    // Check if subscription is active
    if (subscription.status !== 'active' || (subscription.endDate && new Date() > subscription.endDate)) {
      subscription.plan = 'free';
      subscription.status = 'expired';
    }

    // Define limits
    const limits = {
      free: { messages: -1, storage: 100 * 1024 * 1024, users: 10, ads: true }, // 100MB with ads
      pro: { messages: -1, storage: 10 * 1024 * 1024 * 1024, users: 100, ads: false }, // 10GB ad-free
      enterprise: { messages: -1, storage: 50 * 1024 * 1024 * 1024, users: -1, ads: false } // 50GB ad-free
    };

    const userLimits = limits[subscription.plan];

    // Check message limit for free users
    if (subscription.plan === 'free' && req.method === 'POST' && req.path.includes('message')) {
      const messageCount = await Message.countDocuments({
        $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      });

      if (messageCount >= userLimits.messages) {
        return res.status(403).json({ 
          error: 'Message limit reached. Upgrade to Pro for unlimited messages.',
          limit: 'messages',
          current: messageCount,
          max: userLimits.messages
        });
      }
    }

    req.subscription = subscription;
    req.limits = userLimits;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubscriptionStatus = async (userId) => {
  const user = await User.findById(userId);
  const subscription = user.subscription || { plan: 'free', status: 'active' };
  
  if (subscription.status !== 'active' || (subscription.endDate && new Date() > subscription.endDate)) {
    return { plan: 'free', status: 'expired' };
  }
  
  return subscription;
};
import Analytics from "../models/analytics.model.js";

export const trackEvent = async (req, res) => {
  try {
    const { event, data, sessionId } = req.body;
    const userId = req.user._id;

    await Analytics.create({
      userId,
      event,
      data,
      sessionId,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error tracking event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, event } = req.query;

    const query = { userId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (event) query.event = event;

    const analytics = await Analytics.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    const stats = await Analytics.aggregate([
      { $match: { userId } },
      { $group: { _id: "$event", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({ analytics, stats });
  } catch (error) {
    console.error("Error getting analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await Analytics.distinct("userId").then(arr => arr.length);
    const totalEvents = await Analytics.countDocuments();
    
    const eventStats = await Analytics.aggregate([
      { $group: { _id: "$event", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const recentActivity = await Analytics.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "fullName email");

    res.status(200).json({
      totalUsers,
      totalEvents,
      eventStats,
      recentActivity,
    });
  } catch (error) {
    console.error("Error getting system stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

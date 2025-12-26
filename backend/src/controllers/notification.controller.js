import User from "../models/user.model.js";

// Store FCM token
export const storeToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      fcmToken: token
    });

    res.status(200).json({ message: "Token stored successfully" });
  } catch (error) {
    console.error("Error storing FCM token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update notification settings
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const settings = req.body;

    await User.findByIdAndUpdate(userId, {
      notificationSettings: settings
    });

    res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get notification settings
export const getSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('notificationSettings');
    
    res.status(200).json(user.notificationSettings);
  } catch (error) {
    console.error("Error getting notification settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Check if notifications should be sent
const shouldSendNotification = (user, type) => {
  const settings = user.notificationSettings;
  
  if (!settings.enabled) return false;
  if (!settings[type]) return false;
  
  // Check quiet hours
  if (settings.quietHours.enabled) {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const { startTime, endTime } = settings.quietHours;
    
    if (startTime > endTime) {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      if (currentTime >= startTime || currentTime <= endTime) {
        return false;
      }
    } else {
      // Same day quiet hours (e.g., 12:00 to 14:00)
      if (currentTime >= startTime && currentTime <= endTime) {
        return false;
      }
    }
  }
  
  return true;
};

// Send notification (called when message is sent)
export const sendNotification = async (receiverId, title, body, type = 'messages', data = {}) => {
  try {
    const receiver = await User.findById(receiverId);
    if (!receiver?.fcmToken) return;
    
    // Check if user wants this type of notification
    if (!shouldSendNotification(receiver, type)) {
      console.log(`🔕 Notification blocked for ${receiver.fullName} (${type})`);
      return;
    }

    // In production, use Firebase Admin SDK
    console.log(`📱 Notification to ${receiver.fullName}:`, { title, body, data });
    
    // TODO: Implement Firebase Admin SDK
    // const message = {
    //   notification: { title, body },
    //   data,
    //   token: receiver.fcmToken,
    //   android: {
    //     notification: {
    //       sound: receiver.notificationSettings.soundEnabled ? 'default' : null,
    //       vibrate: receiver.notificationSettings.vibrationEnabled ? [200, 100, 200] : null
    //     }
    //   }
    // };
    // await admin.messaging().send(message);
    
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
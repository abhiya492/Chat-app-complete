import HealthData from '../models/healthData.model.js';
import HealthIntegrationService from '../services/healthIntegration.service.js';

export const connectDevice = async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceType, accessToken, healthData } = req.body;
    
    let result;
    
    switch (deviceType) {
      case 'fitbit':
        result = await HealthIntegrationService.syncFitbitData(userId, accessToken);
        break;
      case 'apple_health':
        result = await HealthIntegrationService.syncAppleHealthData(userId, healthData);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported device type' });
    }
    
    res.json({ message: 'Device connected successfully', data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHealthData = async (req, res) => {
  try {
    const { userId } = req.user;
    const { days = 7 } = req.query;
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const healthData = await HealthData.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    res.json(healthData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHealthInsights = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const latestData = await HealthData.findOne({ userId }).sort({ date: -1 });
    
    if (!latestData) {
      return res.json({ message: 'No health data available' });
    }
    
    const recommendations = HealthIntegrationService.getHealthBasedRecommendations(latestData);
    
    const insights = {
      energyLevel: latestData.wellnessImpact?.energyLevel || 5,
      sleepScore: latestData.sleep?.quality || 3,
      activityScore: latestData.fitness?.steps > 8000 ? 5 : 3,
      recommendations,
      lastSync: latestData.connectedDevices?.[0]?.lastSync,
    };
    
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const syncHealthData = async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceType } = req.body;
    
    // Trigger sync for connected devices
    let result;
    
    if (deviceType === 'fitbit') {
      result = await HealthIntegrationService.syncFitbitData(userId, 'mock_token');
    }
    
    res.json({ message: 'Sync completed', data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const disconnectDevice = async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceType } = req.params;
    
    await HealthData.updateMany(
      { userId },
      { $pull: { connectedDevices: { type: deviceType } } }
    );
    
    res.json({ message: 'Device disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
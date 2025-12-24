import HealthData from '../models/healthData.model.js';

class HealthIntegrationService {
  // Simulate Fitbit API integration
  static async syncFitbitData(userId, accessToken) {
    try {
      // Mock Fitbit API call
      const mockData = {
        steps: Math.floor(Math.random() * 10000) + 2000,
        calories: Math.floor(Math.random() * 2000) + 1500,
        activeMinutes: Math.floor(Math.random() * 60) + 30,
        heartRate: {
          resting: Math.floor(Math.random() * 20) + 60,
          average: Math.floor(Math.random() * 30) + 80,
          max: Math.floor(Math.random() * 50) + 150,
        },
        sleep: {
          duration: Math.floor(Math.random() * 120) + 360, // 6-8 hours
          quality: Math.floor(Math.random() * 3) + 3, // 3-5
          deepSleep: Math.floor(Math.random() * 60) + 90,
          remSleep: Math.floor(Math.random() * 60) + 60,
        }
      };

      return await this.updateHealthData(userId, 'fitbit', mockData);
    } catch (error) {
      throw new Error('Fitbit sync failed: ' + error.message);
    }
  }

  // Simulate Apple Health integration
  static async syncAppleHealthData(userId, healthData) {
    const processedData = {
      steps: healthData.stepCount || 0,
      calories: healthData.activeEnergyBurned || 0,
      heartRate: {
        resting: healthData.restingHeartRate,
        average: healthData.heartRate,
      },
      sleep: {
        duration: healthData.sleepAnalysis?.duration || 0,
        bedtime: healthData.sleepAnalysis?.bedtime,
        wakeTime: healthData.sleepAnalysis?.wakeTime,
      }
    };

    return await this.updateHealthData(userId, 'apple_health', processedData);
  }

  // Update health data in database
  static async updateHealthData(userId, deviceType, data) {
    const today = new Date().toDateString();
    
    const healthRecord = await HealthData.findOneAndUpdate(
      { userId, date: { $gte: new Date(today) } },
      {
        $set: {
          'fitness.steps': data.steps,
          'fitness.calories': data.calories,
          'fitness.activeMinutes': data.activeMinutes,
          'fitness.heartRate': data.heartRate,
          'sleep.duration': data.sleep?.duration,
          'sleep.quality': data.sleep?.quality,
          'sleep.deepSleep': data.sleep?.deepSleep,
          'sleep.remSleep': data.sleep?.remSleep,
          'wellnessImpact.energyLevel': this.calculateEnergyLevel(data),
        },
        $addToSet: {
          connectedDevices: {
            type: deviceType,
            lastSync: new Date(),
          }
        }
      },
      { upsert: true, new: true }
    );

    return healthRecord;
  }

  // Calculate energy level from health data
  static calculateEnergyLevel(data) {
    let energy = 5; // baseline
    
    if (data.sleep?.duration > 420) energy += 2; // 7+ hours sleep
    if (data.steps > 8000) energy += 1; // active day
    if (data.heartRate?.resting < 70) energy += 1; // good fitness
    
    return Math.min(10, Math.max(1, energy));
  }

  // Analyze health impact on mood
  static analyzeHealthMoodCorrelation(healthData, moodData) {
    let correlation = 0;
    
    // Good sleep = better mood
    if (healthData.sleep?.duration > 420 && moodData.score > 3) correlation += 0.3;
    
    // Exercise = better mood
    if (healthData.fitness?.activeMinutes > 30 && moodData.score > 3) correlation += 0.4;
    
    // Poor sleep = worse mood
    if (healthData.sleep?.duration < 300 && moodData.score < 3) correlation -= 0.3;
    
    return Math.max(-1, Math.min(1, correlation));
  }

  // Get wellness recommendations based on health data
  static getHealthBasedRecommendations(healthData) {
    const recommendations = [];
    
    if (healthData.sleep?.duration < 360) {
      recommendations.push({
        type: 'sleep',
        message: 'You got less than 6 hours of sleep. Consider going to bed earlier tonight.',
        priority: 'high'
      });
    }
    
    if (healthData.fitness?.steps < 5000) {
      recommendations.push({
        type: 'activity',
        message: 'Low activity today. A short walk could boost your mood!',
        priority: 'medium'
      });
    }
    
    if (healthData.fitness?.heartRate?.resting > 80) {
      recommendations.push({
        type: 'stress',
        message: 'Elevated resting heart rate detected. Try some breathing exercises.',
        priority: 'high'
      });
    }
    
    return recommendations;
  }
}

export default HealthIntegrationService;
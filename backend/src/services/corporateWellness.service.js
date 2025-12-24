import CorporateWellness from '../models/corporateWellness.model.js';
import Wellness from '../models/wellness.model.js';
import User from '../models/user.model.js';

class CorporateWellnessService {
  static async generateTeamReport(organizationId, teamId) {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get team members
    const teamMembers = await User.find({ 
      organizationId, 
      teamId,
      isActive: true 
    });

    // Get wellness data for team
    const wellnessData = await Wellness.find({
      userId: { $in: teamMembers.map(m => m._id) },
      date: { $gte: weekAgo }
    });

    const metrics = this.calculateTeamMetrics(teamMembers, wellnessData);
    const recommendations = this.generateRecommendations(metrics);

    return {
      organizationId,
      teamId,
      teamMetrics: metrics,
      recommendations,
      generatedAt: new Date()
    };
  }

  static calculateTeamMetrics(teamMembers, wellnessData) {
    const totalMembers = teamMembers.length;
    const activeMembers = wellnessData.length;

    const avgMoodScore = wellnessData.reduce((sum, w) => sum + (w.mood?.score || 3), 0) / activeMembers || 3;
    const avgStressLevel = wellnessData.reduce((sum, w) => sum + (w.stress?.level || 0), 0) / activeMembers || 0;
    
    const breaksTaken = wellnessData.reduce((sum, w) => sum + (w.usage?.breaksTaken || 0), 0);
    const mindfulnessMinutes = wellnessData.reduce((sum, w) => sum + (w.mindfulMoments?.length * 2 || 0), 0);

    const highStressMembers = wellnessData.filter(w => w.stress?.level > 70).length;
    const lowMoodMembers = wellnessData.filter(w => w.mood?.score <= 2).length;

    return {
      totalMembers,
      activeMembers,
      avgMoodScore: Math.round(avgMoodScore * 10) / 10,
      avgStressLevel: Math.round(avgStressLevel),
      wellnessEngagement: Math.round((activeMembers / totalMembers) * 100),
      breaksTaken,
      mindfulnessMinutes,
      highStressMembers,
      lowMoodMembers,
      disengagedMembers: totalMembers - activeMembers
    };
  }

  static generateRecommendations(metrics) {
    const recommendations = [];

    // High stress recommendation
    if (metrics.avgStressLevel > 60) {
      recommendations.push({
        type: 'stress_reduction',
        priority: 'high',
        description: 'Team showing elevated stress levels',
        suggestedActions: [
          'Schedule team stress management workshop',
          'Implement mandatory break reminders',
          'Consider workload redistribution'
        ]
      });
    }

    // Low engagement recommendation
    if (metrics.wellnessEngagement < 50) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        description: 'Low wellness feature adoption',
        suggestedActions: [
          'Wellness feature training session',
          'Gamify wellness activities',
          'Leadership wellness modeling'
        ]
      });
    }

    // Low mood recommendation
    if (metrics.avgMoodScore < 2.5) {
      recommendations.push({
        type: 'mental_health',
        priority: 'high',
        description: 'Team morale appears low',
        suggestedActions: [
          'Team building activities',
          'One-on-one check-ins',
          'Mental health resources sharing'
        ]
      });
    }

    return recommendations;
  }

  static async getOrganizationOverview(organizationId) {
    const teams = await CorporateWellness.aggregate([
      { $match: { organizationId } },
      { $group: {
        _id: '$teamId',
        avgMood: { $avg: '$teamMetrics.avgMoodScore' },
        avgStress: { $avg: '$teamMetrics.avgStressLevel' },
        totalMembers: { $sum: '$teamMetrics.totalMembers' },
        engagement: { $avg: '$teamMetrics.wellnessEngagement' }
      }}
    ]);

    return {
      totalTeams: teams.length,
      totalEmployees: teams.reduce((sum, t) => sum + t.totalMembers, 0),
      organizationMood: teams.reduce((sum, t) => sum + t.avgMood, 0) / teams.length || 3,
      organizationStress: teams.reduce((sum, t) => sum + t.avgStress, 0) / teams.length || 0,
      avgEngagement: teams.reduce((sum, t) => sum + t.engagement, 0) / teams.length || 0,
      teams
    };
  }

  static getWellnessBenchmarks() {
    return {
      moodScore: { excellent: 4.5, good: 3.5, fair: 2.5, poor: 0 },
      stressLevel: { excellent: 30, good: 50, fair: 70, poor: 100 },
      engagement: { excellent: 80, good: 60, fair: 40, poor: 0 },
      breakFrequency: { excellent: 5, good: 3, fair: 1, poor: 0 }
    };
  }
}

export default CorporateWellnessService;
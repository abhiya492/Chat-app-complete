import CorporateWellnessService from '../services/corporateWellness.service.js';
import CorporateWellness from '../models/corporateWellness.model.js';

export const getTeamDashboard = async (req, res) => {
  try {
    const { organizationId, teamId } = req.params;
    
    const report = await CorporateWellnessService.generateTeamReport(organizationId, teamId);
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrganizationOverview = async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    const overview = await CorporateWellnessService.getOrganizationOverview(organizationId);
    const benchmarks = CorporateWellnessService.getWellnessBenchmarks();
    
    res.json({ ...overview, benchmarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWellnessTrends = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const trends = await CorporateWellness.find({
      organizationId,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateWellnessReport = async (req, res) => {
  try {
    const { organizationId, teamId } = req.body;
    
    const report = await CorporateWellnessService.generateTeamReport(organizationId, teamId);
    
    // Save report to database
    const savedReport = await CorporateWellness.create(report);
    
    res.json({ message: 'Report generated successfully', reportId: savedReport._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTeamRecommendations = async (req, res) => {
  try {
    const { organizationId, teamId } = req.params;
    
    const latestReport = await CorporateWellness.findOne({
      organizationId,
      teamId
    }).sort({ createdAt: -1 });
    
    if (!latestReport) {
      return res.status(404).json({ error: 'No reports found for this team' });
    }
    
    res.json({
      recommendations: latestReport.recommendations,
      metrics: latestReport.teamMetrics,
      generatedAt: latestReport.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
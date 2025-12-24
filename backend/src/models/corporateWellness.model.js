import mongoose from "mongoose";

const corporateWellnessSchema = new mongoose.Schema({
  organizationId: {
    type: String,
    required: true,
    index: true,
  },
  teamId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  teamMetrics: {
    totalMembers: Number,
    activeMembers: Number,
    avgMoodScore: Number,
    avgStressLevel: Number,
    wellnessEngagement: Number, // % of team using wellness features
    breaksTaken: Number,
    mindfulnessMinutes: Number,
  },
  departmentBreakdown: [{
    department: String,
    avgMood: Number,
    avgStress: Number,
    memberCount: Number,
  }],
  wellnessActivities: {
    cbtTechniquesUsed: Number,
    musicTherapySessions: Number,
    mindfulnessExercises: Number,
    wellnessChallengesCompleted: Number,
  },
  riskIndicators: {
    highStressMembers: Number,
    lowMoodMembers: Number,
    disengagedMembers: Number,
  },
  recommendations: [{
    type: { type: String, enum: ['team_building', 'stress_reduction', 'engagement', 'mental_health'] },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    description: String,
    suggestedActions: [String],
  }],
  anonymizedData: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

corporateWellnessSchema.index({ organizationId: 1, date: -1 });
corporateWellnessSchema.index({ teamId: 1, date: -1 });

const CorporateWellness = mongoose.model("CorporateWellness", corporateWellnessSchema);
export default CorporateWellness;
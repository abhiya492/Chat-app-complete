import mongoose from "mongoose";

const healthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  fitness: {
    steps: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    activeMinutes: { type: Number, default: 0 },
    heartRate: {
      resting: Number,
      average: Number,
      max: Number,
    },
    workouts: [{
      type: String,
      duration: Number,
      intensity: String,
      timestamp: Date,
    }],
  },
  sleep: {
    duration: { type: Number, default: 0 }, // minutes
    quality: { type: Number, min: 1, max: 5 },
    bedtime: Date,
    wakeTime: Date,
    deepSleep: Number,
    remSleep: Number,
    interruptions: Number,
  },
  vitals: {
    weight: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    temperature: Number,
    oxygenSaturation: Number,
  },
  connectedDevices: [{
    type: { type: String, enum: ['fitbit', 'apple_health', 'google_fit', 'garmin', 'samsung_health'] },
    deviceId: String,
    lastSync: Date,
  }],
  wellnessImpact: {
    moodCorrelation: Number, // -1 to 1
    stressCorrelation: Number,
    energyLevel: Number, // 1-10
  },
}, { timestamps: true });

healthDataSchema.index({ userId: 1, date: -1 });

const HealthData = mongoose.model("HealthData", healthDataSchema);
export default HealthData;
const mongoose = require('mongoose');

const timeTableSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examName: { type: String, required: true },
  examDate: { type: Date, required: true },
  hoursPerDay: { type: Number, required: true },
  availableSlots: [{ type: String }],
  
  // V2 Upgrades
  energyLevel: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  studyPreference: { type: String, enum: ['Morning', 'Night', 'Mixed'], default: 'Mixed' },
  
  subjects: [{
    name: { type: String, required: true },
    proficiency: { type: String, enum: ['Weak', 'Average', 'Strong'], default: 'Average' }
  }],
  
  prioritizeDifficult: { type: Boolean, default: true },
  scheduleType: { type: String, enum: ['Daily', 'Weekly', 'Monthly'], default: 'Daily' },
  unavailableDays: [{ type: String }], 
  
  // Specific Busy Blocks (e.g. Wednesday 16:00 to 19:00)
  unavailableTimeSlots: [{
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }],
  
  minBreakDuration: { type: Number, default: 15 },
  
  generatedSchedule: [{
    date: { type: Date },
    dayName: { type: String },
    timeSlot: { type: String }, // e.g., '09:00 AM - 11:00 AM' or 'Morning'
    subject: { type: String },
    durationHours: { type: Number },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('TimeTable', timeTableSchema);

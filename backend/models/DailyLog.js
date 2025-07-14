const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  comment: { type: String, required: true },
  percentage: { type: Number, default: 0 },
  studyTimeMinutes: { type: Number, default: 0 }, 
  status: { type: String, enum: ['pass', 'fail', null], default: null },
});

module.exports = mongoose.model('DailyLog', dailyLogSchema);

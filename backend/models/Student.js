// ✅ UPDATED Student.js (Mongoose Schema)
const mongoose = require('mongoose');

const embeddedSubjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  totalHours: { type: Number, default: 0 },
  creditHours: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }
}, { _id: false });

const activitySchema = new mongoose.Schema({
  date: { type: String, required: true },
  heading: { type: String, required: true },
  details: { type: String, required: true }
}, { _id: true });

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
  },
  grade: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  subjects: [embeddedSubjectSchema],
  gpa: {
    type: Number,
    default: 0,
  },
  activities: [activitySchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
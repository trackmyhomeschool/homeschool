// models/State.js
const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  isCompletionBased: {
    type: Boolean,
    default: true
  },
  creditDefinition: {
    type: String,
    required: true
  },
  hoursPerCredit: {
    type: Number,
    required: true
  },
  minCreditsRequired: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('State', stateSchema);
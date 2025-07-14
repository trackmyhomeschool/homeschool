const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  username:   { type: String, required: true, unique: true, trim: true },
  password:   { type: String, required: true },
  profilePicture: {
    type: String,
    default: '/images/default-avatar.jpg'
  },

  state:      { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
  minCreditsRequired: { type: Number, required: true },
hoursPerCredit: { type: Number, required: true },
  trialEndsAt:      { type: Date },
  isSubscribed:     { type: Boolean, default: false },
  subscriptionId:   { type: String }, 
  subscriptionStatus: { type: String },
  subscriptionEndsAt: { type: Date }, 
  cancelAtPeriodEnd: { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

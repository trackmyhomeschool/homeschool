const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  message: { type: String, required: true },
  sender: { type: String, required: true },    // "admin" or username
  receiver: { type: String, required: true },  // "admin" or username
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);

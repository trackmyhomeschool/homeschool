const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');
const { cleanupOldLogs } = require('./controllers/dailyLogController');

dotenv.config();

// Connect to MongoDB first
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Start server
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
    });

    // Run cleanup once immediately (optional)
    if (typeof cleanupOldLogs === 'function') {
      cleanupOldLogs();
      // Then schedule it every 24 hours
      setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);
    } else {
      console.warn('⚠️ cleanupOldLogs is not defined properly.');
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

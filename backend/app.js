// ✅ Updated app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const dailyLogRoutes = require('./routes/dailyLogRoutes');
const studentActivityRoutes = require('./routes/studentActivityRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const homeschoolResourceRoutes = require('./routes/homeschoolResourceRoutes');
const adminResourceRoutes = require('./routes/adminResourceRoutes');
const { webhookHandler } = require('./routes/paymentRoutes');
const app = express();

// 1. Stripe webhook route BEFORE express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), webhookHandler);


// 2. All normal middleware/routes AFTER
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dailylogs', dailyLogRoutes);
app.use('/api/students', studentActivityRoutes);
app.use('/api/admin', adminRoutes); // Handles both admin and adminChat
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/states', require('./routes/stateRoutes'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/homeschoolresources', homeschoolResourceRoutes);
app.use('/api/homeschoolresources', adminResourceRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Default route
app.get('/', (req, res) => {
  res.send("Track My Homeschool API is running...");
});

module.exports = app;

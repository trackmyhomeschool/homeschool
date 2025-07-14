// backend/routes/studentActivityRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  addActivity,
  getActivities,
  deleteActivity
} = require('../controllers/studentActivityController');

router.post('/:id/activities', protect, addActivity);
router.get('/:id/activities', protect, getActivities);
router.delete('/:studentId/activities/:activityId', protect, deleteActivity);

module.exports = router;

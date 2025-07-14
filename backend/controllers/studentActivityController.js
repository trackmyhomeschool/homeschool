// backend/controllers/studentActivityController.js
const Student = require('../models/Student');
const mongoose = require('mongoose');

// GET all activities for a student
exports.getActivities = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student.activities || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activities', error: err.message });
  }
};

// POST new activity for a student
// POST new activity for a student
exports.addActivity = async (req, res) => {
  const { heading, details, date } = req.body;

  if (!heading || !details || !date) {
    return res.status(400).json({ message: 'Missing activity fields' });
  }

  try {
    const student = await Student.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Just push the activity. Mongoose will add _id.
    student.activities.push({ date, heading, details });
    await student.save();

    // Get the last (newly added) activity
    const added = student.activities[student.activities.length - 1];

    res.status(201).json({ message: 'Activity added', activity: added });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add activity', error: err.message });
  }
};



// DELETE a specific activity from a student
exports.deleteActivity = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.studentId,
      user: req.user._id
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.activities = student.activities.filter(
      act => act._id.toString() !== req.params.activityId
    );

    await student.save();

    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete activity', error: err.message });
  }
};

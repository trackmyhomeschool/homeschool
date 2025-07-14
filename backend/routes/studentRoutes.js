// ✅ UPDATED studentRoutes.js (cleaned and fixed)
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');

const {
  createStudent,
  getStudents,
  deleteStudent,
  uploadStudentImage,
  getStudentById,
  getTodayLog,
  createOrRegisterSubject
} = require('../controllers/studentController');

router.use(protect);

// ✅ Student-related routes
router.post('/', uploadStudentImage, createStudent);
router.post('/register-subject', createOrRegisterSubject);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.get('/:studentId/subjects/:subjectId/log', getTodayLog);
router.delete('/:id', deleteStudent);

module.exports = router;

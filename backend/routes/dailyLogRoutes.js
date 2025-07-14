// 📁 routes/dailyLogRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createLog,
  getTodaysLog,
  hasLoggedSubjectBefore,
  updateCompletionStatus
} = require('../controllers/dailyLogController');

router.use(protect);

// Create or update log for today
router.post('/', createLog);

// Update completion status and adjust credit

router.put('/:studentId/:subjectName/update-completion', updateCompletionStatus);
router.get('/log/:studentId/:subjectName/:date', getTodaysLog);
router.get('/has-log/:studentId/:subjectName', hasLoggedSubjectBefore);


module.exports = router;

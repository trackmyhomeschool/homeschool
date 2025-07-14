const DailyLog = require('../models/DailyLog');
const Student = require('../models/Student');

// Create or Update a Daily Log
exports.createLog = async (req, res) => {
  try {
    const {
      studentId,
      subjectName,
      comment,
      percentage = 0,
      studyTimeMinutes = 0,
      status
    } = req.body;

    if (!comment) return res.status(400).json({ error: 'Comment is required' });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Find subject in student's subjects array
    let subject = student.subjects.find(
      s => s.subjectName.trim().toLowerCase() === subjectName.trim().toLowerCase()
    );

    // Auto-register subject if missing
    if (!subject) {
      subject = {
        subjectName: subjectName.trim(),
        totalHours: 0,
        creditHours: 0,
        isCompleted: false
      };
      student.subjects.push(subject);
    }

    const today = new Date().toISOString().split('T')[0];

    // --- Always create a new DailyLog (no upsert/update) ---
    const newLog = new DailyLog({
      student: studentId,
      subjectName: subject.subjectName,
      date: today,
      comment,
      studyTimeMinutes,
    });

    if (parseInt(student.grade) > 5) {
      const pct = parseFloat(percentage);
      newLog.percentage = Math.min(Math.max(pct || 0, 0), 100);
    } else {
      if (['pass', 'fail'].includes(status)) {
        newLog.status = status;
      }
    }

    await newLog.save();

    // Update totalHours and creditHours for subject (add this log's minutes)
    let embedded = student.subjects.find(
      s => s.subjectName.trim().toLowerCase() === subject.subjectName.trim().toLowerCase()
    );
    if (embedded) {
      const deltaHours = studyTimeMinutes / 60;
      embedded.totalHours = Math.max((embedded.totalHours || 0) + deltaHours, 0);
      embedded.creditHours = calculateCredits(embedded.totalHours, req.user.hoursPerCredit);
    }

    await recalculateStudentGPA(student);
    await student.save();

    return res.status(200).json({ message: 'Daily log saved successfully', log: newLog });

  } catch (error) {
    console.error('❌ Error saving daily log:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Credit Calculation
function calculateCredits(hours, hoursPerCredit) {
  if (hours >= hoursPerCredit) return 1;
  if (hours >= hoursPerCredit / 2) return 0.5;
  if (hours >= hoursPerCredit / 4) return 0.25;
  return 0;
}

// GPA Scale (unchanged)
function percentageToGPA(pct) {
  if (pct >= 90) return 4.0;
  if (pct >= 80) return 3.0;
  if (pct >= 70) return 2.0;
  if (pct >= 60) return 1.0;
  return 0.0;
}

// GPA Recalculation (unchanged)
async function recalculateStudentGPA(student) {
  const logs = await DailyLog.find({ student: student._id });
  const validLogs = logs.filter(log => log.percentage > 0 && log.studyTimeMinutes > 0);

  const totalCredits = student.subjects.reduce((sum, subj) => sum + (subj.creditHours || 0), 0);

  if (validLogs.length === 0 || totalCredits === 0) {
    student.gpa = 0;
  } else {
    const weightedTotal = validLogs.reduce((sum, log) => sum + (log.percentage * log.studyTimeMinutes), 0);
    const totalTime = validLogs.reduce((sum, log) => sum + log.studyTimeMinutes, 0);
    const weightedPercentage = weightedTotal / totalTime;

    student.gpa = percentageToGPA(weightedPercentage).toFixed(2);
  }
}

// Check if student has logged for a subject before
exports.hasLoggedSubjectBefore = async (req, res) => {
  const { studentId, subjectName } = req.params;
  try {
    const log = await DailyLog.findOne({ student: studentId, subjectName });
    return res.status(200).json({ hasLog: !!log });
  } catch (err) {
    console.error('❌ Error checking log history:', err);
    return res.status(500).json({ error: 'Failed to check log history' });
  }
};

// Fetch Today’s Log
exports.getTodaysLog = async (req, res) => {
  const { studentId, subjectName, date } = req.params;
  try {
    const log = await DailyLog.findOne({ student: studentId, subjectName, date });
    if (!log) return res.status(404).json({ message: 'No log found for today' });
    res.status(200).json(log);
  } catch (err) {
    console.error('❌ Error fetching today log:', err);
    res.status(500).json({ message: 'Failed to fetch log', error: err.message });
  }
};

// Update Completion Status

exports.updateCompletionStatus = async (req, res) => {
  const { studentId, subjectName } = req.params;
  const { isCompleted } = req.body;

  if (!studentId || !subjectName)
    return res.status(400).json({ error: 'studentId and subjectName are required' });

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    let embedded = student.subjects.find(
      s => (s.subjectName || '').trim().toLowerCase() === (subjectName || '').trim().toLowerCase()
    );

    // Auto-register subject if missing
    if (!embedded) {
      embedded = {
        subjectName: (subjectName || '').trim(),
        totalHours: 0,
        creditHours: 0,
        isCompleted: false
      };
      student.subjects.push(embedded);
    }

    // Update status and adjust credit
    const wasCompleted = embedded.isCompleted;
    embedded.isCompleted = isCompleted;

    if (isCompleted && !wasCompleted) {
      embedded.creditHours += 1;
    } else if (!isCompleted && wasCompleted) {
      embedded.creditHours = Math.max((embedded.creditHours || 0) - 1, 0);
    }

    await student.save();
    return res.status(200).json({ message: 'Completion status updated successfully' });
  } catch (error) {
    console.error('❌ Error updating completion status:', error);
    return res.status(500).json({ error: 'Failed to update completion status' });
  }
};

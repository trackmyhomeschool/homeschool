const Student = require('../models/Student');
const DailyLog = require('../models/DailyLog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('express-async-handler');

// 📂 Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/students';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `student-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });
exports.uploadStudentImage = upload.single('profilePicture');

// 👤 ✅ Create Student
exports.createStudent = async (req, res) => {
  try {
    const { firstName, lastName, birthDate, grade } = req.body;

    const profilePicture = req.file
      ? `/uploads/students/${req.file.filename}`
      : null;

    const student = await Student.create({
      firstName,
      lastName,
      birthDate,
      grade,
      profilePicture,
      user: req.user._id,
      subjects: []
    });

    res.status(201).json(student);
  } catch (err) {
    console.error('❌ Failed to create student:', err);
    res.status(500).json({ message: 'Student creation failed', error: err.message });
  }
};

// 📌 ✅ Add (or Register) Subject for a Student (no Subject model)
exports.createOrRegisterSubject = async (req, res) => {
  const { name, studentId } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Check if subject already exists (case-insensitive)
    let subject = student.subjects.find(
      s => s.subjectName.trim().toLowerCase() === name.trim().toLowerCase()
    );

    let alreadyRegistered = !!subject;

    if (!subject) {
      subject = {
        subjectName: name.trim(),
        totalHours: 0,
        creditHours: 0,
        isCompleted: false
      };
      student.subjects.push(subject);
      await student.save();
    }

    res.status(200).json({
      message: alreadyRegistered ? 'Already registered' : 'Subject created and registered',
      subject,
    });
  } catch (err) {
    console.error('❌ Error creating subject for student:', err);
    res.status(500).json({ message: 'Failed to create/register subject', error: err.message });
  }
};

// 📥 Get All Students
exports.getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({ user: req.user._id });
  res.status(200).json(students);
});

// 🔍 Get Specific Student by ID (with subjects and logs)
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // For each subject, gather today's logs if needed, etc.
    const fullSubjects = await Promise.all(student.subjects.map(async (s) => {
      const logs = await DailyLog.find({
        student: student._id,
        subjectName: s.subjectName
      }).sort({ date: -1 }).lean();

      return {
        ...s,
        dailyLogs: logs
      };
    }));

    res.json({ ...student, subjects: fullSubjects });
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get Today Log
exports.getTodayLog = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, user: req.user._id });
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = [];

  for (const subj of student.subjects) {
    // Find today's log for this subject
    const log = await DailyLog.findOne({
      student: student._id,
      subjectName: subj.subjectName,
      date: today
    });
    if (log) {
      todayLogs.push({ subject: subj.subjectName, log });
    }
  }

  res.status(200).json(todayLogs);
});

// 🗑️ Delete Student
exports.deleteStudent = asyncHandler(async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Delete profile picture if exists
    if (student.profilePicture && student.profilePicture.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', student.profilePicture.replace(/^\\?\\?/, ''));
      fs.unlink(imagePath, (err) => {
        if (err) console.error('⚠️ Failed to delete profile image:', err.message);
      });
    }

    // 🔥 Delete all daily logs of the student
    await DailyLog.deleteMany({ student: student._id });

    // ❌ Delete the student
    await Student.deleteOne({ _id: student._id });

    res.status(200).json({ message: 'Student and associated logs deleted successfully' });
  } catch (err) {
    console.error('❌ Server error during student deletion:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

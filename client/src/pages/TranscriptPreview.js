import React, { useRef, useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import './Transcript.css';
import { toPng } from 'html-to-image';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function TranscriptPreview() {
  const ref = useRef();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const calculateGPAFromPercent = (percent) => {
    if (percent >= 90) return 4.0;
    if (percent >= 80) return 3.0;
    if (percent >= 70) return 2.0;
    if (percent >= 60) return 1.0;
    return 0.0;
  };

  const exportToImage = () => {
    if (!ref.current) return;
    toPng(ref.current, { cacheBust: true, backgroundColor: 'white' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'transcript.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error('Export failed:', err));
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [studentRes, userRes] = await Promise.all([
         axios.get(`${process.env.REACT_APP_API_URL}/api/students/${id}`, { withCredentials: true }),
         axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, { withCredentials: true })

        ]);
        setStudent(studentRes.data);
        setUser(userRes.data);
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  if (loading)
    return <DashboardLayout><p className="text-center p-5">Loading...</p></DashboardLayout>;
  if (error || !student || !user)
    return <DashboardLayout><p className="text-danger text-center p-5">{error}</p></DashboardLayout>;

  const gradeNum = parseInt(student.grade);

  // Total credits logic (respects creditDef)
  const creditDef = user?.state?.creditDefinition || '';
  const isPrimary = !isNaN(gradeNum) && gradeNum <= 5;

  const totalCredits = student.subjects.reduce((sum, subj) => {
    if (creditDef === 'Carnegie Unit' || creditDef === 'Local') {
      if (!isNaN(gradeNum) && gradeNum >= 6) {
        return sum + (subj.creditHours || 0);
      } else {
        const logs = subj.dailyLogs || [];
        const passCount = logs.filter((l) => l.status === 'pass').length;
        const failCount = logs.filter((l) => l.status === 'fail').length;
        const passed = passCount >= failCount;
        return sum + (passed ? (subj.creditHours || 0) : 0);
      }
    } else {
      return sum + (subj.isCompleted ? (subj.creditHours || 0) : 0);
    }
  }, 0);

  return (
    <DashboardLayout>
      <div className="export-bar">
        <button onClick={exportToImage} className="export-button">Export as Image</button>
      </div>

      <div className="export-wrapper">
        <div ref={ref} className="transcript-container">
          <div className="black-header">Official Transcript</div>

          <div className="student-info-row">
            <div className="student-left">
              <p className="name-bold">{student.firstName} {student.lastName}</p>
              <p>DOB: {student.birthDate ? new Date(student.birthDate).toLocaleDateString() : 'N/A'}</p>
              <p>{user.email}</p>
            </div>
            <div className="student-right">
              <p className="school-name">Homeschool</p>
              <p>Grade: {student.grade || 'N/A'}</p>
              <p>{user?.state?.name || 'State not specified'}</p>
            </div>
          </div>

          <div className="courses-box">
            <div className="table-header">
              <div className="w-50">Course</div>
              <div>
                {(creditDef === 'Carnegie Unit' || creditDef === 'Local')
                  ? (gradeNum >= 6 ? 'Final Grade' : 'Pass/Fail')
                  : 'Status'}
              </div>
              <div>Credits Earned</div>
              <div>
                {(creditDef === 'Carnegie Unit' || creditDef === 'Local')
                  ? (gradeNum >= 6 ? 'Course GPA' : '—')
                  : '—'}
              </div>
            </div>

            {student.subjects.map((subj, idx) => {
              const credit = subj.creditHours || 0;
              const logs = subj.dailyLogs || [];

              let percent = null;
              if (subj.totalMarks > 0 && subj.obtainedMarks >= 0) {
                percent = (subj.obtainedMarks / subj.totalMarks) * 100;
              }
              if (percent === null || isNaN(percent)) {
                const validLogs = logs.filter(log => typeof log.percentage === 'number');
                if (validLogs.length > 0) {
                  const sum = validLogs.reduce((acc, log) => acc + log.percentage, 0);
                  percent = sum / validLogs.length;
                }
              }

              let finalGrade = 'Incomplete';
              let courseGPA = '–';
              let earnedCredits = '0.00';

              // Main customized logic:
              if (creditDef === 'Carnegie Unit' || creditDef === 'Local') {
                if (!isNaN(gradeNum) && gradeNum >= 6) {
                  // GPA logic
                  finalGrade = percent != null ? Math.round(percent) : '—';
                  courseGPA = percent != null ? calculateGPAFromPercent(percent).toFixed(2) : '–';
                  earnedCredits = credit.toFixed(2);
                } else {
                  // Pass/fail for primary grades
                  const passCount = logs.filter(l => l.status === 'pass').length;
                  const failCount = logs.filter(l => l.status === 'fail').length;
                  const isPass = passCount >= failCount;
                  finalGrade = logs.length > 0 ? (isPass ? 'Pass' : 'Fail') : 'Incomplete';
                  courseGPA = '–';
                  earnedCredits = (finalGrade === 'Pass' ? credit.toFixed(2) : '0.00');
                }
              } else {
                // For all other credit definitions, use isCompleted for all grades
                finalGrade = subj.isCompleted ? 'Completed' : 'Incomplete';
                courseGPA = '–';
                earnedCredits = subj.isCompleted ? credit.toFixed(2) : '0.00';
              }

              return (
                <div className="table-row" key={idx}>
                  <div className="w-50">{subj.subjectName}</div>
                  <div>{finalGrade}</div>
                  <div>{earnedCredits}</div>
                  <div>{courseGPA}</div>
                </div>
              );
            })}
          </div>

          <div className="transcript-summary">
            <p>
              {creditDef === 'Carnegie Unit' || creditDef === 'Local'
                ? (gradeNum >= 6 ? 'Total Cumulative Credits' : 'Total Passed Credits')
                : 'Total Completed Credits'
              }: {totalCredits.toFixed(2)}
            </p>
            {(creditDef === 'Carnegie Unit' || creditDef === 'Local') && gradeNum >= 6 ? (
              <>
                <p>Cumulative GPA: {(student.gpa || 0).toFixed(3)}</p>
                <p>Total Cumulative Credits: {totalCredits.toFixed(2)}</p>
              </>
            ) : (
              <p style={{ color: '#999' }}><i>GPA not applicable for this grade level or state</i></p>
            )}
          </div>

          <p className="transcript-scale">
            <strong>Grading/GPA Scale:</strong> A 90-100 (4.0), B 80-89 (3.0), C 70-79 (2.0), D 60-69 (1.0), F 0-59 (0.0)
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TranscriptPreview;

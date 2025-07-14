import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button, Form, Card } from 'react-bootstrap';
import axios from 'axios';

function ReportsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [userState, setUserState] = useState('');
  const [user, setUser] = useState(null); // <-- Add user for trial/premium check

  // Fetch user info
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  // Protect the page if not premium or trial
  useEffect(() => {
    if (user && !user.isTrial && !user.isPremium) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch students
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/students`, { withCredentials: true })

      .then((res) => {
        setStudents(res.data || []);
        if (res.data.length > 0) setSelectedStudent(res.data[0]._id);
      })
      .catch((err) => {
        console.error('Failed to fetch students:', err);
      });
  }, []);

  // Fetch user state
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/users/me`, { withCredentials: true })

      .then((res) => {
        setUserState(res.data?.state?.name || 'Unknown');
      })
      .catch((err) => {
        console.error('Failed to fetch user state:', err);
      });
  }, []);

  const handleDownloadDiploma = async () => {
    const student = students.find((s) => s._id === selectedStudent);
    if (!student) return;

    const studentName = `${student.firstName} ${student.lastName}`;
    const grade = student.grade || 'Unknown';

   const url = `${process.env.REACT_APP_DIPLOMA_API_URL}/diploma?name=${encodeURIComponent(
  studentName
)}&state=${encodeURIComponent(userState)}&grade=${encodeURIComponent(grade)}`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${studentName}_diploma.png`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Optionally show nothing if user check not loaded yet
  if (!user) return null;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 600, margin: '40px auto', background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
        {/* Access message if non-premium/non-trial */}
        {user && !user.isTrial && !user.isPremium && (
          <div style={{
            marginBottom: 24,
            padding: '14px 20px',
            borderRadius: 8,
            background: '#ffe9e6',
            color: '#c23c2a',
            fontWeight: 500,
            border: '1px solid #ffc1b5',
            textAlign: 'center'
          }}>
            Access denied. Please upgrade to premium to use this feature.
          </div>
        )}

        <h2 className="text-2xl font-bold text-center mb-4 text-blue-700">Reports</h2>
        <div className="d-flex justify-content-end mb-4">
          <Form.Select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{ width: '250px' }}
          >
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="d-flex justify-content-center gap-3">
          <Button
            variant="primary"
            disabled={!selectedStudent}
            onClick={() => navigate(`/reports/transcript/${selectedStudent}`)}
          >
            Transcript
          </Button>
          <Button
            variant="success"
            disabled={!selectedStudent}
            onClick={handleDownloadDiploma}
          >
            Diploma
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ReportsPage;

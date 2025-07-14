import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import './Dashboard.css';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00bfff', '#ff69b4'];

const gradeLabels = {
  0: 'Kindergarten',
  1: '1st Grade',
  2: '2nd Grade',
  3: '3rd Grade',
  4: '4th Grade',
  5: '5th Grade',
  6: '6th Grade',
  7: '7th Grade',
  8: '8th Grade',
  9: '9th Grade',
  10: '10th Grade',
};

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedData, setSelectedData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/students`, {
  credentials: 'include',
});
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Invalid student data received');
        setStudents(data);
        if (data.length > 0) setSelectedStudent(data[0]._id);
      } catch (err) {
        console.error('Failed to fetch students:', err.message);
        setStudents([]);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!selectedStudent) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/students/${selectedStudent}`, {
  credentials: 'include',
});

        const data = await res.json();
        setSelectedData(data);
      } catch (err) {
        console.error('Failed to fetch selected student data:', err.message);
      }
    };
    fetchStudentDetails();
  }, [selectedStudent]);

  const getLastWeekStudyHours = () => {
    if (!selectedData) return '0.0';
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    let minutes = 0;
    selectedData.subjects?.forEach(sub => {
      sub.dailyLogs?.forEach(log => {
        if (new Date(log.date) >= oneWeekAgo) {
          minutes += log.studyTimeMinutes || 0;
        }
      });
    });
    return (minutes / 60).toFixed(1);
  };

  const getMonthlyGpaData = () => {
    if (!selectedData) return [];
    const monthMap = {};
    selectedData.subjects?.forEach(sub => {
      sub.dailyLogs?.forEach(log => {
        if (log.percentage > 0) {
          const dateObj = new Date(log.date);
          const month = dateObj.toLocaleString('default', { month: 'short' });
          const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
          if (!monthMap[key]) monthMap[key] = { month, percentages: [] };
          monthMap[key].percentages.push(log.percentage);
        }
      });
    });
    return Object.values(monthMap)
      .map(({ month, percentages }) => {
        const avgPct = percentages.reduce((a, b) => a + b, 0) / percentages.length;
        const gpa = avgPct >= 90 ? 4 : avgPct >= 80 ? 3 : avgPct >= 70 ? 2 : avgPct >= 60 ? 1 : 0;
        return { month, gpa: parseFloat(gpa.toFixed(2)) };
      })
      .sort((a, b) => new Date(`1 ${a.month} 2020`) - new Date(`1 ${b.month} 2020`));
  };

  const getPieData = () => {
    if (!selectedData) return [];

    const creditDef = selectedData?.user?.state?.creditDefinition ||
      selectedData?.state?.creditDefinition || '';

    if (creditDef === 'Carnegie Unit' || creditDef === 'Local') {
      // By hours (as before)
      return selectedData.subjects?.map(sub => ({
        name: sub.subjectName || 'Unnamed',
        value: Math.round(sub.totalHours || 0)
      })) || [];
    } else {
      // By completed credits
      return selectedData.subjects
        ?.filter(sub => sub.isCompleted)
        .map(sub => ({
          name: sub.subjectName || 'Unnamed',
          value: Number(sub.creditHours) || 0
        })) || [];
    }
  };


  const getActivities = () => selectedData?.activities?.slice(0, 5).map(a => a.heading) || [];

  const totalStudents = students.length;
  const avgGPA = totalStudents > 0 ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / totalStudents).toFixed(2) : '0.00';

  return (
    <DashboardLayout>
      <h2 className="mb-4">Dashboard</h2>

      <div className="d-flex flex-wrap gap-4 mb-4">
        <div className="stat-card">
          <p className="label">Total Students</p>
          <h4>{totalStudents}</h4>
        </div>
        <div className="stat-card">
          <p className="label">Average GPA</p>
          <h4>{avgGPA}</h4>
        </div>
        <div className="stat-card">
          <p className="label">Study Hours (Week)</p>
          <h4>{getLastWeekStudyHours()}</h4>
        </div>
        <div className="stat-card">
          <p className="label">Activities</p>
          <h4>{selectedData?.activities?.length || 0}</h4>
        </div>
      </div>

      <div className="d-flex gap-4 flex-wrap mb-4">
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>Your Students</h5>
            <button className="btn btn-link p-0" onClick={() => navigate('/students')}>View all</button>
          </div>
          <div className="student-list">
            {students.slice(0, 4).map((s) => (
              <div key={s._id} className="student-entry d-flex align-items-center mb-3">
                <img
                  src={s.profilePicture?.startsWith('/uploads') ? `${process.env.REACT_APP_API_URL}${s.profilePicture}` : '/images/default-avatar.jpg'}

                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: '36px', height: '36px', objectFit: 'cover', marginRight: '10px' }}
                />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</div>
                  <div className="text-muted small">{gradeLabels[s.grade] || 'No grade'}</div>
                </div>
                <div style={{ fontWeight: 500 }}>
                  {s.gpa !== undefined && s.gpa !== null ? Number(s.gpa).toFixed(2) : '0.00'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 2, minWidth: '300px' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>Academic Progress</h5>
            <select className="form-select" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} style={{ width: '200px' }}>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>

          <div style={{ height: '240px', background: '#fff', padding: '16px', borderRadius: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getMonthlyGpaData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Line type="monotone" dataKey="gpa" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="d-flex gap-4 flex-wrap">
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '440px', background: '#fff', padding: '16px', borderRadius: '8px' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Recent Activity</h5>
            <button className="btn btn-link p-0" onClick={() => navigate('/activities')}>
              View all
            </button>
          </div>
          {getActivities().length === 0 ? (
            <p className="text-muted">No activities recorded yet.</p>
          ) : (
            <ul style={{ listStyle: 'disc', paddingLeft: '1.2rem' }}>
              {getActivities().map((heading, idx) => (
                <li key={idx} style={{ fontWeight: 'bold', fontSize: '1rem' }}>{heading}</li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <h5 className="mb-2">
            {selectedData?.user?.state?.creditDefinition === "Carnegie Unit" ||
              selectedData?.user?.state?.creditDefinition === "Local"
              ? "Study Hours by Subject"
              : "Credits Completed by Subject"}
          </h5>


          {getPieData().length === 0 ? (
            <p className="text-muted">No subject data available.</p>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart width={300} height={240}>
                <Pie data={getPieData()} cx="50%" cy="50%" labelLine={false} label={({ name }) => name} outerRadius={80} dataKey="value">
                  {getPieData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${parseInt(value)} hours`} />
                <Legend />
              </PieChart>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;

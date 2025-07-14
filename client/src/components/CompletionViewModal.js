import React, { useEffect, useState } from 'react';
import { Modal, Image } from 'react-bootstrap';
import axios from 'axios';

function CompletionViewModal({ show, handleClose, student }) {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!student || !student._id) return;

    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/students/${student._id}`);
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error('Error fetching student subjects:', err);
      }
    };

    fetchSubjects();
  }, [student]);

  const getProfilePicture = () => {
    if (!student?.profilePicture) return '/images/default-avatar.jpg';
    return student.profilePicture.startsWith('/uploads')
  ? `${process.env.REACT_APP_API_URL}${student.profilePicture}`
  : student.profilePicture;
  };

  const totalCredits = subjects.reduce((sum, subject) => {
    return sum + (subject.isCompleted ? 1 : 0);
  }, 0);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Completion Overview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px', paddingLeft: '10px' }}>
          <div className="text-center mb-4">
            <Image
              src={getProfilePicture()}
              roundedCircle
              width={120}
              height={120}
              style={{ objectFit: 'cover' }}
              onError={(e) => (e.target.src = '/images/default-avatar.jpg')}
            />
          </div>

          <h4 className="text-center">{student?.firstName} {student?.lastName}</h4>

          <div className="text-center my-3">
            <strong>Total Credits:</strong> {totalCredits}
          </div>

          <div className="mt-4">
            <h5 className="mb-3">Subjects Summary</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Subject</th>
                    <th>Credits</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.subjectName}>
                      <td>{subject.subjectName}</td>
                      <td>{subject.isCompleted ? 1 : 0}</td>
                      <td>{subject.isCompleted ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default CompletionViewModal;

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import './LogDailyModal.css';

function LogDailyModal({ show, handleClose, student, onRefresh }) {
  const [subjectInput, setSubjectInput] = useState('');
  const [comment, setComment] = useState('');
  const [percentage, setPercentage] = useState('');
  const [studyTime, setStudyTime] = useState('');
  const [status, setStatus] = useState('');
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (student) {
      setSubjectOptions(student.subjects?.map(s => s.subjectName) || []);
    }
  }, [student]);

  if (!student) return null;

  const handleSave = async () => {
    setMessage(null);
    if (!subjectInput.trim()) {
      setMessage('Subject is required.');
      return;
    }
    const inputTrimmed = subjectInput.trim();
    const alreadyRegistered = subjectOptions.some(
      s => s.trim().toLowerCase() === inputTrimmed.toLowerCase()
    );
    if (!alreadyRegistered) {
      setShowCreateModal(true);
      return;
    }

    try {
      await saveLog(inputTrimmed);
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      setMessage('❌ Error saving log.');
    }
  };

  const saveLog = async (subjectName) => {
    try {
      const payload = {
        studentId: student._id,
        subjectName: subjectName.trim(),
        comment: comment.trim() || 'No comment',
        studyTimeMinutes: studyTime ? parseInt(studyTime) : 0,
        percentage: parseInt(student.grade) > 5 ? parseFloat(percentage) : undefined,
        status: parseInt(student.grade) <= 5 ? status : null,
      };

      
      await axios.post(
      `${process.env.REACT_APP_API_URL}/api/dailyLogs`,
    payload,
  { withCredentials: true }
);

      setMessage('✓ Log saved!');
      setSubjectInput('');
      setComment('');
      setPercentage('');
      setStatus('');
      setStudyTime('');
      setShowCreateModal(false);
    } catch (err) {
      setMessage('❌ Error saving log. Please ensure subject is valid.');
      setShowCreateModal(false);
    }
  };

  const handleCreateSubject = async () => {
    try {
      await saveLog(subjectInput.trim());
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      setMessage('❌ Failed to create/register subject.');
    } finally {
      setShowCreateModal(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Log Daily Activity</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant="info">{message}</Alert>}

        <Form.Group controlId="subjectInput" className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            list="subjectList"
            placeholder="Type or select subject"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
          />
          <datalist id="subjectList">
            {subjectOptions.map((s, idx) => (
              <option key={idx} value={s} />
            ))}
          </datalist>
        </Form.Group>

        <Form.Group controlId="commentInput" className="mb-3">
          <Form.Label>Comment</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Activity Completed"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Form.Group>

        {parseInt(student?.grade) <= 5 ? (
          <Form.Group controlId="status" className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Check
              type="radio"
              label="Pass"
              name="status"
              value="pass"
              checked={status === 'pass'}
              onChange={(e) => setStatus(e.target.value)}
            />
            <Form.Check
              type="radio"
              label="Fail"
              name="status"
              value="fail"
              checked={status === 'fail'}
              onChange={(e) => setStatus(e.target.value)}
            />
          </Form.Group>
        ) : (
          <Form.Group controlId="percentage" className="mb-3">
            <Form.Label>Percentage</Form.Label>
            <Form.Control
              type="number"
              min={0}
              max={100}
              placeholder="e.g. 85"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
          </Form.Group>
        )}

        <Form.Group controlId="studyTime" className="mb-3">
          <Form.Label>Study Time (minutes)</Form.Label>
          <Form.Control
            type="number"
            min={0}
            placeholder="e.g. 30"
            value={studyTime}
            onChange={(e) => setStudyTime(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Log
        </Button>
      </Modal.Footer>

      {/* Register Subject Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered backdrop="static">
        <Modal.Header>
          <Modal.Title>Register Subject?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          The subject "{subjectInput}" is not registered for this student. Do you want to proceed and register it?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleCreateSubject}>
            Yes, Register
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
}

export default LogDailyModal;

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

function CompletionLogModal({ show, handleClose, student, onRefresh }) {
  const [subjectInput, setSubjectInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(null);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (student) {
      setSubjectOptions(student.subjects?.map(s => s.subjectName) || []);
    }
  }, [student]);

  const handleSubjectChange = (e) => {
    setSubjectInput(e.target.value);
    // Auto-fill completion status if subject is already present
    const match = student.subjects?.find(
      s => s.subjectName.trim().toLowerCase() === e.target.value.trim().toLowerCase()
    );
    if (match && typeof match.isCompleted === 'boolean') {
      setIsCompleted(match.isCompleted);
    } else {
      setIsCompleted(null);
    }
  };

  const handleSave = async () => {
    setMessage(null);
    if (!subjectInput.trim()) return setMessage('Subject is required.');
    if (isCompleted === null) return setMessage('Please select completion status.');

    const inputTrimmed = subjectInput.trim();
    const alreadyRegistered = subjectOptions.some(
      s => s.trim().toLowerCase() === inputTrimmed.toLowerCase()
    );

    if (!alreadyRegistered) {
      setShowCreateModal(true);
      return;
    }

    try {
      await saveCompletion(inputTrimmed);
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      setMessage('❌ Error saving completion status.');
    }
  };

  const saveCompletion = async (subjectName) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/dailyLogs/${student._id}/${encodeURIComponent(subjectName)}/update-completion`,
        { isCompleted },
        { withCredentials: true }
      );

      setMessage('✓ Completion status saved!');
      setSubjectInput('');
      setIsCompleted(null);
    } catch (err) {
      setMessage('❌ Error saving completion status.');
    }
  };

  const handleCreateSubject = async () => {
    try {
      // Just save; backend will auto-register subject if missing
      await saveCompletion(subjectInput.trim());
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
        <Modal.Title>Log Completion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant="info">{message}</Alert>}

        <Form.Group controlId="subjectInput" className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            list="subjectList"
            placeholder="Type or select subject"
            value={subjectInput}
            onChange={handleSubjectChange}
          />
          <datalist id="subjectList">
            {subjectOptions.map((s, idx) =>
              <option key={idx} value={s} />
            )}
          </datalist>
        </Form.Group>

        <Form.Group controlId="completion" className="mb-3">
          <Form.Label>Completion Status</Form.Label>
          <Form.Check
            type="radio"
            label="Completed"
            name="completion"
            value="true"
            checked={isCompleted === true}
            onChange={() => setIsCompleted(true)}
          />
          <Form.Check
            type="radio"
            label="Not Completed"
            name="completion"
            value="false"
            checked={isCompleted === false}
            onChange={() => setIsCompleted(false)}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Status
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

export default CompletionLogModal;

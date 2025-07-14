import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const gradeOptions = {
  "Kindergarten": 0,
  "1st Grade": 1,
  "2nd Grade": 2,
  "3rd Grade": 3,
  "4th Grade": 4,
  "5th Grade": 5,
  "6th Grade": 6,
  "7th Grade": 7,
  "8th Grade": 8,
  "9th Grade": 9,
  "10th Grade": 10,
};

function AddStudentModal({ show, handleClose, onStudentAdded }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    grade: '',
    profilePicture: null,
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, profilePicture: e.target.files[0] }));
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  const { firstName, lastName, birthDate, grade, profilePicture } = formData;

  if (!firstName || !lastName || !birthDate || grade === '') {
    setError('Please fill in all required fields.');
    return;
  }

  // Birthdate validation
  const today = new Date();
  const bDate = new Date(birthDate);

  // Future date check
  if (bDate > today) {
    setError('Student should be minimum one year old.');
    return;
  }

  // Minimum 1 year old check
  const ageInMs = today - bDate;
  const oneYearMs = 1000 * 60 * 60 * 24 * 365.25;
  if (ageInMs < oneYearMs) {
    setError('Student should be minimum one year old.');
    return;
  }

  const data = new FormData();
  data.append('firstName', firstName);
  data.append('lastName', lastName);
  data.append('birthDate', birthDate);
  data.append('grade', grade);
  data.append('subjects', JSON.stringify([]));

  if (profilePicture) {
    data.append('profilePicture', profilePicture);
  }

  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/students`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    setFormData({
      firstName: '',
      lastName: '',
      birthDate: '',
      grade: '',
      profilePicture: null,
    });

    onStudentAdded(res.data);
    handleClose();
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to add student');
  }
};


  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Student</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control name="firstName" value={formData.firstName} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control name="lastName" value={formData.lastName} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Birth Date</Form.Label>
            <Form.Control type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Grade</Form.Label>
            <Form.Select name="grade" value={formData.grade} onChange={handleChange} required>
              <option value="">Select Grade</option>
              {Object.entries(gradeOptions).map(([label, value]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Profile Picture</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
          </Form.Group>

          {error && <p className="text-danger">{error}</p>}

          <Button variant="primary" type="submit" className="mt-2 w-100">Add Student</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddStudentModal;


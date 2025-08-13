import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const NewWeeklyNoteModal = ({ show, handleClose, handleCreate, modalContext }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (show) {
      const format = (date) => date.toISOString().split('T')[0];
      const today = new Date();
      const day = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
      const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
      
      const currentMonday = new Date(new Date().setDate(diffToMonday));

      let monday;
      if (modalContext === 'carryOver') {
        // Set to next week
        monday = new Date(currentMonday.setDate(currentMonday.getDate() + 7));
      } else {
        // Set to current week
        monday = currentMonday;
      }

      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);

      setStartDate(format(monday));
      setEndDate(format(friday));
    }
  }, [show, modalContext]);

  const onCreateClick = () => {
    if (startDate && endDate) {
      handleCreate(startDate, endDate);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>選擇週記日期範圍</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>開始日期</Form.Label>
            <Form.Control 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>結束日期</Form.Label>
            <Form.Control 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          取消
        </Button>
        <Button variant="primary" onClick={onCreateClick}>
          建立週記
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewWeeklyNoteModal;
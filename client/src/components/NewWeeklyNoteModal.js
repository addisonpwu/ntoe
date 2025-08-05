import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const NewWeeklyNoteModal = ({ show, handleClose, handleCreate }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const onCreateClick = () => {
    if (startDate && endDate) {
      handleCreate(startDate, endDate);
      setStartDate('');
      setEndDate('');
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
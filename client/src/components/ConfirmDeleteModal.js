import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmDeleteModal = ({ show, handleClose, handleConfirm, noteTitle }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>確認刪除</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        您確定要永久刪除筆記 "<strong>{noteTitle}</strong>" 嗎？此操作無法復原。
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          取消
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          確認刪除
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;

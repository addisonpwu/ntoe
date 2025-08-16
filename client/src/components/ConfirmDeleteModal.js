import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

const ConfirmDeleteModal = ({ show, handleClose, handleConfirm, noteTitle, isDeleting }) => {
  return (
    <Modal show={show} onHide={handleClose} centered contentClassName="glass-effect">
      <Modal.Header closeButton>
        <Modal.Title>確認刪除</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        您確定要永久刪除筆記 "<strong>{noteTitle}</strong>" 嗎？此操作無法復原。
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
          取消
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={isDeleting}>
          {isDeleting ? (
            <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 正在刪除...</>
          ) : (
            '確認刪除'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;

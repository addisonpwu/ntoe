import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Modal, Form, Alert } from 'react-bootstrap';
import * as api from '../api';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const TagManagementView = () => {
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTag, setCurrentTag] = useState(null);
  const [tagName, setTagName] = useState('');
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await api.fetchTags();
      setTags(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch tags.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddModal = () => {
    setIsEditing(false);
    setCurrentTag(null);
    setTagName('');
    setModalError('');
    setShowModal(true);
  };

  const handleShowEditModal = (tag) => {
    setIsEditing(true);
    setCurrentTag(tag);
    setTagName(tag.name);
    setModalError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSave = async () => {
    if (!tagName.trim()) {
        setModalError('Tag name cannot be empty.');
        return;
    }
    try {
      if (isEditing) {
        await api.updateTag(currentTag.id, tagName);
      } else {
        await api.createTag(tagName);
      }
      fetchTags();
      handleCloseModal();
    } catch (err) {
      setModalError((isEditing ? 'Failed to update tag: ' : 'Failed to create tag: ') + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (tagId) => {
    if (window.confirm('Are you sure you want to delete this tag? This will remove it from all associated notes.')) {
      try {
        await api.deleteTag(tagId);
        fetchTags();
      } catch (err) {
        setError('Failed to delete tag.');
      }
    }
  };

  if (loading) return <div>Loading tags...</div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>標籤管理</h2>
        <Button variant="primary" onClick={handleShowAddModal}>
          <FaPlus className="me-2" />
          新增標籤
        </Button>
      </div>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      <ListGroup>
        {tags.map(tag => (
          <ListGroup.Item key={tag.id} className="d-flex justify-content-between align-items-center">
            {tag.name}
            <div>
              <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(tag)} title={`Edit ${tag.name}`}>
                <FaEdit />
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(tag.id)} title={`Delete ${tag.name}`}>
                <FaTrash />
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? '編輯標籤' : '新增標籤'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}
          <Form.Group>
            <Form.Label>標籤名稱</Form.Label>
            <Form.Control
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {isEditing ? '儲存變更' : '建立'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TagManagementView;

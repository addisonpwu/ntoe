import React, { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import * as api from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // State for user management modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('member');

  // State for aggregation
  const [selectedNoteIds, setSelectedNoteIds] = useState(new Set());
  const [showAggregationModal, setShowAggregationModal] = useState(false);
  const [aggregatedResult, setAggregatedResult] = useState(null);
  const [isAggregating, setIsAggregating] = useState(false);

  const submittedWeeklyNotes = useMemo(() => {
    return notes.filter(n => n.type === 'weekly' && n.status === 'submitted');
  }, [notes]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notesRes, usersRes] = await Promise.all([
          api.fetchAdminStats(),
          api.fetchAllNotes(), // This fetches all notes, we filter it below
          api.fetchUsers()
        ]);
        setStats(statsRes.data);
        setNotes(notesRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        setError('Failed to fetch admin data. Are you logged in as an admin?');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleShowUserModal = () => setShowUserModal(true);
  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setNewUsername('');
    setNewPassword('');
    setNewRole('member');
  }

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) {
      return alert('Username and password are required.');
    }
    try {
      await api.createUser({ username: newUsername, password: newPassword, role: newRole });
      const usersRes = await api.fetchUsers();
      setUsers(usersRes.data);
      handleCloseUserModal();
    } catch (err) {
      alert('Failed to create user. The username might already be taken.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const handleNoteSelectionChange = (noteId) => {
    setSelectedNoteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const handleAggregate = async () => {
    if (selectedNoteIds.size === 0) {
      return alert('Please select at least one weekly note to aggregate.');
    }
    setIsAggregating(true);
    try {
      const result = await api.aggregateWeeklyNotes(Array.from(selectedNoteIds));
      setAggregatedResult(result.data);
      setShowAggregationModal(true);
    } catch (error) {
      alert('Failed to aggregate notes.');
    } finally {
      setIsAggregating(false);
    }
  };

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!stats) {
    return <div>Loading Admin Dashboard...</div>;
  }

  return (
    <div className="p-3">
      <h2>Admin Dashboard</h2>
      {/* Stats Cards... */}

      <div className="d-flex justify-content-between align-items-center mt-4">
        <h4>Submitted Weekly Notes</h4>
        <Button 
          variant="success" 
          onClick={handleAggregate}
          disabled={selectedNoteIds.size === 0 || isAggregating}
        >
          {isAggregating ? 'Aggregating...' : `Aggregate Selected (${selectedNoteIds.size})`}
        </Button>
      </div>
      <Table striped bordered hover responsive size="sm" className="mt-2">
        <thead>
          <tr>
            <th><Form.Check type="checkbox" disabled /></th>
            <th>Title</th>
            <th>Author</th>
            <th>Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {submittedWeeklyNotes.map(note => (
            <tr key={note.id}>
              <td><Form.Check type="checkbox" onChange={() => handleNoteSelectionChange(note.id)} checked={selectedNoteIds.has(note.id)} /></td>
              <td>{note.title}</td>
              <td>{users.find(u => u.id === note.user_id)?.username || 'Unknown'}</td>
              <td>{new Date(note.updated_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <h4>User Management</h4>
        <Button variant="primary" onClick={handleShowUserModal}>Create New User</Button>
      </div>
      <Table striped bordered hover responsive size="sm" className="mt-2">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td><Badge bg={user.role === 'admin' ? 'danger' : 'secondary'}>{user.role}</Badge></td>
              <td>{new Date(user.created_at).toLocaleString()}</td>
              <td>
                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Create User Modal */}
      <Modal show={showUserModal} onHide={handleCloseUserModal}>
        <Modal.Header closeButton><Modal.Title>Create New User</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Role</Form.Label><Form.Select value={newRole} onChange={e => setNewRole(e.target.value)}><option value="member">Member</option><option value="admin">Admin</option></Form.Select></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUserModal}>Close</Button>
          <Button variant="primary" onClick={handleCreateUser}>Create User</Button>
        </Modal.Footer>
      </Modal>

      {/* Aggregation Result Modal */}
      <Modal show={showAggregationModal} onHide={() => setShowAggregationModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Aggregated Weekly Notes</Modal.Title></Modal.Header>
        <Modal.Body>
          {aggregatedResult && (
            <>
              <h5>Key Focus</h5>
              <ul>{aggregatedResult.keyFocus.map((item, i) => <li key={`kf-${i}`}>{item}</li>)}</ul>
              <hr />
              <h5>Regular Work</h5>
              <ul>{aggregatedResult.regularWork.map((item, i) => <li key={`rw-${i}`}>{item}</li>)}</ul>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAggregationModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

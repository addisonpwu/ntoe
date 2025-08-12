import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import * as api from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // State for the new user modal
  const [showModal, setShowModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('member');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notesRes, usersRes] = await Promise.all([
          api.fetchAdminStats(),
          api.fetchAllNotes(),
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

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    // Reset form fields on close
    setNewUsername('');
    setNewPassword('');
    setNewRole('member');
  }

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) {
      alert('Username and password are required.');
      return;
    }
    try {
      await api.createUser({ username: newUsername, password: newPassword, role: newRole });
      // Refetch users to show the new one
      const usersRes = await api.fetchUsers();
      setUsers(usersRes.data);
      handleCloseModal();
    } catch (err) {
      alert('Failed to create user. The username might already be taken.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.deleteUser(userId);
        // Refetch users to remove the deleted one
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        alert('Failed to delete user.');
      }
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
      <Row className="mb-4">
        <Col>
          <Card bg="primary" text="white">
            <Card.Body>
              <Card.Title>{stats.totalNotes}</Card.Title>
              <Card.Text>Total Notes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="success" text="white">
            <Card.Body>
              <Card.Title>{stats.normalNotes}</Card.Title>
              <Card.Text>Normal Notes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="info" text="white">
            <Card.Body>
              <Card.Title>{stats.weeklyNotes}</Card.Title>
              <Card.Text>Weekly Notes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="secondary" text="white">
            <Card.Body>
              <Card.Title>{stats.archivedNotes}</Card.Title>
              <Card.Text>Archived Notes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h4>All Notes</h4>
      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {notes.map(note => (
            <tr key={note.id}>
              <td>{note.id}</td>
              <td>{note.title}</td>
              <td>
                <Badge bg={note.type === 'weekly' ? 'info' : 'success'}>
                  {note.type}
                </Badge>
              </td>
              <td>
                <Badge bg={note.archived ? 'secondary' : 'primary'}>
                  {note.archived ? 'Archived' : 'Active'}
                </Badge>
              </td>
              <td>{new Date(note.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <h4>User Management</h4>
        <Button variant="primary" onClick={handleShowModal}>Create New User</Button>
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
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={newRole} onChange={e => setNewRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="primary" onClick={handleCreateUser}>Create User</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
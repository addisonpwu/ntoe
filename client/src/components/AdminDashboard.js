import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Col, Row, Table, Badge } from 'react-bootstrap';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get('/api/admin/stats');
        setStats(statsRes.data);

        const notesRes = await axios.get('/api/admin/notes');
        setNotes(notesRes.data);
      } catch (err) {
        setError('Failed to fetch admin data. Is the server running?');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-4">
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
    </div>
  );
};

export default AdminDashboard;

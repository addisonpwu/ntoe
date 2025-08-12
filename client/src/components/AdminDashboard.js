import React, { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Table, Badge, Button, Form, Modal, Nav } from 'react-bootstrap';
import { FaTachometerAlt, FaFileAlt, FaUsers } from 'react-icons/fa';
import * as api from '../api';

const StatsCards = ({ stats }) => (
  <>
    <h2 className="mb-4">儀表盤</h2>
    <Row>
      <Col md={6} xl={3} className="mb-4">
        <Card bg="primary" text="white"><Card.Body><Card.Title className="fs-2">{stats.totalNotes}</Card.Title><Card.Text>總筆記數</Card.Text></Card.Body></Card>
      </Col>
      <Col md={6} xl={3} className="mb-4">
        <Card bg="success" text="white"><Card.Body><Card.Title className="fs-2">{stats.normalNotes}</Card.Title><Card.Text>普通筆記</Card.Text></Card.Body></Card>
      </Col>
      <Col md={6} xl={3} className="mb-4">
        <Card bg="info" text="white"><Card.Body><Card.Title className="fs-2">{stats.weeklyNotes}</Card.Title><Card.Text>周報數量</Card.Text></Card.Body></Card>
      </Col>
      <Col md={6} xl={3} className="mb-4">
        <Card bg="secondary" text="white"><Card.Body><Card.Title className="fs-2">{stats.archivedNotes}</Card.Title><Card.Text>已封存</Card.Text></Card.Body></Card>
      </Col>
    </Row>
  </>
);

const SubmittedNotesView = ({ notes, users, onSelectionChange, selectedIds, onAggregate, isAggregating }) => (
  <>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>周報審批</h2>
      <Button variant="success" onClick={onAggregate} disabled={selectedIds.size === 0 || isAggregating}>
        {isAggregating ? '正在匯總...' : `匯總選中 (${selectedIds.size})`}
      </Button>
    </div>
    <Table striped bordered hover responsive size="sm">
      <thead>
        <tr>
          <th style={{ width: '50px' }} className="text-center"><Form.Check type="checkbox" disabled /></th>
          <th>標題</th>
          <th>提交人</th>
          <th>提交時間</th>
        </tr>
      </thead>
      <tbody>
        {notes.map(note => (
          <tr key={note.id}>
            <td className="text-center"><Form.Check type="checkbox" onChange={() => onSelectionChange(note.id)} checked={selectedIds.has(note.id)} /></td>
            <td>{note.title}</td>
            <td>{users.find(u => u.id === note.user_id)?.username || 'N/A'}</td>
            <td>{new Date(note.updated_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  </>
);

const UserManagementView = ({ users, onShowModal, onDeleteUser }) => (
  <>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>用戶管理</h2>
      <Button variant="primary" onClick={onShowModal}>創建新用戶</Button>
    </div>
    <Table striped bordered hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>用戶名</th>
          <th>角色</th>
          <th>創建時間</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.username}</td>
            <td><Badge bg={user.role === 'admin' ? 'danger' : 'secondary'}>{user.role}</Badge></td>
            <td>{new Date(user.created_at).toLocaleString()}</td>
            <td><Button variant="outline-danger" size="sm" onClick={() => onDeleteUser(user.id)}>刪除</Button></td>
          </tr>
        ))}
      </tbody>
    </Table>
  </>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('dashboard');

  const [showUserModal, setShowUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('member');

  const [selectedNoteIds, setSelectedNoteIds] = useState(new Set());
  const [showAggregationModal, setShowAggregationModal] = useState(false);
  const [aggregatedResult, setAggregatedResult] = useState(null);
  const [isAggregating, setIsAggregating] = useState(false);

  const submittedWeeklyNotes = useMemo(() => notes.filter(n => n.type === 'weekly' && n.status === 'submitted'), [notes]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notesRes, usersRes] = await Promise.all([api.fetchAdminStats(), api.fetchAllNotes(), api.fetchUsers()]);
        setStats(statsRes.data);
        setNotes(notesRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        setError('Failed to fetch admin data.');
      }
    };
    fetchData();
  }, []);

  const handleShowUserModal = () => setShowUserModal(true);
  const handleCloseUserModal = () => { setShowUserModal(false); setNewUsername(''); setNewPassword(''); setNewRole('member'); };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) return alert('Username and password are required.');
    try {
      await api.createUser({ username: newUsername, password: newPassword, role: newRole });
      const usersRes = await api.fetchUsers();
      setUsers(usersRes.data);
      handleCloseUserModal();
    } catch (err) {
      alert('Failed to create user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure?')) {
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
      newSet.has(noteId) ? newSet.delete(noteId) : newSet.add(noteId);
      return newSet;
    });
  };

  const handleAggregate = async () => {
    if (selectedNoteIds.size === 0) return alert('Please select notes.');
    setIsAggregating(true);
    try {
      const result = await api.aggregateWeeklyNotes(Array.from(selectedNoteIds));
      setAggregatedResult(result.data);
      setShowAggregationModal(true);
    } catch (error) {
      alert('Failed to aggregate.');
    } finally {
      setIsAggregating(false);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard': return <StatsCards stats={stats} />;
      case 'notes': return <SubmittedNotesView notes={submittedWeeklyNotes} users={users} onSelectionChange={handleNoteSelectionChange} selectedIds={selectedNoteIds} onAggregate={handleAggregate} isAggregating={isAggregating} />;
      case 'users': return <UserManagementView users={users} onShowModal={handleShowUserModal} onDeleteUser={handleDeleteUser} />;
      default: return <StatsCards stats={stats} />;
    }
  };

  if (error) return <div className="p-4 alert alert-danger">{error}</div>;
  if (!stats) return <div className="p-4">Loading...</div>;

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <h4 className="mb-4">管理後台</h4>
        <Nav variant="pills" activeKey={activeView} onSelect={setActiveView} className="flex-column">
          <Nav.Item><Nav.Link eventKey="dashboard"><FaTachometerAlt className="me-2" /> 儀表盤</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="notes"><FaFileAlt className="me-2" /> 周報審批</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="users"><FaUsers className="me-2" /> 用戶管理</Nav.Link></Nav.Item>
        </Nav>
      </nav>
      <main className="admin-content">
        {renderActiveView()}
      </main>

      <Modal show={showUserModal} onHide={handleCloseUserModal}>
        <Modal.Header closeButton><Modal.Title>創建新用戶</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>用戶名</Form.Label><Form.Control type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>密碼</Form.Label><Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>角色</Form.Label><Form.Select value={newRole} onChange={e => setNewRole(e.target.value)}><option value="member">Member</option><option value="admin">Admin</option></Form.Select></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUserModal}>關閉</Button>
          <Button variant="primary" onClick={handleCreateUser}>創建</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAggregationModal} onHide={() => setShowAggregationModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>周報匯總結果</Modal.Title></Modal.Header>
        <Modal.Body>
          {aggregatedResult && (
            <>
              <h5>重點工作</h5>
              <pre className="aggregation-box">{aggregatedResult.keyFocus.join('\n')}</pre>
              <hr />
              <h5>常規工作</h5>
              <pre className="aggregation-box">{aggregatedResult.regularWork.join('\n')}</pre>
            </>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowAggregationModal(false)}>關閉</Button></Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Nav, Modal, Button, Form, Alert, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { FaFileAlt, FaUsers, FaTags, FaAngleLeft, FaAngleRight, FaSync, FaDownload } from 'react-icons/fa';
import * as api from '../api';
import { useSortableData } from '../hooks/useSortableData';

import SubmittedNotesView from './SubmittedNotesView';
import UserManagementView from './UserManagementView';
import TagManagementView from './TagManagementView';
import './AdminDashboard.css';

const AggregationResultList = ({ title, items }) => (
  <div className="mb-4">
    <h5>{title}</h5>
    {items && items.length > 0 ? (
      <ListGroup variant="flush">
        {items.map((item, index) => (
          <ListGroup.Item key={index} className="px-0 py-2">
            <span>{item.content}</span>
          </ListGroup.Item>
        ))}
      </ListGroup>
    ) : (
      <p className="text-muted">無</p>
    )}
  </div>
);

const AdminDashboard = () => {
  const [notes, setNotes] = useState(null);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('notes');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'member' });
  const [modalError, setModalError] = useState('');

  const [selectedNoteIds, setSelectedNoteIds] = useState(new Set());
  const [showAggregationModal, setShowAggregationModal] = useState(false);
  const [aggregatedResult, setAggregatedResult] = useState(null);
  const [isAggregating, setIsAggregating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [notesRes, usersRes] = await Promise.all([
        api.fetchAllNotes(),
        api.fetchUsers(),
      ]);
      setNotes(notesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    setStartDate(formatDate(monday));
    setEndDate(formatDate(friday));

    fetchData();
  }, [fetchData]);

  // The backend now sends only notes that have been submitted at least once.
  // We just need to parse the content.
  const parsedNotes = useMemo(() => {
    if (!notes) return [];
    return notes.map(n => {
      if (typeof n.content === 'string') {
        try {
          return { ...n, content: JSON.parse(n.content) };
        } catch (e) {
          console.error("Failed to parse note content:", n.content);
          return { ...n, content: {} };
        }
      }
      return n;
    });
  }, [notes]);

  const { items: sortedUsers, requestSort: requestUserSort, sortConfig: userSortConfig } = useSortableData(users || [], { key: 'id', direction: 'ascending' });
  const { items: sortedNotes, requestSort: requestNoteSort, sortConfig: noteSortConfig } = useSortableData(parsedNotes, { key: 'updated_at', direction: 'descending' });

  const filteredNotes = useMemo(() => {
    if (!startDate && !endDate) {
      return sortedNotes;
    }
    return sortedNotes.filter(note => {
      const noteDate = new Date(note.updated_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      if (start && noteDate < start) return false;
      if (end && noteDate > end) return false;
      return true;
    });
  }, [sortedNotes, startDate, endDate]);

  const handleShowUserModal = () => setShowUserModal(true);
  const handleCloseUserModal = () => { 
    setShowUserModal(false); 
    setNewUser({ username: '', password: '', role: 'member' });
    setModalError('');
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
        setModalError('Username and password are required.');
        return;
    }
    try {
      await api.createUser(newUser);
      const usersRes = await api.fetchUsers();
      setUsers(usersRes.data);
      handleCloseUserModal();
    } catch (err) {
      setModalError('Failed to create user.');
    }
  };

  const confirmDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowConfirmDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await api.deleteUser(userToDelete);
        setUsers(users.filter(u => u.id !== userToDelete));
        setShowConfirmDeleteModal(false);
        setUserToDelete(null);
      } catch (err) {
        setError('Failed to delete user.');
        setShowConfirmDeleteModal(false);
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

  const handleSelectAllNotes = () => {
    if (selectedNoteIds.size === filteredNotes.length) {
      setSelectedNoteIds(new Set());
    } else {
      setSelectedNoteIds(new Set(filteredNotes.map(n => n.id)));
    }
  };

  const handleAggregate = async () => {
    if (selectedNoteIds.size === 0) return;
    setIsAggregating(true);
    try {
      const result = await api.aggregateWeeklyNotes(Array.from(selectedNoteIds));
      setAggregatedResult(result.data);
      setShowAggregationModal(true);
    } catch (error) {
      setError('Failed to aggregate notes.');
    } finally {
      setIsAggregating(false);
    }
  };

  const handleDownloadReport = async () => {
    if (selectedNoteIds.size === 0) {
      setError('Please select at least one note to generate a report.');
      return;
    }
    setIsDownloading(true);
    try {
      const payload = {
        aggregatedData: aggregatedResult,
        noteIds: Array.from(selectedNoteIds),
        startDate: startDate,
        endDate: endDate
      };
      const response = await api.downloadReport(payload);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'WeeklyReport.docx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download report.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderActiveView = () => {
    if (loading || !notes || !users) {
      return <div className="p-4 text-center"><h5>Loading...</h5></div>;
    }

    switch (activeView) {
      case 'notes': 
        return <SubmittedNotesView 
                                notes={filteredNotes}
                                users={users} 
                                onSelectionChange={handleNoteSelectionChange} 
                                selectedIds={selectedNoteIds} 
                                onAggregate={handleAggregate} 
                                isAggregating={isAggregating}
                                onSelectAll={handleSelectAllNotes}
                                areAllSelected={selectedNoteIds.size === filteredNotes.length && filteredNotes.length > 0}
                                onSort={requestNoteSort}
                                sortConfig={noteSortConfig}
                                startDate={startDate}
                                setStartDate={setStartDate}
                                endDate={endDate}
                                setEndDate={setEndDate}
                              />;
      case 'users': return <UserManagementView 
                              users={sortedUsers} 
                              onShowModal={handleShowUserModal} 
                              onDeleteUser={confirmDeleteUser}
                              onSort={requestUserSort}
                              sortConfig={userSortConfig}
                            />;
      case 'tags': return <TagManagementView />;
      default: return <div className="p-4">Please select a view.</div>;
    }
  };

  return (
    <div className="d-flex">
        <div className={`admin-sidebar bg-light vh-100 p-3 shadow-sm ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="admin-sidebar-header mb-4 d-flex justify-content-between align-items-center">
                <h4 className="fw-bold text-truncate">管理後台</h4>
                <Button variant="light" onClick={fetchData} disabled={loading} className="d-none d-md-block">
                    <FaSync className={loading ? 'fa-spin' : ''} />
                </Button>
            </div>
            <Nav variant="pills" activeKey={activeView} onSelect={setActiveView} className="flex-column">
                <Nav.Item className="mb-2">
                    <Nav.Link eventKey="notes" title="周報審批">
                        <FaFileAlt className="me-2" /> <span>周報審批</span>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item className="mb-2">
                    <Nav.Link eventKey="users" title="用戶管理">
                        <FaUsers className="me-2" /> <span>用戶管理</span>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="tags" title="標籤管理">
                        <FaTags className="me-2" /> <span>標籤管理</span>
                    </Nav.Link>
                </Nav.Item>
            </Nav>
            <Button variant="light" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} className="sidebar-toggle">
                {isSidebarCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
            </Button>
        </div>
        <div className="main-content-wrapper p-4">
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            {renderActiveView()}
        </div>

      {/* Modals ... */}
      <Modal show={showUserModal} onHide={handleCloseUserModal} centered>
        <Modal.Header closeButton><Modal.Title>創建新用戶</Modal.Title></Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>用戶名</Form.Label>
              <Form.Control type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>密碼</Form.Label>
              <Form.Control type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>角色</Form.Label>
              <Form.Select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUserModal}>關閉</Button>
          <Button variant="primary" onClick={handleCreateUser}>創建</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAggregationModal} onHide={() => setShowAggregationModal(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>周報匯總結果</Modal.Title></Modal.Header>
        <Modal.Body>
          {aggregatedResult && (
            <>
              <AggregationResultList title="重點及專項工作" items={aggregatedResult.keyFocus} />
              <hr />
              <AggregationResultList title="常規工作" items={aggregatedResult.regularWork} />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAggregationModal(false)}>關閉</Button>
          <Button variant="primary" onClick={handleDownloadReport} disabled={isDownloading}>
            {isDownloading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <FaDownload className="me-2"/>}
            下載 Word
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Modal show={showConfirmDeleteModal} onHide={() => setShowConfirmDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>確認刪除</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          您確定要刪除這位使用者嗎？此操作無法復原。
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmDeleteModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            刪除
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
import React, { useState } from 'react';
import { Button, Dropdown, Nav, Form, InputGroup, Badge, ListGroup, Accordion } from 'react-bootstrap';
import { FaPlus, FaStickyNote, FaCalendarWeek, FaSearch, FaFolder, FaInbox, FaTag, FaFileAlt, FaTimes } from 'react-icons/fa';
import './Note.css'; // Import the new styles

const EmptyState = ({ message }) => (
  <div className="empty-state p-3 text-center">
    <div className="empty-state-icon mb-2"><FaFileAlt /></div>
    <p className="mb-0">{message}</p>
  </div>
);

const NoteList = ({ 
  notes, 
  tags,
  folders,
  activeNote, 
  onNoteSelect, 
  onNewNote, 
  onNoteDelete, // Added prop for deleting
  isOpen, 
  noteStatusFilter, 
  setNoteStatusFilter, 
  searchQuery, 
  setSearchQuery, 
  selectedTag, 
  setSelectedTag, 
  selectedFolderId, 
  setSelectedFolderId, 
  onCreateFolder 
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const handleCreateFolder = () => {
    if (newFolderName.trim() === '') return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-CA'); // YYYY-MM-DD for brevity
  };

  const inboxNoteCount = notes.filter(n => n.folder_id === null).length;

  return (
    <div className={`note-list-sidebar ${isOpen ? 'open' : ''}`}> {/* Removed glass-effect */}
      <div className="note-list-container d-flex flex-column h-100">
        <div className="p-2">
          <Dropdown as="div" className="d-grid gap-2 mb-2">
            <Dropdown.Toggle as={Button} variant="primary">
              <FaPlus className="me-2" /> 新增筆記
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100">
              <Dropdown.Item onClick={() => onNewNote('normal')}>
                <FaStickyNote className="me-2" /> 一般筆記
              </Dropdown.Item>
              <Dropdown.Item onClick={() => onNewNote('weekly', null, null)}>
                <FaCalendarWeek className="me-2" /> 週記
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="搜尋筆記..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          <Accordion defaultActiveKey={['folders']} alwaysOpen>
            <Accordion.Item eventKey="folders">
              <Accordion.Header>資料夾</Accordion.Header>
              <Accordion.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item action active={selectedFolderId === 'inbox'} onClick={() => setSelectedFolderId('inbox')} className="d-flex justify-content-between align-items-center">
                    <span><FaInbox className="me-2" /> 未分類</span>
                    <Badge bg="secondary" pill>{inboxNoteCount}</Badge>
                  </ListGroup.Item>
                  {folders.map(folder => (
                    <ListGroup.Item key={folder.id} action active={selectedFolderId === folder.id} onClick={() => setSelectedFolderId(folder.id)} className="d-flex justify-content-between align-items-center">
                      <span><FaFolder className="me-2" /> {folder.name}</span>
                      <Badge bg="secondary" pill>{folder.note_count}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                {showNewFolderInput ? (
                  <InputGroup className="mt-2">
                    <Form.Control
                      size="sm"
                      placeholder="新資料夾名稱..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
                      autoFocus
                    />
                    <Button variant="outline-secondary" size="sm" onClick={handleCreateFolder}>新增</Button>
                  </InputGroup>
                ) : (
                  <div className="d-grid mt-2">
                    <Button variant="outline-primary" size="sm" onClick={() => setShowNewFolderInput(true)}>新增資料夾</Button>
                  </div>
                )}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        <div className="note-list-heading p-2 border-bottom">
          <Nav variant="pills" activeKey={noteStatusFilter} onSelect={(k) => setNoteStatusFilter(k)} className="flex-nowrap">
            <Nav.Item className="flex-fill">
              <Nav.Link eventKey="current" className="text-center">目前</Nav.Link>
            </Nav.Item>
            <Nav.Item className="flex-fill">
              <Nav.Link eventKey="archived" className="text-center">已封存</Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        <div className="note-list-scroll-area flex-grow-1">
          {notes.length > 0 ? (
            <ListGroup variant="flush">
              {notes.map(note => (
                <ListGroup.Item 
                  key={note.id} 
                  action
                  active={activeNote?.id === note.id}
                  onClick={() => onNoteSelect(note)}
                  className="d-flex justify-content-between align-items-start"
                >
                  <div className="note-list-item-content">
                    <div className="note-title">{note.title}</div>
                    <div className="note-meta">{formatDate(note.updated_at)}</div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="note-tags">
                        {note.tags.map(t => <Badge key={t.id} bg="secondary">{t.name}</Badge>)}
                      </div>
                    )}
                  </div>
                  <button 
                    className="note-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNoteDelete(note.id);
                    }}
                  >
                    <FaTimes />
                  </button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <EmptyState message={searchQuery ? '找不到符合的筆記' : '沒有筆記'} />
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteList;

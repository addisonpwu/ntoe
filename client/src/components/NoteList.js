import React, { useState } from 'react';
import { Button, Dropdown, Nav, Form, InputGroup, Badge, ListGroup } from 'react-bootstrap';
import { FaPlus, FaStickyNote, FaCalendarWeek, FaSearch, FaTimes, FaFolder, FaInbox } from 'react-icons/fa';

const NoteList = ({ 
  notes, 
  tags,
  folders,
  activeNote, 
  onNoteSelect, 
  onNewNote, 
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

  const handleCreateFolder = () => {
    if (newFolderName.trim() === '') return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
  };

  return (
    <div className={`note-list-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="note-list-container d-flex flex-column p-2">
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

        <Form.Group className="mb-2">
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

        <div className="mb-2">
          <h5>資料夾</h5>
          <ListGroup>
            <ListGroup.Item action active={selectedFolderId === 'inbox'} onClick={() => setSelectedFolderId('inbox')}>
              <FaInbox className="me-2" /> 預設文件夾
            </ListGroup.Item>
            {folders.map(folder => (
              <ListGroup.Item key={folder.id} action active={selectedFolderId === folder.id} onClick={() => setSelectedFolderId(folder.id)}>
                <FaFolder className="me-2" /> {folder.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
          <InputGroup className="mt-2">
            <Form.Control
              size="sm"
              placeholder="新增資料夾..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
            />
            <Button variant="outline-secondary" size="sm" onClick={handleCreateFolder}>新增</Button>
          </InputGroup>
        </div>

        <div className="mb-2">
          <h5>標籤</h5>
          <div className="tag-cloud">
            {tags.map(tag => (
              <Badge 
                key={tag.id} 
                pill 
                bg={selectedTag?.id === tag.id ? 'primary' : 'secondary'}
                className="me-1 mb-1 tag-badge"
                onClick={() => setSelectedTag(tag)}
              >
                {tag.name}
              </Badge>
            ))}
            {selectedTag && (
              <Button variant="link" size="sm" className="p-0" onClick={() => setSelectedTag(null)}>
                <FaTimes /> 清除篩選
              </Button>
            )}
          </div>
        </div>

        <Nav variant="pills" activeKey={noteStatusFilter} onSelect={(k) => setNoteStatusFilter(k)} className="flex-nowrap mb-2">
          <Nav.Item className="flex-fill">
            <Nav.Link eventKey="current" className="text-center">目前</Nav.Link>
          </Nav.Item>
          <Nav.Item className="flex-fill">
            <Nav.Link eventKey="archived" className="text-center">已封存</Nav.Link>
          </Nav.Item>
        </Nav>

        <ul className="list-group flex-grow-1 overflow-auto">
          {notes.map(note => (
            <li 
              key={note.id} 
              className={`list-group-item note-list-item d-flex justify-content-between align-items-center ${activeNote?.id === note.id ? 'active' : ''}`}
              onClick={() => onNoteSelect(note)}
            >
              <div>
                <div>{note.title}</div>
                <div className="note-tags">
                  {note.tags && note.tags.map(tag => (
                    <Badge key={tag.id} pill bg="info" className="me-1">{tag.name}</Badge>
                  ))}
                </div>
              </div>
              {note.type === 'weekly' && <span className="badge bg-secondary">週記</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NoteList;
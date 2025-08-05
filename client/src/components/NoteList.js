import React from 'react';
import { Button, Dropdown, Nav, Form, InputGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaStickyNote, FaCalendarWeek, FaSearch, FaTimes } from 'react-icons/fa';

const NoteList = ({ 
  notes, 
  tags,
  activeNote, 
  onNoteSelect, 
  onNewNote, 
  isOpen, 
  noteStatusFilter, 
  setNoteStatusFilter, 
  searchQuery, 
  setSearchQuery, 
  selectedTag, 
  setSelectedTag 
}) => {
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
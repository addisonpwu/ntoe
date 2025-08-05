import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { FaPlus, FaStickyNote, FaCalendarWeek } from 'react-icons/fa';

const NoteList = ({ notes, activeNote, onNoteSelect, onNewNote, isOpen }) => {
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
        <ul className="list-group flex-grow-1 overflow-auto">
          {notes.map(note => (
            <li 
              key={note.id} 
              className={`list-group-item note-list-item d-flex justify-content-between align-items-center ${activeNote?.id === note.id ? 'active' : ''}`}
              onClick={() => onNoteSelect(note)}
            >
              {note.title}
              {note.type === 'weekly' && <span className="badge bg-secondary">週記</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NoteList;
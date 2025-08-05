import React from 'react';

const NoteList = ({ notes, activeNote, onNoteSelect, onNewNote }) => {
  return (
    <div className="col-md-3 note-list-container d-flex flex-column p-2">
      <div className="btn-group mb-2">
        <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          <i className="bi bi-plus-lg me-2"></i>新增筆記
        </button>
        <ul className="dropdown-menu">
          <li><a className="dropdown-item" href="#" onClick={() => onNewNote('normal')}>一般筆記</a></li>
          <li><a className="dropdown-item" href="#" onClick={() => onNewNote('weekly', null, null)}>週記</a></li>
        </ul>
      </div>
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
  );
};

export default NoteList;
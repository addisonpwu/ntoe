import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/Header';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import * as api from './api';
import NewWeeklyNoteModal from './components/NewWeeklyNoteModal';

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [showWeeklyNoteModal, setShowWeeklyNoteModal] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    api.fetchNotes()
      .then(response => setNotes(response.data))
      .catch(error => console.error('取得筆記錯誤：', error));
  };

  const handleNoteSelect = (note) => {
    console.log("handleNoteSelect called with note:", note);
    console.log("note.content type:", typeof note.content);
    console.log("note.content value:", note.content);

    let contentToSet = note.content;

    if (typeof note.content === 'object' && note.content !== null) {
      // Content is already an object (e.g., from axios parsing or new note creation)
      contentToSet = note.content;
    } else if (typeof note.content === 'string') {
      if (note.content === '[object Object]') {
        // Corrupted string, reset to default based on type
        console.warn("偵測到損壞的筆記內容 '[object Object]'。重設為預設值。");
        contentToSet = note.type === 'weekly' ? { keyFocus: [], regularWork: [] } : '';
      } else if (note.type === 'weekly') {
        // Weekly note, attempt to parse JSON string
        try {
          contentToSet = JSON.parse(note.content);
        } catch (e) {
          console.error("解析週記內容失敗：", e);
          // If parsing fails for a weekly note, reset to default weekly structure
          contentToSet = { keyFocus: [], regularWork: [] };
        }
      } else {
        // Normal note with a valid string content, use as is
        contentToSet = note.content;
      }
    } else {
      // Fallback for unexpected types, reset to default
      console.warn("筆記內容型別非預期。重設為預設值。", typeof note.content);
      contentToSet = note.type === 'weekly' ? { keyFocus: [], regularWork: [] } : '';
    }

    setActiveNote({ ...note, content: contentToSet });
  };

  const handleContentChange = (content) => {
    setActiveNote({ ...activeNote, content });
  };

  const handleTitleChange = (e) => {
    setActiveNote({ ...activeNote, title: e.target.value });
  };

  const handleSave = () => {
    const noteToSave = { 
      title: activeNote.title, 
      content: activeNote.content 
    };

    api.updateNote(activeNote.id, noteToSave)
      .then(() => {
        loadNotes();
      })
      .catch(error => console.error('儲存筆記錯誤：', error));
  };

  const handleNewNote = (type, startDate = null, endDate = null) => {
    if (type === 'weekly' && (!startDate || !endDate)) {
      setShowWeeklyNoteModal(true);
      return;
    }

    let content;
    let title;

    if (type === 'weekly') {
      title = `週記 (${startDate} ~ ${endDate})`;
      content = { keyFocus: [], regularWork: [] };
    } else {
      title = '新筆記';
      content = '...';
    }

    const newNote = { title, content, type };

    api.createNote(newNote)
      .then(response => {
        loadNotes();
        handleNoteSelect(response.data);
        setShowWeeklyNoteModal(false); // Close modal after creation
      })
      .catch(error => console.error('建立筆記錯誤：', error));
  };

  const handleCreateWeeklyNote = (startDate, endDate) => {
    handleNewNote('weekly', startDate, endDate);
  };

  const handleDelete = () => {
    if (window.confirm('確定要刪除這則筆記嗎？')) {
      api.deleteNote(activeNote.id)
        .then(() => {
          loadNotes();
          setActiveNote(null);
        })
        .catch(error => console.error('刪除筆記錯誤：', error));
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <Header />
      <div className="row flex-grow-1">
        <NoteList 
          notes={notes}
          activeNote={activeNote}
          onNoteSelect={handleNoteSelect}
          onNewNote={handleNewNote}
        />
        <NoteEditor 
          activeNote={activeNote}
          onContentChange={handleContentChange}
          onTitleChange={handleTitleChange}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>

      <NewWeeklyNoteModal 
        show={showWeeklyNoteModal}
        handleClose={() => setShowWeeklyNoteModal(false)}
        handleCreate={handleCreateWeeklyNote}
      />
    </div>
  );
}

export default App;
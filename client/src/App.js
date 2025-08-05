import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/Header';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import * as api from './api';
import NewWeeklyNoteModal from './components/NewWeeklyNoteModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [showWeeklyNoteModal, setShowWeeklyNoteModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    loadNotes();
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const loadNotes = () => {
    api.fetchNotes()
      .then(response => setNotes(response.data))
      .catch(() => toast.error('無法載入筆記，請稍後再試。'));
  };

  const handleNoteSelect = (note) => {
    let contentToSet = note.content;

    if (typeof note.content === 'object' && note.content !== null) {
      contentToSet = note.content;
    } else if (typeof note.content === 'string') {
      if (note.content === '[object Object]') {
        toast.warn("偵測到損壞的筆記內容，已重設為預設值。");
        contentToSet = note.type === 'weekly' ? { keyFocus: [], regularWork: [] } : '';
      } else if (note.type === 'weekly') {
        try {
          contentToSet = JSON.parse(note.content);
        } catch (e) {
          toast.error("解析週記內容失敗。");
          contentToSet = { keyFocus: [], regularWork: [] };
        }
      } else {
        contentToSet = note.content;
      }
    } else {
      toast.warn("筆記內容型別非預期，已重設為預設值。");
      contentToSet = note.type === 'weekly' ? { keyFocus: [], regularWork: [] } : '';
    }

    setActiveNote({ ...note, content: contentToSet });
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleContentChange = (content) => {
    setActiveNote({ ...activeNote, content });
  };

  const handleTitleChange = (e) => {
    setActiveNote({ ...activeNote, title: e.target.value });
  };

  const handleSave = () => {
    if (!activeNote) return Promise.resolve();

    const noteToSave = { 
      title: activeNote.title, 
      content: activeNote.content 
    };

    return api.updateNote(activeNote.id, noteToSave)
      .then(() => {
        loadNotes();
      })
      .catch(() => {
        toast.error('儲存失敗，請檢查您的網路連線。');
        throw new Error('Save failed');
      });
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
        toast.success('筆記已建立！');
        loadNotes();
        handleNoteSelect(response.data);
        setShowWeeklyNoteModal(false);
      })
      .catch(() => toast.error('建立筆記失敗。'));
  };

  const handleCreateWeeklyNote = (startDate, endDate) => {
    handleNewNote('weekly', startDate, endDate);
  };

  const handleDeleteRequest = () => {
    if (!activeNote) return;
    setNoteToDelete(activeNote);
    setShowConfirmDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!noteToDelete) return;

    api.deleteNote(noteToDelete.id)
      .then(() => {
        toast.success('筆記已刪除。');
        loadNotes();
        setActiveNote(null);
        setShowConfirmDeleteModal(false);
        setNoteToDelete(null);
      })
      .catch(() => toast.error('刪除筆記失敗。'));
  };

  return (
    <div className="app-container">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        toggleSidebar={toggleSidebar} 
      />
      <div className="main-content">
        <NoteList 
          notes={notes}
          activeNote={activeNote}
          onNoteSelect={handleNoteSelect}
          onNewNote={handleNewNote}
          isOpen={isSidebarOpen}
        />
        <NoteEditor 
          activeNote={activeNote}
          onContentChange={handleContentChange}
          onTitleChange={handleTitleChange}
          onSave={handleSave}
          onDelete={handleDeleteRequest}
        />
      </div>

      <NewWeeklyNoteModal 
        show={showWeeklyNoteModal}
        handleClose={() => setShowWeeklyNoteModal(false)}
        handleCreate={handleCreateWeeklyNote}
      />

      <ConfirmDeleteModal
        show={showConfirmDeleteModal}
        handleClose={() => setShowConfirmDeleteModal(false)}
        handleConfirm={confirmDelete}
        noteTitle={noteToDelete?.title}
      />

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </div>
  );
}

export default App;
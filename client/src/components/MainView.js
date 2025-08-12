import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';
import * as api from '../api';
import NewWeeklyNoteModal from './NewWeeklyNoteModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const MainView = ({ isSidebarOpen, setSidebarOpen }) => {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [showWeeklyNoteModal, setShowWeeklyNoteModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [noteStatusFilter, setNoteStatusFilter] = useState('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState('inbox');
  const [itemsToCarryOver, setItemsToCarryOver] = useState([]);
  const [sourceNoteForCarryOver, setSourceNoteForCarryOver] = useState(null);

  const loadNotes = useCallback(() => {
    api.fetchNotes(noteStatusFilter, searchQuery, selectedTag?.id, selectedFolderId)
      .then(response => setNotes(response.data))
      .catch(() => toast.error('無法載入筆記，請稍後再試。'));
  }, [noteStatusFilter, searchQuery, selectedTag, selectedFolderId]);

  const loadTags = useCallback(() => {
    api.fetchTags()
      .then(response => setTags(response.data))
      .catch(() => toast.error('無法載入標籤。'));
  }, []);

  const loadFolders = useCallback(() => {
    api.fetchFolders()
      .then(response => setFolders(response.data))
      .catch(() => toast.error('無法載入資料夾。'));
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadNotes();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, loadNotes]);

  useEffect(() => {
    loadNotes();
  }, [noteStatusFilter, selectedTag, selectedFolderId, loadNotes]);

  useEffect(() => {
    loadTags();
    loadFolders();
  }, [loadTags, loadFolders]);

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
      // This state is now local to MainView
      // setSidebarOpen(false);
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
      setItemsToCarryOver([]);
      setSourceNoteForCarryOver(null);
      setShowWeeklyNoteModal(true);
      return;
    }

    let content;
    let title;
    const folderId = selectedFolderId === 'inbox' ? null : selectedFolderId;

    if (type === 'weekly') {
      title = `週記 (${startDate} ~ ${endDate})`;
      content = { keyFocus: itemsToCarryOver, regularWork: [] };
    } else {
      title = '新筆記';
      content = '...';
    }

    const newNote = { title, content, type, folderId };

    api.createNote(newNote)
      .then(response => {
        const newNoteResponse = response.data;
        toast.success('筆記已建立！');
        setShowWeeklyNoteModal(false);

        if (sourceNoteForCarryOver && itemsToCarryOver.length > 0) {
          const sourceContent = sourceNoteForCarryOver.content;
          const itemsToRemoveTexts = new Set(itemsToCarryOver.map(item => item.text));

          const updatedKeyFocus = (sourceContent.keyFocus || []).filter(item => !itemsToRemoveTexts.has(item.text));
          const updatedRegularWork = (sourceContent.regularWork || []).filter(item => !itemsToRemoveTexts.has(item.text));

          const updatedSourceNotePayload = {
            title: sourceNoteForCarryOver.title,
            content: {
              keyFocus: updatedKeyFocus,
              regularWork: updatedRegularWork
            }
          };
          
          api.updateNote(sourceNoteForCarryOver.id, updatedSourceNotePayload)
            .then(() => {
              toast.success(`已從來源週記中移除 ${itemsToCarryOver.length} 個項目。`);
            })
            .catch(() => {
                toast.error('更新來源週記失敗。');
            })
            .finally(() => {
                setSourceNoteForCarryOver(null);
                setItemsToCarryOver([]);
                loadNotes(); 
                handleNoteSelect(newNoteResponse);
            });
        } else {
            setItemsToCarryOver([]);
            loadNotes();
            handleNoteSelect(newNoteResponse);
        }
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

  const handleArchive = () => {
    if (!activeNote) return;
    api.archiveNote(activeNote.id)
      .then(() => {
        toast.success('筆記已封存。');
        loadNotes();
        setActiveNote(null);
      })
      .catch(() => toast.error('封存筆記失敗。'));
  };

  const handleUnarchive = () => {
    if (!activeNote) return;
    api.unarchiveNote(activeNote.id)
      .then(() => {
        toast.success('筆記已還原。');
        loadNotes();
        setActiveNote(null);
      })
      .catch(() => toast.error('還原筆記失敗。'));
  };

  const handleAddTag = (tagName) => {
    if (!activeNote) return;
    api.addTagToNote(activeNote.id, tagName)
      .then(response => {
        const newTag = response.data.tag;
        setActiveNote(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
        loadTags();
      })
      .catch(() => toast.error('新增標籤失敗。'));
  };

  const handleRemoveTag = (tagId) => {
    if (!activeNote) return;
    api.removeTagFromNote(activeNote.id, tagId)
      .then(() => {
        setActiveNote(prev => ({ ...prev, tags: prev.tags.filter(t => t.id !== tagId) }));
      })
      .catch(() => toast.error('移除標籤失敗。'));
  };

  const handleCarryOver = () => {
    if (!activeNote || activeNote.type !== 'weekly') return;

    const unfinishedItems = [
      ...(activeNote.content.keyFocus || []),
      ...(activeNote.content.regularWork || [])
    ].filter(item => !item.completed);

    if (unfinishedItems.length === 0) {
      toast.info('沒有未完成的項目可以轉移。');
      return;
    }

    setItemsToCarryOver(unfinishedItems.map(item => ({ ...item, completed: false })));
    setSourceNoteForCarryOver(activeNote);
    setShowWeeklyNoteModal(true);
  };

  const handleCreateFolder = (name) => {
    api.createFolder(name)
      .then(() => {
        toast.success(`資料夾 '${name}' 已建立！`);
        loadFolders();
      })
      .catch(() => toast.error('建立資料夾失敗。'));
  };

  const handleMoveNote = (folderId) => {
    if (!activeNote) return;
    api.moveNote(activeNote.id, folderId)
      .then(() => {
        toast.success('筆記已移動。');
        loadNotes();
        setActiveNote(null);
      })
      .catch(() => toast.error('移動筆記失敗。'));
  };

  return (
    <>
      <NoteList 
        notes={notes}
        tags={tags}
        folders={folders}
        activeNote={activeNote}
        onNoteSelect={handleNoteSelect}
        onNewNote={handleNewNote}
        isOpen={isSidebarOpen}
        noteStatusFilter={noteStatusFilter}
        setNoteStatusFilter={setNoteStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        selectedFolderId={selectedFolderId}
        setSelectedFolderId={setSelectedFolderId}
        onCreateFolder={handleCreateFolder}
      />
      <NoteEditor 
        activeNote={activeNote}
        allTags={tags}
        folders={folders}
        onContentChange={handleContentChange}
        onTitleChange={handleTitleChange}
        onSave={handleSave}
        onDelete={handleDeleteRequest}
        onArchive={handleArchive}
        onUnarchive={handleUnarchive}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onCarryOver={handleCarryOver}
        onMoveNote={handleMoveNote}
      />
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
    </>
  );
};

export default MainView;

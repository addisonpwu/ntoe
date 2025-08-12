import React, { useState, useEffect } from 'react';
import { Button, Spinner, Badge, Dropdown } from 'react-bootstrap';
import { FaTrash, FaPlus, FaArchive, FaInbox, FaTimes, FaArrowRight, FaFolderOpen, FaRegStickyNote, FaPaperPlane } from 'react-icons/fa';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as api from '../api';
import { toast } from 'react-toastify';

const TagManager = ({ noteTags, allTags, onAddTag, onRemoveTag, isReadOnly }) => {
  const [selected, setSelected] = useState([]);

  const handleAdd = (selectedItems) => {
    if (isReadOnly || selectedItems.length === 0) return;
    const newTag = selectedItems[0];

    if (typeof newTag === 'string') {
      onAddTag(newTag);
    } 
    else if (newTag.name) {
      if (!(noteTags || []).some(t => t.id === newTag.id)) {
        onAddTag(newTag.name);
      }
    }
    setSelected([]);
  };

  return (
    <div className="tag-manager mt-2 mb-3 p-2 border rounded">
      <div className="d-flex flex-wrap align-items-center mb-2">
        {(noteTags || []).map(tag => (
          <Badge key={tag.id} pill bg="primary" className="me-2 mb-2 d-flex align-items-center tag-item">
            {tag.name}
            {!isReadOnly && (
              <Button variant="link" size="sm" className="p-0 ms-1 text-white" onClick={() => onRemoveTag(tag.id)}>
                <FaTimes />
              </Button>
            )}
          </Badge>
        ))}
      </div>
      <Typeahead
        id="tag-typeahead"
        allowNew
        labelKey="name"
        options={allTags}
        placeholder={isReadOnly ? 'Tags' : '新增或搜尋標籤...'}
        selected={selected}
        onChange={handleAdd}
        size="sm"
        disabled={isReadOnly}
      />
    </div>
  );
};

const WeeklyWorkList = ({ title, items, setItems, isReadOnly }) => {
  const [newItemText, setNewItemText] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAddItem = () => {
    if (isReadOnly || newItemText.trim() === '') return;
    const updatedItems = [...(items || []), { text: newItemText.trim(), completed: false, notes: '' }];
    setItems(updatedItems);
    setNewItemText('');
  };

  const handleRemoveItem = (index) => {
    if (isReadOnly) return;
    const updatedItems = (items || []).filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleToggleCompleted = (index) => {
    if (isReadOnly) return;
    const updatedItems = (items || []).map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
  };

  const handleEditStart = (index, field, initialValue) => {
    if (isReadOnly) return;
    setEditingIndex(index);
    setEditingField(field);
    setEditText(initialValue);
  };

  const handleEditChange = (e) => {
    setEditText(e.target.value);
  };

  const handleEditSave = () => {
    if (editingIndex === null) return;

    const updatedItems = (items || []).map((item, i) => {
      if (i === editingIndex) {
        return { ...item, [editingField]: editText };
      }
      return item;
    });
    setItems(updatedItems);
    setEditingIndex(null);
    setEditingField(null);
    setEditText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    }
  };

  return (
    <div className="weekly-note-section mb-4">
      <h5>{title}</h5>
      <ul className="list-group mb-2">
        {(items || []).map((item, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center flex-grow-1">
              <input 
                type="checkbox" 
                className="form-check-input me-2"
                checked={item.completed}
                onChange={() => handleToggleCompleted(index)}
                disabled={isReadOnly}
              />
              {editingIndex === index && editingField === 'text' ? (
                <input
                  type="text"
                  className="form-control form-control-sm me-2"
                  value={editText}
                  onChange={handleEditChange}
                  onBlur={handleEditSave}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              ) : (
                <span 
                  className={`flex-grow-1 ${item.completed ? 'text-decoration-line-through text-muted' : ''}`}
                  onClick={() => handleEditStart(index, 'text', item.text)}
                >
                  {item.text}
                </span>
              )}
            </div>
            <div className="d-flex align-items-center">
              {editingIndex === index && editingField === 'notes' ? (
                <input
                  type="text"
                  className="form-control form-control-sm me-2"
                  value={editText}
                  onChange={handleEditChange}
                  onBlur={handleEditSave}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="備註..."
                />
              ) : (
                <small 
                  className="text-muted me-2"
                  onClick={() => handleEditStart(index, 'notes', item.notes)}
                >
                  {item.notes || '添加備註'}
                </small>
              )}
              <Button variant="outline-danger" size="sm" onClick={() => handleRemoveItem(index)} disabled={isReadOnly}><FaTrash /></Button>
            </div>
          </li>
        ))}
      </ul>
      {!isReadOnly && (
        <div className="input-group">
          <input 
            type="text" 
            className="form-control" 
            value={newItemText} 
            onChange={(e) => setNewItemText(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(); }} 
            placeholder={`新增${title}...`}
          />
          <Button variant="outline-primary" onClick={handleAddItem}><FaPlus /> 新增</Button>
        </div>
      )}
    </div>
  );
};

const NoteEditor = ({ activeNote, setActiveNote, allTags, folders, onContentChange, onTitleChange, onSave, onDelete, onArchive, onUnarchive, onAddTag, onRemoveTag, onCarryOver, onMoveNote }) => {
  const [isSaving, setIsSaving] = useState(false);

  const isReadOnly = activeNote?.status === 'submitted';

  useEffect(() => {
    if (!activeNote || !activeNote.id || isReadOnly) return;

    setIsSaving(true);
    const handler = setTimeout(() => {
      onSave().finally(() => setIsSaving(false));
    }, 1500);

    return () => {
      clearTimeout(handler);
    };
  }, [activeNote?.title, activeNote?.content, activeNote?.tags, isReadOnly, onSave]);

  const handleNoteSubmit = async () => {
    if (window.confirm('您確定要提交這份周報嗎？提交後將無法修改。')) {
      try {
        await api.submitNote(activeNote.id);
        setActiveNote({ ...activeNote, status: 'submitted' }); // Update local state
        toast.success('周報提交成功！');
      } catch (error) {
        toast.error('提交失敗，請稍後再試。');
      }
    }
  };

  if (!activeNote) {
    return (
      <div className="note-editor-container d-flex flex-column">
        <div className="empty-state">
          <div className="empty-state-icon"><FaRegStickyNote /></div>
          <h5>選擇或建立一篇新筆記</h5>
          <p>從左側選單中選擇一篇筆記，或點擊「新增筆記」按鈕開始。</p>
        </div>
      </div>
    );
  }

  const renderEditor = () => {
    if (activeNote.type === 'weekly') {
      const setKeyFocus = (items) => onContentChange({ ...activeNote.content, keyFocus: items });
      const setRegularWork = (items) => onContentChange({ ...activeNote.content, regularWork: items });

      return (
        <>
          <WeeklyWorkList title="重點工作" items={activeNote.content.keyFocus || []} setItems={setKeyFocus} isReadOnly={isReadOnly} />
          <WeeklyWorkList title="常規工作" items={activeNote.content.regularWork || []} setItems={setRegularWork} isReadOnly={isReadOnly} />
        </>
      )
    } else {
      return (
        <div className="side-by-side-editor">
          <textarea 
            className="editor-pane"
            value={activeNote.content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="# Your markdown here..."
            readOnly={isReadOnly}
          />
          <div className="preview-pane markdown-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {activeNote.content}
            </ReactMarkdown>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="note-editor-container d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input type="text" className="form-control form-control-lg me-2" value={activeNote.title} onChange={onTitleChange} readOnly={isReadOnly} />
        <div className="d-flex align-items-center">
          {isSaving && <Spinner animation="border" size="sm" className="me-2" />}
          
          {activeNote.type === 'weekly' && activeNote.status === 'draft' && (
            <Button variant="success" onClick={handleNoteSubmit} className="me-2">
              <FaPaperPlane className="me-1" /> 提交周報
            </Button>
          )}

          <Dropdown className="me-2">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-move" disabled={isReadOnly}>
              <FaFolderOpen className="me-1" /> 移動
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => onMoveNote(null)}>收件匣</Dropdown.Item>
              {folders.map(folder => (
                <Dropdown.Item key={folder.id} onClick={() => onMoveNote(folder.id)}>{folder.name}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          
          {activeNote.type === 'weekly' && !activeNote.archived && (
            <Button variant="outline-success" onClick={onCarryOver} className="me-2" disabled={isReadOnly}>
              <FaArrowRight className="me-1" /> 轉移
            </Button>
          )}

          {activeNote.archived ? (
            <Button variant="secondary" onClick={onUnarchive} className="me-2">
              <FaInbox className="me-1" /> 還原
            </Button>
          ) : (
            <Button variant="secondary" onClick={onArchive} className="me-2" disabled={isReadOnly}>
              <FaArchive className="me-1" /> 封存
            </Button>
          )}

          <Button variant="danger" onClick={onDelete} disabled={isReadOnly}>
            <FaTrash className="me-1" /> 刪除
          </Button>
        </div>
      </div>
      <TagManager noteTags={activeNote.tags} allTags={allTags} onAddTag={onAddTag} onRemoveTag={onRemoveTag} isReadOnly={isReadOnly} />
      {renderEditor()}
    </div>
  );
};

export default NoteEditor;

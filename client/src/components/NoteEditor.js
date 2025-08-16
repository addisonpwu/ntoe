import React, { useState, useEffect, useRef } from 'react';
import { Button, Spinner, Dropdown, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaTrash, FaPlus, FaArchive, FaInbox, FaTimes, FaArrowRight, FaFolderOpen, FaRegStickyNote, FaPaperPlane, FaTags } from 'react-icons/fa';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as api from '../api';
import { toast } from 'react-toastify';

const WeeklyWorkList = ({ title, items, setItems, isReadOnly, allTags }) => {
  const [newItemText, setNewItemText] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editText, setEditText] = useState('');
  const [tagEditingIndex, setTagEditingIndex] = useState(null);

  const handleAddItem = () => {
    if (isReadOnly || newItemText.trim() === '') return;
    const newItems = [...(items || []), { text: newItemText.trim(), completed: false, notes: '', tags: [] }];
    setItems(newItems);
    setNewItemText('');
    setTagEditingIndex(newItems.length - 1);
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
    setTagEditingIndex(null);
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

  const handleItemTagChange = (itemIndex, newTags) => {
    if (isReadOnly) return;
    const updatedItems = items.map((item, i) =>
      i === itemIndex ? { ...item, tags: newTags.map(t => (typeof t === 'string' ? { name: t } : t)) } : item
    );
    setItems(updatedItems);
  };

  const handleTagEditStart = (index) => {
    if (isReadOnly) return;
    setTagEditingIndex(index);
    setEditingIndex(null);
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
            <div className="d-flex align-items-center flex-grow-1 me-3">
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
                  className="form-control form-control-sm"
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
                  onClick={() => handleEditStart(index, 'notes', item.notes || '')}
                >
                  {item.notes || '添加備註'}
                </small>
              )}
              <div className="me-2" style={{ minWidth: '150px', maxWidth: '300px' }}>
                {tagEditingIndex === index ? (
                  <Typeahead
                    id={`tag-typeahead-${title}-${index}`}
                    multiple
                    labelKey="name"
                    options={allTags}
                    placeholder={isReadOnly ? '' : '新增標籤...'}
                    selected={item.tags || []}
                    onChange={(selected) => handleItemTagChange(index, selected)}
                    onBlur={() => setTagEditingIndex(null)}
                    size="sm"
                    disabled={isReadOnly}
                    autoFocus
                    renderToken={(option, { onRemove }, idx) => (
                      <Badge key={idx} pill bg="secondary" className="me-1 mb-1 d-flex align-items-center">
                        {option.name}
                        {!isReadOnly && 
                          <Button variant="link" size="sm" className="p-0 ms-1 text-white" onClick={() => onRemove(option)}>
                            <FaTimes />
                          </Button>
                        }
                      </Badge>
                    )}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-end flex-wrap" onClick={() => handleTagEditStart(index)} style={{ cursor: 'pointer' }}>
                    {(item.tags && item.tags.length > 0) ? (
                      item.tags.map((tag, idx) => (
                        <Badge key={idx} pill bg="secondary" className="ms-1">
                          {tag.name}
                        </Badge>
                      ))
                    ) : (
                      !isReadOnly && <small className="text-muted fst-italic">無標籤</small>
                    )}
                    {!isReadOnly &&
                      <span className="ms-2 text-primary"><FaTags size=".8em"/></span>
                    }
                  </div>
                )}
              </div>
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

const NoteEditor = ({ activeNote, setActiveNote, allTags, folders, onSave, onDelete, onArchive, onUnarchive, onCarryOver, onMoveNote, onSubmissionComplete }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const saveTimerRef = useRef(null);

  const isReadOnly = false;

  // Reset dirty flag when a new note is selected
  useEffect(() => {
    setIsDirty(false);
  }, [activeNote?.id]);

  // Auto-save when dirty
  useEffect(() => {
    if (!isDirty || !activeNote || !activeNote.id) return;

    clearTimeout(saveTimerRef.current);
    setIsSaving(true);
    saveTimerRef.current = setTimeout(() => {
      onSave().then(() => {
        setIsDirty(false);
      }).finally(() => {
        setIsSaving(false);
      });
    }, 1500);

    return () => {
      clearTimeout(saveTimerRef.current);
    };
  }, [activeNote, isDirty, onSave]);

  const handleContentChange = (content) => {
    setIsDirty(true);
    const newState = { ...activeNote, content };
    if (activeNote.type === 'weekly' && activeNote.status === 'submitted') {
      newState.status = 'draft';
      toast.info('周報已變更，請記得重新提交。', { toastId: 'note-changed' });
    }
    setActiveNote(newState);
  };

  const handleTitleChange = (e) => {
    setIsDirty(true);
    const newTitle = e.target.value;
    const newState = { ...activeNote, title: newTitle };
    if (activeNote.type === 'weekly' && activeNote.status === 'submitted') {
      newState.status = 'draft';
      toast.info('周報已變更，請記得重新提交。', { toastId: 'note-changed' });
    }
    setActiveNote(newState);
  };

  const handleNoteSubmit = () => {
    clearTimeout(saveTimerRef.current);
    
    const unfinishedItems = [
      ...(activeNote.content.keyFocus || []),
      ...(activeNote.content.regularWork || [])
    ].filter(item => !item.completed);

    if (unfinishedItems.length > 0) {
      toast.warn('您有未完成的項目，請先完成或使用「轉移」功能。');
      return;
    }

    setIsSaving(true);
    onSave()
      .then(() => {
        return api.submitNote(activeNote.id);
      })
      .then(() => {
        toast.success('周報提交成功！');
        setIsDirty(false);
        onSubmissionComplete();
      })
      .catch(() => {
        toast.error('提交失敗，請稍後再試。');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (!activeNote) {
    return (
      <div className="note-editor-container glass-effect d-flex flex-column">
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
      const setKeyFocus = (items) => handleContentChange({ ...activeNote.content, keyFocus: items });
      const setRegularWork = (items) => handleContentChange({ ...activeNote.content, regularWork: items });

      return (
        <>
          <WeeklyWorkList title="重點及專項工作" items={activeNote.content.keyFocus || []} setItems={setKeyFocus} isReadOnly={isReadOnly} allTags={allTags} />
          <WeeklyWorkList title="常規工作" items={activeNote.content.regularWork || []} setItems={setRegularWork} isReadOnly={isReadOnly} allTags={allTags} />
        </>
      )
    } else {
      return (
        <div className="side-by-side-editor">
          <textarea 
            className="editor-pane"
            value={activeNote.content}
            onChange={(e) => handleContentChange(e.target.value)}
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
    <div className="note-editor-container glass-effect d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input type="text" className="form-control form-control-lg me-2" value={activeNote.title} onChange={handleTitleChange} readOnly={isReadOnly} />
        <div className="d-flex align-items-center">
          {isSaving && <Spinner animation="border" size="sm" className="me-2" />}
          
          {activeNote.type === 'weekly' && activeNote.status === 'draft' && (
            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-submit">提交周報</Tooltip>}>
              <Button variant="success" onClick={handleNoteSubmit} className="me-2">
                <FaPaperPlane />
              </Button>
            </OverlayTrigger>
          )}

          <Dropdown className="me-2">
            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-move">移動</Tooltip>}>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-move" disabled={isReadOnly}>
                <FaFolderOpen />
              </Dropdown.Toggle>
            </OverlayTrigger>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => onMoveNote(null)}>未分類</Dropdown.Item>
              {folders.map(folder => (
                <Dropdown.Item key={folder.id} onClick={() => onMoveNote(folder.id)}>{folder.name}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          
          {activeNote.type === 'weekly' && !activeNote.archived && (
            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-carryover">轉移</Tooltip>}>
              <Button variant="outline-secondary" onClick={onCarryOver} className="me-2" disabled={isReadOnly}>
                <FaArrowRight />
              </Button>
            </OverlayTrigger>
          )}

          {activeNote.archived ? (
            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-unarchive">還原</Tooltip>}>
              <Button variant="outline-secondary" onClick={onUnarchive} className="me-2">
                <FaInbox />
              </Button>
            </OverlayTrigger>
          ) : (
            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-archive">封存</Tooltip>}>
              <Button variant="outline-secondary" onClick={onArchive} className="me-2" disabled={isReadOnly}>
                <FaArchive />
              </Button>
            </OverlayTrigger>
          )}

          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-delete">刪除</Tooltip>}>
            <Button variant="outline-danger" onClick={onDelete} disabled={isReadOnly}>
              <FaTrash />
            </Button>
          </OverlayTrigger>
        </div>
      </div>
      {renderEditor()}
    </div>
  );
};

export default NoteEditor;

import React, { useState, useEffect } from 'react';
import { Button, Spinner, Nav, Tab } from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const WeeklyWorkList = ({ title, items, setItems }) => {
  const [newItemText, setNewItemText] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingField, setEditingField] = useState(null); // 'text' or 'notes'
  const [editText, setEditText] = useState('');

  const handleAddItem = () => {
    if (newItemText.trim() === '') return;
    const updatedItems = [...items, { text: newItemText.trim(), completed: false, notes: '' }];
    setItems(updatedItems);
    setNewItemText('');
  };

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleToggleCompleted = (index) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
  };

  const handleEditStart = (index, field, initialValue) => {
    setEditingIndex(index);
    setEditingField(field);
    setEditText(initialValue);
  };

  const handleEditChange = (e) => {
    setEditText(e.target.value);
  };

  const handleEditSave = () => {
    if (editingIndex === null) return;

    const updatedItems = items.map((item, i) => {
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
        {items.map((item, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center flex-grow-1">
              <input 
                type="checkbox" 
                className="form-check-input me-2"
                checked={item.completed}
                onChange={() => handleToggleCompleted(index)}
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
              <Button variant="outline-danger" size="sm" onClick={() => handleRemoveItem(index)}><FaTrash /></Button>
            </div>
          </li>
        ))}
      </ul>
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
    </div>
  );
};

const NoteEditor = ({ activeNote, onContentChange, onTitleChange, onSave, onDelete }) => {
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!activeNote || !activeNote.id) return;

    setIsSaving(true);
    const handler = setTimeout(() => {
      onSave().finally(() => setIsSaving(false));
    }, 1500);

    return () => {
      clearTimeout(handler);
    };
  }, [activeNote?.title, activeNote?.content]);

  if (!activeNote) {
    return <div className="text-center text-muted p-4">選擇一則筆記或建立新筆記。</div>;
  }

  const renderEditor = () => {
    if (activeNote.type === 'weekly') {
      const setKeyFocus = (items) => onContentChange({ ...activeNote.content, keyFocus: items });
      const setRegularWork = (items) => onContentChange({ ...activeNote.content, regularWork: items });

      return (
        <>
          <WeeklyWorkList title="重點工作" items={activeNote.content.keyFocus || []} setItems={setKeyFocus} />
          <WeeklyWorkList title="常規工作" items={activeNote.content.regularWork || []} setItems={setRegularWork} />
        </>
      )
    } else {
      return (
        <Tab.Container defaultActiveKey="edit">
          <Nav variant="tabs" className="mb-2">
            <Nav.Item>
              <Nav.Link eventKey="edit">編輯</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="preview">預覽</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className="flex-grow-1 d-flex flex-column">
            <Tab.Pane eventKey="edit" className="flex-grow-1 d-flex flex-column">
              <textarea 
                className="form-control flex-grow-1 markdown-editor"
                value={activeNote.content}
                onChange={(e) => onContentChange(e.target.value)}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="preview" className="markdown-preview p-3 border rounded flex-grow-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {activeNote.content}
              </ReactMarkdown>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      )
    }
  }

  return (
    <div className="col-md-9 note-editor-container d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input type="text" className="form-control form-control-lg me-2" value={activeNote.title} onChange={onTitleChange} />
        <div className="d-flex align-items-center">
          {isSaving && <Spinner animation="border" size="sm" className="me-2" />}
          <Button variant="danger" onClick={onDelete}>
            <FaTrash className="me-1" /> 刪除
          </Button>
        </div>
      </div>
      {renderEditor()}
    </div>
  );
};

export default NoteEditor;
import React, { useMemo } from 'react';
import { Table, Button, Form, Badge, Row, Col } from 'react-bootstrap';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const SortableHeader = ({ children, name, sortConfig, onSort }) => {
  const getSortIcon = () => {
    if (sortConfig.key !== name) {
      return <FaSort className="ms-1 text-muted" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <FaSortUp className="ms-1" />;
    }
    return <FaSortDown className="ms-1" />;
  };

  return (
    <th onClick={() => onSort(name)} style={{ cursor: 'pointer' }}>
      {children}
      {getSortIcon()}
    </th>
  );
};

const NoteTagsDisplay = ({ note }) => {
  const uniqueTags = useMemo(() => {
    if (typeof note.content !== 'object' || note.content === null) {
      return [];
    }
    const allItems = [...(note.content.keyFocus || []), ...(note.content.regularWork || [])];
    const tagMap = new Map();
    allItems.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          if (tag && tag.name) {
            tagMap.set(tag.name, tag);
          }
        });
      }
    });
    return Array.from(tagMap.values());
  }, [note.content]);

  return (
    <div>
      {uniqueTags.map(tag => (
        <Badge key={tag.id || tag.name} pill bg="secondary" className="me-1 mb-1">
          {tag.name}
        </Badge>
      ))}
    </div>
  );
};

const SubmittedNotesView = ({ 
  notes, 
  users, 
  onSelectionChange, 
  selectedIds, 
  onAggregate, 
  isAggregating, 
  onSelectAll, 
  areAllSelected, 
  onSort, 
  sortConfig,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) => (
  <>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>周報審批</h2>
      <Button variant="success" onClick={onAggregate} disabled={selectedIds.size === 0 || isAggregating}>
        {isAggregating ? '正在匯總...' : `匯總選中 (${selectedIds.size})`}
      </Button>
    </div>

    <Form className="mb-3 p-3 border rounded bg-light">
      <Row className="align-items-center">
        <Col md={5}>
          <Form.Group controlId="startDate">
            <Form.Label>開始日期</Form.Label>
            <Form.Control 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </Form.Group>
        </Col>
        <Col md={5}>
          <Form.Group controlId="endDate">
            <Form.Label>結束日期</Form.Label>
            <Form.Control 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </Form.Group>
        </Col>
        <Col md={2} className="d-flex align-items-end">
            <Button variant="outline-secondary" onClick={() => { setStartDate(''); setEndDate(''); }}>清除</Button>
        </Col>
      </Row>
    </Form>

    <Table striped bordered hover responsive size="sm">
      <thead>
        <tr>
          <th style={{ width: '50px' }} className="text-center">
            <Form.Check 
              type="checkbox" 
              onChange={onSelectAll}
              checked={areAllSelected}
              disabled={notes.length === 0}
            />
          </th>
          <SortableHeader name="title" sortConfig={sortConfig} onSort={onSort}>標題</SortableHeader>
          <SortableHeader name="user_id" sortConfig={sortConfig} onSort={onSort}>提交人</SortableHeader>
          <th>標籤</th>
          <SortableHeader name="updated_at" sortConfig={sortConfig} onSort={onSort}>提交時間</SortableHeader>
        </tr>
      </thead>
      <tbody>
        {notes.map(note => (
          <tr key={note.id} className={selectedIds.has(note.id) ? 'table-active' : ''}>
            <td className="text-center">
              <Form.Check 
                type="checkbox" 
                onChange={() => onSelectionChange(note.id)} 
                checked={selectedIds.has(note.id)} 
              />
            </td>
            <td>{note.title}</td>
            <td>{users.find(u => u.id === note.user_id)?.username || 'N/A'}</td>
            <td><NoteTagsDisplay note={note} /></td>
            <td>{new Date(note.updated_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  </>
);

export default SubmittedNotesView;
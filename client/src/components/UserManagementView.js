import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
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

const UserManagementView = ({ users, onShowModal, onDeleteUser, onSort, sortConfig }) => (
  <>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>用戶管理</h2>
      <Button variant="primary" onClick={onShowModal}>創建新用戶</Button>
    </div>
    <Table striped bordered hover responsive size="sm">
      <thead>
        <tr>
          <SortableHeader name="id" sortConfig={sortConfig} onSort={onSort}>ID</SortableHeader>
          <SortableHeader name="username" sortConfig={sortConfig} onSort={onSort}>用戶名</SortableHeader>
          <SortableHeader name="role" sortConfig={sortConfig} onSort={onSort}>角色</SortableHeader>
          <SortableHeader name="created_at" sortConfig={sortConfig} onSort={onSort}>創建時間</SortableHeader>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.username}</td>
            <td><Badge bg={user.role === 'admin' ? 'danger' : 'secondary'}>{user.role}</Badge></td>
            <td>{new Date(user.created_at).toLocaleString()}</td>
            <td><Button variant="outline-danger" size="sm" onClick={() => onDeleteUser(user.id)}>刪除</Button></td>
          </tr>
        ))}
      </tbody>
    </Table>
  </>
);

export default UserManagementView;
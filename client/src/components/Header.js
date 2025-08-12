import React from 'react';
import { Navbar, Button, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaBars, FaUserCircle } from 'react-icons/fa';

const Header = ({ theme, toggleTheme, toggleSidebar, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Navbar as="header" className="app-header">
      <Button variant="outline-secondary" onClick={toggleSidebar} className="d-md-none me-2">
        <FaBars />
      </Button>
      <Navbar.Brand as={Link} to="/">
        <i className="bi bi-journal-text me-2"></i> 我的筆記
      </Navbar.Brand>
      
      <div className="ms-auto d-flex align-items-center">
        <Button variant="outline-secondary" onClick={toggleTheme} className="me-3">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </Button>
        <NavDropdown 
          title={<FaUserCircle size={24} />}
          id="user-dropdown"
          align="end"
        >
          <NavDropdown.Header>Signed in as: <strong>{user?.username}</strong></NavDropdown.Header>
          {user?.role === 'admin' && (
            <NavDropdown.Item as={Link} to="/admin">Admin Dashboard</NavDropdown.Item>
          )}
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
        </NavDropdown>
      </div>
    </Navbar>
  );
};

export default Header;

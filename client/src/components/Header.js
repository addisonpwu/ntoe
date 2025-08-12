import React from 'react';
import { Navbar, Button, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSun, FaMoon, FaBars } from 'react-icons/fa';

const Header = ({ theme, toggleTheme, toggleSidebar }) => {
  return (
    <Navbar as="header" className="app-header">
      <Button variant="outline-secondary" onClick={toggleSidebar} className="d-md-none me-2">
        <FaBars />
      </Button>
      <Navbar.Brand as={Link} to="/">
        <i className="bi bi-journal-text me-2"></i> 我的筆記
      </Navbar.Brand>
      <Nav className="me-auto">
        <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
      </Nav>
      <Button variant="outline-secondary" onClick={toggleTheme} className="ms-auto">
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </Button>
    </Navbar>
  );
};

export default Header;
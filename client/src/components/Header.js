import React from 'react';
import { Navbar, Button } from 'react-bootstrap';
import { FaSun, FaMoon, FaBars } from 'react-icons/fa';

const Header = ({ theme, toggleTheme, toggleSidebar }) => {
  return (
    <Navbar as="header" className="app-header">
      <Button variant="outline-secondary" onClick={toggleSidebar} className="d-md-none me-2">
        <FaBars />
      </Button>
      <Navbar.Brand href="#">
        <i className="bi bi-journal-text me-2"></i> 我的筆記
      </Navbar.Brand>
      <Button variant="outline-secondary" onClick={toggleTheme} className="ms-auto">
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </Button>
    </Navbar>
  );
};

export default Header;
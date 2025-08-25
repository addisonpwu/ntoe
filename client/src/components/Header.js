import React from 'react';
import { Navbar, Button, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaUserCircle } from 'react-icons/fa';

const Header = ({ toggleSidebar, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if(onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="app-header">
      <Container fluid>
        {toggleSidebar && (
          <Button variant="outline-secondary" onClick={toggleSidebar} className="me-2 d-lg-none">
            <FaBars />
          </Button>
        )}
        <Navbar.Brand as={Link} to="/">NTOE</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <NavDropdown title={<><FaUserCircle className="me-1" />{user.username}</>} id="basic-nav-dropdown" align="end">
                {user.role === 'admin' && (
                  <NavDropdown.Item as={Link} to="/admin">Admin Dashboard</NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;

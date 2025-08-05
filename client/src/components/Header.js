import React from 'react';

const Header = () => {
  return (
    <header className="app-header d-flex align-items-center justify-content-between">
      <a className="navbar-brand" href="#">
        <i className="bi bi-journal-text me-2"></i> 我的筆記
      </a>
    </header>
  );
};

export default Header;
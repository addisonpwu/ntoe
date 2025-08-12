import React, { useState, useEffect, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import Header from './Header';

const AppLayout = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Pass isSidebarOpen down to children via Outlet context or props if needed
  // For now, MainView is self-contained, but this is where you'd connect them.

  return (
    <div className="app-container">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        toggleSidebar={toggleSidebar} 
        user={user}
        onLogout={logout}
      />
      <div className="main-content">
        {/* The Outlet will render the nested route's element (MainView or AdminDashboard) */}
        <Outlet /> 
      </div>
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </div>
  );
};

export default AppLayout;

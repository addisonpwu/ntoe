import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import Header from './Header';

const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useContext(AuthContext);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <Header 
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
        theme="dark"
      />
    </div>
  );
};

export default AppLayout;

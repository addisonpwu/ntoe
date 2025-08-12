import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Header from './components/Header';
import MainView from './components/MainView';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <BrowserRouter>
      <div className="app-container">
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          toggleSidebar={toggleSidebar} 
        />
        <div className="main-content">
          <Routes>
            <Route 
              path="/"
              element={<MainView isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />} 
            />
            <Route 
              path="/admin"
              element={<div className="admin-dashboard-container"><AdminDashboard /></div>} 
            />
          </Routes>
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
    </BrowserRouter>
  );
}

export default App;

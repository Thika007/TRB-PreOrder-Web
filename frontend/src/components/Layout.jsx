import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const navigate = useNavigate();

  // Global Keyboard Shortcuts for Counter Cashiers
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F1: Jump directly to Create Order
      if (e.key === 'F1') {
        e.preventDefault();
        navigate('/add-order');
      }
      // F4: Jump directly to Chef Reports
      if (e.key === 'F4') {
        e.preventDefault();
        navigate('/reports_cheff');
      }
      // F2: Jump directly to Customer List
      if (e.key === 'F2') {
        e.preventDefault();
        navigate('/customer_list');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="app-container">
      {/* Permanent Fixed Brand Sidebar */}
      <Sidebar />

      {/* Main Content Shell */}
      <div className="main-wrapper">
        {/* Top Header Navbar */}
        <Navbar />

        {/* Dynamic Route View Canvas */}
        <main className="content-area">
          <Outlet />
        </main>

        {/* Fixed Bottom Keyboard Shortcuts Bar */}
        <footer className="shortcut-bar">
          <div className="shortcuts-group">
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Counter Hotkeys:</span>
            <div className="shortcut-item">
              <span className="key-cap">F1</span>
              <span>New Order</span>
            </div>
            <div className="shortcut-item">
              <span className="key-cap">F2</span>
              <span>Customer Search</span>
            </div>
            <div className="shortcut-item">
              <span className="key-cap">F4</span>
              <span>Kitchen Sheet</span>
            </div>
            <div className="shortcut-item">
              <span className="key-cap">Esc</span>
              <span>Close / Clear</span>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            <span>Local MSSQL Express | 100% Offline Resilient</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

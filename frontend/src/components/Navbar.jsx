import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Database, 
  Clock, 
  User, 
  PlusCircle, 
  ChefHat, 
  LogOut 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [time, setTime] = useState(new Date());
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [dbConnected, setDbConnected] = useState(false);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Database Connectivity Heartbeat
  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await axios.get('/api/health');
        if (res.data.status === 'online') {
          setDbStatus('MSSQL 2019 Active');
          setDbConnected(true);
        } else {
          setDbStatus('DB Degraded');
          setDbConnected(false);
        }
      } catch (err) {
        setDbStatus('DB Disconnected');
        setDbConnected(false);
      }
    };

    checkDb();
    const interval = setInterval(checkDb, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your counter session?')) {
      logout();
      navigate('/login');
    }
  };

  // Map route to exact page title matching trbsys.net
  const getPageTitle = (path) => {
    switch (path) {
      case '/':
      case '/dashboard':
        return 'Dashboard (This Month admin)';
      case '/add-order':
        return 'Create Orders (Showroom Counter Intake)';
      case '/manage_orders':
        return 'Manage Orders (Filter & Payment Settlement)';
      case '/reports_cheff':
        return 'Chef Reports (Order Reports & Baking Schedule)';
      case '/delivery':
        return "Today's Delivery Reports & Collection Dispatch";
      case '/customer_list':
        return 'Customer List (High-Speed Directory)';
      case '/add-product':
        return 'Manage Product & 850+ Catalog';
      case '/manage-categories':
        return 'Manage Product Categories';
      case '/manage-users':
        return 'Manage System Users';
      case '/reports':
        return 'Operational Sales & Payment Reports';
      case '/promotions':
        return 'SMS Promotions Portal';
      default:
        return 'The Royal Bakery POS Portal';
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="page-title">{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="navbar-right">
        {/* Quick Action: New Order */}
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/add-order')}
          title="F1 - New Pre-Order"
        >
          <PlusCircle size={16} />
          <span>New Order</span>
          <span style={{ fontSize: '11px', opacity: 0.85, marginLeft: '2px' }}>(F1)</span>
        </button>

        {/* Quick Action: Chef Sheet */}
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/reports_cheff')}
          title="F4 - Chef Baking Sheet"
        >
          <ChefHat size={16} />
          <span>Kitchen Sheet</span>
        </button>

        {/* MSSQL Connection Heartbeat Badge */}
        <div className={`db-status-badge ${dbConnected ? 'connected' : ''}`}>
          <div className="status-dot"></div>
          <Database size={13} />
          <span>{dbStatus}</span>
        </div>

        {/* Live Digital Clock */}
        <div className="clock-display">
          <Clock size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-1px' }} />
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>

        {/* Active Cashier / Staff Profile */}
        <div className="user-profile-badge">
          <div className="user-avatar">
            <User size={15} />
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.full_name || 'Counter Cashier'}</span>
            <span className="user-role">{user?.user_role || 'Staff'} Station</span>
          </div>
        </div>

        {/* Secure Logout Action */}
        <button
          onClick={handleLogout}
          style={{
            border: 'none',
            background: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#e11d48'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          title="Log Out of Session"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

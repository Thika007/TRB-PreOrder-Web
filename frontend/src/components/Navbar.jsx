import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  User, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [time, setTime] = useState(new Date());

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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

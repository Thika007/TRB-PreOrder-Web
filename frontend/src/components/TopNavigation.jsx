import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Info, 
  Building2, 
  DollarSign,
  Clock, 
  User, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopNavigation() {
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

  // Check active routes
  const isMainAccessActive = [
    '/customer_list', 
    '/add-product', 
    '/manage-categories', 
    '/manage-sub-categories', 
    '/create-users', 
    '/manage-users'
  ].some(p => location.pathname === p);

  const isOrdersActive = [
    '/add-order', 
    '/manage_orders', 
    '/cancel_orders', 
    '/bill_authorized'
  ].some(p => location.pathname === p);

  const isReportsActive = [
    '/reports', 
    '/reports_all', 
    '/overall-invoices', 
    '/reports_products_only', 
    '/reports-overall', 
    '/all-payment'
  ].some(p => location.pathname === p);

  return (
    <header className="top-navigation-container">
      {/* ========================================================
          TIER 1: PRIMARY BRAND & USER HEADER (Dark Navy Theme)
          ======================================================== */}
      <div className="top-brand-bar">
        <div className="brand-left">
          <div className="brand-title-wrap" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <span className="brand-main-text">THE ROYAL BAKERY</span>
            <span className="brand-tagline">PRE-ORDER & PRODUCTION POS</span>
          </div>
        </div>

        <div className="brand-right">
          {/* Live Digital Clock */}
          <div className="clock-pill">
            <Clock size={13} className="clock-icon" />
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          {/* Active Staff Station Profile */}
          <div className="staff-pill">
            <div className="staff-avatar">
              <User size={14} />
            </div>
            <div className="staff-info">
              <span className="staff-name">{user?.full_name || 'System Administrator'}</span>
              <span className="staff-role">{user?.user_role || 'Admin'} Station</span>
            </div>
          </div>

          {/* Red & Gold Circular "RB" Monogram Emblem */}
          <div className="rb-emblem-badge" title="The Royal Bakery - Est. 1906">
            <img 
              src="/logo.webp" 
              alt="The Royal Bakery" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerHTML = '<span class="rb-emblem-text">RB</span>';
                }
              }} 
            />
          </div>

          {/* Logout Action */}
          <button 
            className="top-logout-btn" 
            onClick={handleLogout}
            title="Log Out of POS Session"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>

      {/* ========================================================
          TIER 2: SECONDARY SECTION NAVIGATION BAR (Light Theme)
          Exact trbsys.net 9 tabs with multi-level hover flyouts
          ======================================================== */}
      <nav className="sub-nav-bar">
        <div className="sub-nav-inner">
          {/* 1. DASHBOARD */}
          <NavLink 
            to="/dashboard"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <LayoutGrid size={18} />
            </div>
            <span className="sub-nav-label">Dashboard</span>
          </NavLink>

          {/* 2. MAIN ACCESS (Dropdown with Flyouts) */}
          <div className={`sub-nav-tab dropdown-parent ${isMainAccessActive ? 'active' : ''}`}>
            <div className="sub-nav-icon">
              <Info size={18} />
            </div>
            <span className="sub-nav-label">Main Access</span>

            {/* Level 1 Dropdown Panel */}
            <div className="dropdown-panel">
              {/* System Users (with nested flyout - clicking row navigates to /manage-users) */}
              <div 
                className={`dropdown-menu-row has-flyout ${['/manage-users', '/create-users'].includes(location.pathname) ? 'active' : ''}`}
                onClick={(e) => {
                  if (e.target.closest('.flyout-panel')) return;
                  navigate('/manage-users');
                }}
              >
                <span className="row-text">System Users</span>
                <span className="row-chevron">&gt;</span>

                {/* Level 2 Flyout Menu */}
                <div className="flyout-panel">
                  <NavLink to="/create-users" className="flyout-item">
                    Create User
                  </NavLink>
                  <NavLink to="/manage-users" className="flyout-item">
                    Manage Users
                  </NavLink>
                </div>
              </div>

              {/* Manage Product */}
              <NavLink to="/add-product" className="dropdown-menu-row">
                <span className="row-text">Manage Product</span>
              </NavLink>

              {/* Product Categories (with nested flyout - clicking row navigates to /manage-categories) */}
              <div 
                className={`dropdown-menu-row has-flyout ${['/manage-categories', '/manage-sub-categories'].includes(location.pathname) ? 'active' : ''}`}
                onClick={(e) => {
                  if (e.target.closest('.flyout-panel')) return;
                  navigate('/manage-categories');
                }}
              >
                <span className="row-text">Product Categories</span>
                <span className="row-chevron">&gt;</span>

                {/* Level 2 Flyout Menu */}
                <div className="flyout-panel">
                  <NavLink to="/manage-categories" className="flyout-item">
                    Main Categories
                  </NavLink>
                  <NavLink to="/manage-sub-categories" className="flyout-item">
                    Sub Categories
                  </NavLink>
                </div>
              </div>

              {/* Customer List */}
              <NavLink to="/customer_list" className="dropdown-menu-row">
                <span className="row-text">Customer List</span>
              </NavLink>
            </div>
          </div>

          {/* 3. ORDERS (Dropdown) */}
          <div className={`sub-nav-tab dropdown-parent ${isOrdersActive ? 'active' : ''}`}>
            <div className="sub-nav-icon">
              <Building2 size={18} />
            </div>
            <span className="sub-nav-label">Orders</span>

            {/* Level 1 Dropdown Panel */}
            <div className="dropdown-panel">
              <NavLink to="/manage_orders" className="dropdown-menu-row">
                <span className="row-text">Manage Orders</span>
              </NavLink>
              <NavLink to="/cancel_orders" className="dropdown-menu-row">
                <span className="row-text">Cancelled Orders</span>
              </NavLink>
              <NavLink to="/bill_authorized" className="dropdown-menu-row">
                <span className="row-text">Authorize</span>
              </NavLink>
            </div>
          </div>

          {/* 4. AUTHORIZE BILLS */}
          <NavLink 
            to="/bill_authorized"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <Building2 size={18} />
            </div>
            <span className="sub-nav-label">Authorize Bills</span>
          </NavLink>

          {/* 5. MANAGE ORDERS */}
          <NavLink 
            to="/manage_orders"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <Building2 size={18} />
            </div>
            <span className="sub-nav-label">Manage Orders</span>
          </NavLink>

          {/* 6. CHEF REPORTS */}
          <NavLink 
            to="/reports_cheff"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <Building2 size={18} />
            </div>
            <span className="sub-nav-label">Chef Reports</span>
          </NavLink>

          {/* 7. REPORTS (Dropdown with Flyouts) */}
          <div className={`sub-nav-tab dropdown-parent ${isReportsActive ? 'active' : ''}`}>
            <div className="sub-nav-icon">
              <DollarSign size={18} />
            </div>
            <span className="sub-nav-label">Reports</span>

            {/* Level 1 Dropdown Panel */}
            <div className="dropdown-panel">
              {/* By Invoice (with nested flyout - clicking row navigates to /reports_all) */}
              <div 
                className={`dropdown-menu-row has-flyout ${['/reports_all', '/overall-invoices'].includes(location.pathname) ? 'active' : ''}`}
                onClick={(e) => {
                  if (e.target.closest('.flyout-panel')) return;
                  navigate('/reports_all');
                }}
              >
                <span className="row-text">By Invoice</span>
                <span className="row-chevron">&gt;</span>

                {/* Level 2 Flyout Menu */}
                <div className="flyout-panel">
                  <NavLink to="/reports_all" className="flyout-item">
                    All Report
                  </NavLink>
                  <NavLink to="/overall-invoices" className="flyout-item">
                    Overall Invoices
                  </NavLink>
                </div>
              </div>

              {/* By Product (with nested flyout - clicking row navigates to /reports_products_only) */}
              <div 
                className={`dropdown-menu-row has-flyout ${['/reports_products_only', '/reports-overall'].includes(location.pathname) ? 'active' : ''}`}
                onClick={(e) => {
                  if (e.target.closest('.flyout-panel')) return;
                  navigate('/reports_products_only');
                }}
              >
                <span className="row-text">By Product</span>
                <span className="row-chevron">&gt;</span>

                {/* Level 2 Flyout Menu */}
                <div className="flyout-panel">
                  <NavLink to="/reports_products_only" className="flyout-item">
                    All Product Sales
                  </NavLink>
                  <NavLink to="/reports-overall" className="flyout-item">
                    Overall
                  </NavLink>
                </div>
              </div>

              {/* By Payment */}
              <NavLink to="/all-payment" className="dropdown-menu-row">
                <span className="row-text">By Payment</span>
              </NavLink>
            </div>
          </div>

          {/* 8. SMS PROMOTIONS */}
          <NavLink 
            to="/promotions"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <Building2 size={18} />
            </div>
            <span className="sub-nav-label">SMS Promotions</span>
          </NavLink>

          {/* 9. DELIVERY */}
          <NavLink 
            to="/delivery"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <Building2 size={18} />
            </div>
            <span className="sub-nav-label">Delivery</span>
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  ShoppingBag, 
  ChefHat, 
  Truck, 
  BarChart3, 
  MessageSquare,
  FileText,
  CheckCheck,
  ChevronDown,
  Clock,
  User,
  LogOut,
  Users,
  Layers,
  FolderTree,
  UserCheck,
  PlusCircle,
  XCircle,
  FileSpreadsheet,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [time, setTime] = useState(new Date());
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click or route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your counter session?')) {
      logout();
      navigate('/login');
    }
  };

  const toggleDropdown = (menuName) => {
    setActiveDropdown(prev => prev === menuName ? null : menuName);
  };

  // Check if current path belongs to a dropdown section
  const isMainAccessActive = [
    '/customer_list', 
    '/add-product', 
    '/manage-categories', 
    '/manage-sub-categories', 
    '/create-users', 
    '/manage-users'
  ].some(p => location.pathname.startsWith(p));

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
  ].some(p => location.pathname.startsWith(p));

  return (
    <header className="top-navigation-container" ref={dropdownRef}>
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
          Direct match to trbsys.net 9 primary navigation buttons
          ======================================================== */}
      <nav className="sub-nav-bar">
        <div className="sub-nav-inner">
          {/* 1. DASHBOARD */}
          <NavLink 
            to="/dashboard"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <LayoutDashboard size={20} />
            </div>
            <span className="sub-nav-label">Dashboard</span>
          </NavLink>

          {/* 2. MAIN ACCESS (Dropdown) */}
          <div 
            className={`sub-nav-tab dropdown-trigger ${isMainAccessActive ? 'active' : ''} ${activeDropdown === 'mainAccess' ? 'open' : ''}`}
            onClick={() => toggleDropdown('mainAccess')}
            onMouseEnter={() => setActiveDropdown('mainAccess')}
          >
            <div className="sub-nav-icon">
              <ShieldCheck size={20} />
            </div>
            <div className="sub-nav-label-with-caret">
              <span>Main Access</span>
              <ChevronDown size={12} className="caret-icon" />
            </div>

            {/* Dropdown Menu */}
            {activeDropdown === 'mainAccess' && (
              <div className="nav-dropdown-menu" onMouseLeave={() => setActiveDropdown(null)}>
                <div className="dropdown-section-header">System Users</div>
                <NavLink to="/create-users" className="dropdown-item">
                  <PlusCircle size={15} />
                  <span>Create User</span>
                </NavLink>
                <NavLink to="/manage-users" className="dropdown-item">
                  <Users size={15} />
                  <span>Manage Users</span>
                </NavLink>

                <div className="dropdown-divider" />
                <div className="dropdown-section-header">Product Management</div>
                <NavLink to="/add-product" className="dropdown-item">
                  <Layers size={15} />
                  <span>Manage Product</span>
                </NavLink>
                <NavLink to="/manage-categories" className="dropdown-item">
                  <FolderTree size={15} />
                  <span>Main Categories</span>
                </NavLink>
                <NavLink to="/manage-sub-categories" className="dropdown-item">
                  <FolderTree size={15} />
                  <span>Sub Categories</span>
                </NavLink>

                <div className="dropdown-divider" />
                <div className="dropdown-section-header">Customer Master</div>
                <NavLink to="/customer_list" className="dropdown-item">
                  <UserCheck size={15} />
                  <span>Customer List</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 3. ORDERS (Dropdown) */}
          <div 
            className={`sub-nav-tab dropdown-trigger ${isOrdersActive ? 'active' : ''} ${activeDropdown === 'orders' ? 'open' : ''}`}
            onClick={() => toggleDropdown('orders')}
            onMouseEnter={() => setActiveDropdown('orders')}
          >
            <div className="sub-nav-icon">
              <ShoppingBag size={20} />
            </div>
            <div className="sub-nav-label-with-caret">
              <span>Orders</span>
              <ChevronDown size={12} className="caret-icon" />
            </div>

            {/* Dropdown Menu */}
            {activeDropdown === 'orders' && (
              <div className="nav-dropdown-menu" onMouseLeave={() => setActiveDropdown(null)}>
                <NavLink to="/add-order" className="dropdown-item">
                  <PlusCircle size={15} />
                  <span>Create Orders (F1)</span>
                </NavLink>
                <NavLink to="/manage_orders" className="dropdown-item">
                  <FileText size={15} />
                  <span>Manage Orders</span>
                </NavLink>
                <NavLink to="/cancel_orders" className="dropdown-item">
                  <XCircle size={15} />
                  <span>Cancelled Orders</span>
                </NavLink>
                <NavLink to="/bill_authorized" className="dropdown-item">
                  <CheckCheck size={15} />
                  <span>Authorize Bills</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 4. AUTHORIZE BILLS */}
          <NavLink 
            to="/bill_authorized"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <CheckCheck size={20} />
            </div>
            <span className="sub-nav-label">Authorize Bills</span>
          </NavLink>

          {/* 5. MANAGE ORDERS */}
          <NavLink 
            to="/manage_orders"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <FileText size={20} />
            </div>
            <span className="sub-nav-label">Manage Orders</span>
          </NavLink>

          {/* 6. CHEF REPORTS */}
          <NavLink 
            to="/reports_cheff"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <ChefHat size={20} />
            </div>
            <span className="sub-nav-label">Chef Reports</span>
          </NavLink>

          {/* 7. REPORTS (Dropdown) */}
          <div 
            className={`sub-nav-tab dropdown-trigger ${isReportsActive ? 'active' : ''} ${activeDropdown === 'reports' ? 'open' : ''}`}
            onClick={() => toggleDropdown('reports')}
            onMouseEnter={() => setActiveDropdown('reports')}
          >
            <div className="sub-nav-icon">
              <BarChart3 size={20} />
            </div>
            <div className="sub-nav-label-with-caret">
              <span>Reports</span>
              <ChevronDown size={12} className="caret-icon" />
            </div>

            {/* Dropdown Menu */}
            {activeDropdown === 'reports' && (
              <div className="nav-dropdown-menu" onMouseLeave={() => setActiveDropdown(null)}>
                <div className="dropdown-section-header">By Invoice</div>
                <NavLink to="/reports_all" className="dropdown-item">
                  <FileSpreadsheet size={15} />
                  <span>All Report</span>
                </NavLink>
                <NavLink to="/overall-invoices" className="dropdown-item">
                  <FileText size={15} />
                  <span>Overall Invoices</span>
                </NavLink>

                <div className="dropdown-divider" />
                <div className="dropdown-section-header">By Product</div>
                <NavLink to="/reports_products_only" className="dropdown-item">
                  <Layers size={15} />
                  <span>All Product Sales</span>
                </NavLink>
                <NavLink to="/reports-overall" className="dropdown-item">
                  <BarChart3 size={15} />
                  <span>Overall Product Sales</span>
                </NavLink>

                <div className="dropdown-divider" />
                <div className="dropdown-section-header">By Payment</div>
                <NavLink to="/all-payment" className="dropdown-item">
                  <CreditCard size={15} />
                  <span>By Payment (Reconciliation)</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 8. SMS PROMOTIONS */}
          <NavLink 
            to="/promotions"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <MessageSquare size={20} />
            </div>
            <span className="sub-nav-label">SMS Promotions</span>
          </NavLink>

          {/* 9. DELIVERY */}
          <NavLink 
            to="/delivery"
            className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="sub-nav-icon">
              <Truck size={20} />
            </div>
            <span className="sub-nav-label">Delivery</span>
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

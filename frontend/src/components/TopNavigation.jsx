import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  ShoppingBag,
  FileCheck2,
  ClipboardList,
  ChefHat,
  BarChart3,
  MessageSquareText,
  Truck,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [time, setTime] = useState(new Date());
  const [navState, setNavState] = useState('nav-at-top');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Smart Scroll Navigation Dynamics:
  // - Scrolling down: Hide both top bar and section navbar for maximum canvas view
  // - Scrolling up: Instant smooth slide-down of Section Navbar ONLY (top bar stays hidden)
  // - At the very top (scrollY <= 25): Reveal full header with Top Brand Bar
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY <= 25) {
            setNavState('nav-at-top');
          } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
            setNavState('nav-scrolling-down');
          } else if (currentScrollY < lastScrollY) {
            setNavState('nav-scrolling-up');
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format digital clock display
  const rawTimeString = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const [timeDigits, ampm = ''] = rawTimeString.split(' ');
  const dateFormatted = time.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  // Close logout modal on Escape
  useEffect(() => {
    if (!showLogoutModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowLogoutModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutModal]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  // Check active routes
  const isMainAccessActive = [
    '/create-customer',
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
    <header className={`top-navigation-container ${navState}`}>
      {/* ========================================================
          TIER 1: PRIMARY BRAND & USER HEADER (Dark Navy Theme)
          ======================================================== */}
      <div className="top-brand-bar">
        <div className="top-brand-inner">
          <div className="brand-left">
            <div className="brand-title-wrap" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
              <span className="brand-main-text">THE ROYAL BAKERY</span>
              <span className="brand-tagline">PRE-ORDER & PRODUCTION POS</span>
            </div>
          </div>

          <div className="brand-right">
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
      </div>

      {/* ========================================================
          TIER 2: SECONDARY SECTION NAVIGATION BAR (Light Theme)
          Exact trbsys.net 9 tabs with modern right-side Digital Clock
          ======================================================== */}
      <nav className="sub-nav-bar">
        <div className="sub-nav-inner">
          <div className="sub-nav-tabs-group">
            {/* 1. DASHBOARD */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
            >
              <div className="sub-nav-icon">
                <LayoutDashboard size={18} />
              </div>
              <span className="sub-nav-label">Dashboard</span>
            </NavLink>

            {/* 2. MAIN ACCESS (Dropdown with Flyouts) */}
            <div className={`sub-nav-tab dropdown-parent ${isMainAccessActive ? 'active' : ''}`}>
              <div className="sub-nav-icon">
                <ShieldCheck size={18} />
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

                {/* Create Customer */}
                <NavLink to="/create-customer" className="dropdown-menu-row">
                  <span className="row-text">Create Customer</span>
                </NavLink>

                {/* Customer List */}
                <NavLink to="/customer_list" className="dropdown-menu-row">
                  <span className="row-text">Customer List</span>
                </NavLink>
              </div>
            </div>

            {/* 3. ORDERS (Dropdown - clicking parent tab navigates to /add-order) */}
            <div
              className={`sub-nav-tab dropdown-parent ${isOrdersActive ? 'active' : ''}`}
              onClick={(e) => {
                if (e.target.closest('.dropdown-panel')) return;
                navigate('/add-order');
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="sub-nav-icon">
                <ShoppingBag size={18} />
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
                <FileCheck2 size={18} />
              </div>
              <span className="sub-nav-label">Authorize Bills</span>
            </NavLink>

            {/* 5. MANAGE ORDERS */}
            <NavLink
              to="/manage_orders"
              className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
            >
              <div className="sub-nav-icon">
                <ClipboardList size={18} />
              </div>
              <span className="sub-nav-label">Manage Orders</span>
            </NavLink>

            {/* 6. CHEF REPORTS */}
            <NavLink
              to="/reports_cheff"
              className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
            >
              <div className="sub-nav-icon">
                <ChefHat size={18} />
              </div>
              <span className="sub-nav-label">Chef Reports</span>
            </NavLink>

            {/* 7. REPORTS (Dropdown with Flyouts) */}
            <div
              className={`sub-nav-tab dropdown-parent ${isReportsActive ? 'active' : ''}`}
              onClick={(e) => {
                if (e.target.closest('.dropdown-panel')) return;
                navigate('/reports');
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="sub-nav-icon">
                <BarChart3 size={18} />
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

            {/* 8. SMS PROMOTIONS & 9. DELIVERY (Temporarily hidden while development is on hold)
            <NavLink
              to="/promotions"
              className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
            >
              <div className="sub-nav-icon">
                <MessageSquareText size={18} />
              </div>
              <span className="sub-nav-label">SMS Promotions</span>
            </NavLink>

            <NavLink
              to="/delivery"
              className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
            >
              <div className="sub-nav-icon">
                <Truck size={18} />
              </div>
              <span className="sub-nav-label">Delivery</span>
            </NavLink>
            */}
          </div>

          {/* RIGHT SIDE: MODERN DIGITAL CLOCK WIDGET */}
          <div className="sub-nav-clock-widget" title="Current POS Station Time">
            <div className="digital-clock-body">
              <div className="digital-clock-date-line">
                <span>{dateFormatted}</span>
              </div>
              <div className="digital-clock-time-line">
                <span className="digital-clock-digits">{timeDigits}</span>
                {ampm && <span className="digital-clock-ampm">{ampm}</span>}
              </div>
            </div>
          </div>
        </div>
      </nav>

    {/* ========================================================
        CONFIRMATION MODAL: LOG OUT COUNTER SESSION
        Replaces native window.confirm with branded Royal Bakery modal
        Using createPortal to render directly into document.body
        ======================================================== */}
  {
    showLogoutModal && createPortal(
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowLogoutModal(false);
        }}
      >
        <div
          className="card"
          style={{
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '440px',
            maxWidth: '92vw',
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Top-Right Circular Close Button */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(false)}
            title="Close (Esc)"
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={16} />
          </button>

          {/* Crimson Logout Emblem */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <LogOut size={26} />
          </div>

          {/* Heading */}
          <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
            Log Out of POS Session?
          </h3>

          {/* Subtitle */}
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 18px 0', lineHeight: '1.5' }}>
            Are you sure you want to end your current counter cashier session? Unsaved order form data may be cleared.
          </p>

          {/* Active Cashier Profile Badge */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px'
            }}
          >
            <span style={{ color: '#64748b' }}>Active Cashier:</span>
            <strong style={{ color: '#0f172a' }}>{user?.full_name || user?.username || 'System Administrator'}</strong>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowLogoutModal(false)}
              style={{ flex: 1, padding: '10px 16px', fontWeight: 600, fontSize: '13.5px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmLogout}
              style={{
                flex: 1,
                padding: '10px 16px',
                fontWeight: 700,
                fontSize: '13.5px',
                backgroundColor: '#dc2626',
                borderColor: '#b91c1c',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={16} />
              <span>Yes, Log Out</span>
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }
  </header >
  );
}

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  ShoppingBag, 
  ChefHat, 
  Truck, 
  BarChart3, 
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Cake,
  Users,
  Layers,
  FolderTree,
  UserCheck,
  FileText
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({
    mainAccess: location.pathname.includes('/customer_list') || location.pathname.includes('/add-product') || location.pathname.includes('/manage-users'),
    orders: location.pathname.includes('/add-order') || location.pathname.includes('/manage_orders')
  });

  const toggleSubmenu = (menu) => {
    setOpenSubmenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon-wrap">
          <Cake size={22} />
        </div>
        <div className="brand-text-wrap">
          <span className="brand-name">THE ROYAL BAKERY</span>
          <span className="brand-sub">Pre-Order POS</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        {/* MENU 1: DASHBOARD */}
        <div className="nav-section-title">Overview</div>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        {/* MENU 3: ORDERS (Primary Counter Intake) */}
        <div className="nav-section-title">Showroom Operations</div>
        
        <NavLink 
          to="/add-order" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <ShoppingBag size={18} />
          <span>Create Orders</span>
          <span className="nav-shortcut-badge">F1</span>
        </NavLink>

        <NavLink 
          to="/manage_orders" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>Manage Orders</span>
        </NavLink>

        {/* MENU 4: CHEF REPORTS */}
        <div className="nav-section-title">Kitchen & Logistics</div>
        <NavLink 
          to="/reports_cheff" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <ChefHat size={18} />
          <span>Chef Reports</span>
          <span className="nav-shortcut-badge">F4</span>
        </NavLink>

        {/* MENU 5: DELIVERY */}
        <NavLink 
          to="/delivery" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Truck size={18} />
          <span>Delivery Reports</span>
        </NavLink>

        {/* MENU 2: MAIN ACCESS */}
        <div className="nav-section-title">Master Data & Access</div>
        
        <NavLink 
          to="/customer_list" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <UserCheck size={18} />
          <span>Customer List</span>
        </NavLink>

        <NavLink 
          to="/add-product" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Layers size={18} />
          <span>Manage Products</span>
        </NavLink>

        <NavLink 
          to="/manage-categories" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <FolderTree size={18} />
          <span>Categories</span>
        </NavLink>

        <NavLink 
          to="/manage-users" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>System Users</span>
        </NavLink>

        {/* MENU 6 & 7: REPORTS & PROMOTIONS */}
        <div className="nav-section-title">Analytics & Tools</div>
        <NavLink 
          to="/reports" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          <span>Reports</span>
        </NavLink>

        <NavLink 
          to="/promotions" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <MessageSquare size={18} />
          <span>SMS Promotions</span>
        </NavLink>
      </nav>
    </aside>
  );
}


import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserPlus, 
  Search, 
  Shield, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Lock,
  UserCheck,
  UserX
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function ManageUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to load system users.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle status toggle (Activate / Deactivate)
  const handleToggleStatus = async (user) => {
    if (user.user_id === currentUser?.user_id) {
      setFeedback({
        type: 'error',
        message: 'You cannot change your own account status.'
      });
      return;
    }

    const nextState = !user.is_active;
    const confirmPrompt = nextState
      ? `Activate user "${user.username}"?`
      : `Deactivate user "${user.username}"? They will not be able to log in.`;

    if (!window.confirm(confirmPrompt)) return;

    setActionLoading(user.user_id);
    setFeedback(null);
    try {
      const res = await axios.put(`/api/users/${user.user_id}/status`, { is_active: nextState });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, is_active: nextState } : u));
        setFeedback({
          type: 'success',
          message: `User "${user.username}" status updated successfully.`
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to update user status.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (user) => {
    if (user.user_id === currentUser?.user_id) {
      setFeedback({
        type: 'error',
        message: 'You cannot delete your own administrative account.'
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to remove user "${user.username}"?`)) return;

    setActionLoading(user.user_id);
    setFeedback(null);
    try {
      const res = await axios.delete(`/api/users/${user.user_id}`);
      if (res.data.success) {
        await fetchUsers();
        setFeedback({
          type: 'success',
          message: res.data.message || `User "${user.username}" removed.`
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to delete user.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered users list
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.user_role || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.user_role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'role-badge-admin';
      case 'supervisor': return 'role-badge-supervisor';
      case 'cashier': return 'role-badge-cashier';
      case 'kitchen': return 'role-badge-kitchen';
      case 'accountant': return 'role-badge-accountant';
      default: return 'role-badge-default';
    }
  };

  return (
    <div className="manage-users-page">
      {/* ========================================================
          PAGE HEADER & BREADCRUMBS (Matching trbsys.net)
          ======================================================== */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Manage Users</h1>
          <div className="breadcrumb-nav">
            <Link to="/dashboard" className="breadcrumb-link">The Royal Bakery</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Main Access</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">System Users</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Manage Users</span>
          </div>
        </div>

        {/* Top Right Action Button */}
        <button 
          className="btn-create-user"
          onClick={() => navigate('/create-users')}
          title="Create New System User"
        >
          <UserPlus size={15} />
          <span>Create User</span>
        </button>
      </div>

      {/* ========================================================
          FEEDBACK ALERTS
          ======================================================== */}
      {feedback && (
        <div className={`alert-box ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'} animate-fadeIn`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, color: feedback.type === 'success' ? '#065f46' : '#9f1239' }}>
              {feedback.message}
            </p>
          </div>
          <button 
            className="alert-close-btn" 
            onClick={() => setFeedback(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* ========================================================
          SEARCH & FILTER TOOLBAR
          ======================================================== */}
      <div className="users-toolbar-card">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search by username, full name, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="users-search-input"
          />
        </div>

        <div className="toolbar-actions">
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="role-filter-select"
          >
            <option value="ALL">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Accountant">Accountant</option>
            <option value="Cashier">Cashier</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Kitchen">Kitchen</option>
          </select>

          <button 
            className="btn-refresh"
            onClick={fetchUsers}
            disabled={loading}
            title="Refresh Users List"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          USERS TABLE CARD
          ======================================================== */}
      <div className="users-table-card">
        <div className="table-responsive">
          <table className="trb-custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>User Name</th>
                <th>Full Name</th>
                <th>User Role</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <RefreshCw size={22} className="animate-spin inline-block mb-2" />
                    <div>Loading system users from database...</div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No system users match the criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr key={u.user_id}>
                    <td style={{ fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                    <td>
                      <span className="user-name-cell">{u.username}</span>
                      {u.user_id === currentUser?.user_id && (
                        <span className="current-user-tag">You</span>
                      )}
                    </td>
                    <td style={{ color: '#334155' }}>{u.full_name || '—'}</td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(u.user_role)}`}>
                        {u.user_role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${u.is_active ? 'status-pill-active' : 'status-pill-inactive'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '12.5px' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions-inline">
                        <button
                          type="button"
                          className={`btn-action-icon ${u.is_active ? 'btn-action-deactivate' : 'btn-action-activate'}`}
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoading === u.user_id || u.user_id === currentUser?.user_id}
                          title={u.is_active ? 'Deactivate User' : 'Activate User'}
                        >
                          {u.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon btn-action-delete"
                          onClick={() => handleDeleteUser(u)}
                          disabled={actionLoading === u.user_id || u.user_id === currentUser?.user_id}
                          title="Delete User"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

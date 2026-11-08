import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  UserPlus, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import axios from 'axios';

export default function CreateUser() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    user_type: '',
    full_name: '',
    phone_number: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleCancel = () => {
    setFormData({
      username: '',
      password: '',
      confirm_password: '',
      user_type: '',
      full_name: '',
      phone_number: ''
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side validations
    if (!formData.username.trim()) {
      setErrorMsg('User Name is required.');
      return;
    }
    if (!formData.password) {
      setErrorMsg('Password is required.');
      return;
    }
    if (formData.password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }
    if (!formData.user_type || formData.user_type === 'Select Level') {
      setErrorMsg('Please select a valid User Type (Select Level).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        user_role: formData.user_type,
        full_name: formData.full_name.trim() || formData.username.trim(),
        phone_number: formData.phone_number.trim() || null
      };

      const res = await axios.post('/api/users', payload);

      if (res.data.success) {
        setSuccessMsg(`User "${res.data.user.username}" successfully registered in database as ${res.data.user.user_role}!`);
        // Reset inputs
        setFormData({
          username: '',
          password: '',
          confirm_password: '',
          user_type: '',
          full_name: '',
          phone_number: ''
        });
      } else {
        setErrorMsg(res.data.error || 'Failed to create user.');
      }
    } catch (err) {
      const serverErr = err.response?.data?.error || err.message || 'An error occurred while creating the user.';
      setErrorMsg(serverErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-page">
      {/* ========================================================
          PAGE HEADER & BREADCRUMBS (Matching trbsys.net)
          ======================================================== */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Create User</h1>
          <div className="breadcrumb-nav">
            <Link to="/dashboard" className="breadcrumb-link">The Royal Bakery</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Main Access</span>
            <span className="breadcrumb-separator">/</span>
            <Link to="/manage-users" className="breadcrumb-link">System Users</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Create User</span>
          </div>
        </div>

        {/* Top Right Action Button */}
        <button 
          className="btn-settings"
          onClick={() => navigate('/manage-users')}
          title="System User Settings & Registry"
        >
          <span>Settings</span>
          <Settings size={15} />
        </button>
      </div>

      {/* ========================================================
          FEEDBACK ALERTS
          ======================================================== */}
      {successMsg && (
        <div className="alert-box alert-success animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, color: '#065f46' }}>{successMsg}</p>
          </div>
          <button 
            className="btn-link-action"
            onClick={() => navigate('/manage-users')}
          >
            <span>View Users List</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="alert-box alert-danger animate-fadeIn">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, color: '#9f1239' }}>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* ========================================================
          MAIN FORM CARD (Exact match to uploaded image)
          ======================================================== */}
      <div className="create-user-card">
        <form onSubmit={handleSubmit}>
          <div className="create-user-form-grid">
            {/* 1. User Name */}
            <div className="form-field-group">
              <label className="field-label">
                User Name<span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter User Name"
                className="field-input"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            {/* 2. Password */}
            <div className="form-field-group">
              <label className="field-label">
                Password <span className="required-star">*</span>
              </label>
              <div className="input-with-icon-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="field-input"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* 3. Confirm Password */}
            <div className="form-field-group">
              <label className="field-label">
                Confirm Password <span className="required-star">*</span>
              </label>
              <div className="input-with-icon-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="field-input"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* 4. User Type (Dropdown) */}
            <div className="form-field-group">
              <label className="field-label">
                User Type<span className="required-star">*</span>
              </label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                className="field-select"
                disabled={loading}
              >
                <option value="">Select Level</option>
                <option value="Admin">Admin</option>
                <option value="Accountant">Accountant</option>
                <option value="Cashier">Cashier</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Kitchen">Kitchen (Chef)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons Centered */}
          <div className="form-actions-row">
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <span>Registering User...</span>
              ) : (
                <span>Submit</span>
              )}
            </button>

            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


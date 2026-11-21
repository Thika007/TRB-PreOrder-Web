import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';

export default function CreateCustomer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: 'Mr',
    first_name: '',
    last_name: '',
    mobile: '',
    landline: '',
    email: '',
    customer_type: 'Normal',
    delivery_address: '',
    notes: ''
  });

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
      title: 'Mr',
      first_name: '',
      last_name: '',
      mobile: '',
      landline: '',
      email: '',
      customer_type: 'Normal',
      delivery_address: '',
      notes: ''
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.first_name.trim()) {
      setErrorMsg('First Name is required.');
      return;
    }
    if (!formData.mobile.trim()) {
      setErrorMsg('Mobile Number is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title || 'Mr',
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim() || null,
        mobile: formData.mobile.trim(),
        landline: formData.landline.trim() || null,
        email: formData.email.trim() || null,
        customer_type: formData.customer_type || 'Normal',
        delivery_address: formData.delivery_address.trim() || null,
        notes: formData.notes.trim() || null
      };

      const res = await axios.post('/api/customers', payload);

      if (res.data.success) {
        const created = res.data.customer;
        setSuccessMsg(
          `Customer "${formData.title} ${created.first_name}" (${created.mobile}) successfully saved to database!`
        );
        setFormData({
          title: 'Mr',
          first_name: '',
          last_name: '',
          mobile: '',
          landline: '',
          email: '',
          customer_type: 'Normal',
          delivery_address: '',
          notes: ''
        });
      } else {
        setErrorMsg(res.data.error || res.data.message || 'Failed to create customer.');
      }
    } catch (err) {
      const serverErr =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'An error occurred while creating the customer.';
      setErrorMsg(serverErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-page">
      {/* Page Header & Breadcrumbs */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Create Customer</h1>
          <div className="breadcrumb-nav">
            <Link to="/dashboard" className="breadcrumb-link">The Royal Bakery</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Main Access</span>
            <span className="breadcrumb-separator">/</span>
            <Link to="/customer_list" className="breadcrumb-link">Customer List</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Create Customer</span>
          </div>
        </div>

        <button
          className="btn-settings"
          onClick={() => navigate('/customer_list')}
          title="View All Registered Customers"
        >
          <span>Customer List</span>
          <Users size={15} />
        </button>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="alert-box alert-success animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, color: '#065f46', margin: 0 }}>{successMsg}</p>
          </div>
          <button
            className="btn-link-action"
            onClick={() => navigate('/customer_list')}
          >
            <span>View Customer List</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="alert-box alert-danger animate-fadeIn">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, color: '#9f1239', margin: 0 }}>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="create-user-card">
        <form onSubmit={handleSubmit}>
          <div className="create-user-form-grid">
            {/* 1. Title */}
            <div className="form-field-group">
              <label className="field-label">Title</label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="field-select"
                disabled={loading}
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
                <option value="M/S">M/S</option>
                <option value="Dr">Dr</option>
                <option value="Rev">Rev</option>
                <option value="Co.">Co. (Company)</option>
              </select>
            </div>

            {/* 2. First Name */}
            <div className="form-field-group">
              <label className="field-label">
                First Name<span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter First Name"
                className="field-input"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            {/* 3. Last Name */}
            <div className="form-field-group">
              <label className="field-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter Last Name (Optional)"
                className="field-input"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            {/* 4. Mobile Number */}
            <div className="form-field-group">
              <label className="field-label">
                Mobile Number<span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. 0771234567"
                className="field-input"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            {/* 5. Landline */}
            <div className="form-field-group">
              <label className="field-label">Landline</label>
              <input
                type="text"
                name="landline"
                value={formData.landline}
                onChange={handleChange}
                placeholder="e.g. 0112588501 (Optional)"
                className="field-input"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            {/* 6. Email */}
            <div className="form-field-group">
              <label className="field-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com (Optional)"
                className="field-input"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            {/* 7. Customer Type */}
            <div className="form-field-group">
              <label className="field-label">Customer Type</label>
              <select
                name="customer_type"
                value={formData.customer_type}
                onChange={handleChange}
                className="field-select"
                disabled={loading}
              >
                <option value="Normal">Normal</option>
                <option value="Credit">Credit</option>
              </select>
            </div>

            {/* 8. Delivery Address */}
            <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Delivery Address</label>
              <input
                type="text"
                name="delivery_address"
                value={formData.delivery_address}
                onChange={handleChange}
                placeholder="Enter Delivery Address (Leave blank for Showroom Pickup)"
                className="field-input"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            {/* 8. Notes */}
            <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Customer Notes</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Special preferences or remarks (Optional)"
                className="field-input"
                autoComplete="off"
                disabled={loading}
              />
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
                <span>Saving Customer...</span>
              ) : (
                <span>Save Customer</span>
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

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpDown, 
  RefreshCw 
} from 'lucide-react';
import axios from 'axios';

export default function ManageSubCategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [nextSubCatId, setNextSubCatId] = useState('SCAT71');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    sub_cat_id: 'SCAT71',
    main_cat_id: '',
    sub_category_name: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Table Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('sub_cat_id');
  const [sortAsc, setSortAsc] = useState(true);

  // Feedback Alerts
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Load Subcategories, Main Categories & Next ID from API
  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, mainRes, nextRes] = await Promise.all([
        axios.get('/api/products/subcategories?all=true'),
        axios.get('/api/products/categories?all=true'),
        axios.get('/api/products/subcategories/next-id')
      ]);

      if (subRes.data.success) {
        setSubcategories(subRes.data.subcategories || []);
      }
      if (mainRes.data.success) {
        const mains = mainRes.data.categories || [];
        setMainCategories(mains);
        // Default main category if not set
        if (!formData.main_cat_id && mains.length > 0) {
          setFormData(prev => ({ ...prev, main_cat_id: mains[0].main_cat_id }));
        }
      }
      if (nextRes.data.success) {
        const nextId = nextRes.data.next_sub_cat_id;
        setNextSubCatId(nextId);
        if (!isEditing) {
          setFormData(prev => ({ ...prev, sub_cat_id: nextId }));
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to load subcategories from database.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      sub_cat_id: nextSubCatId,
      main_cat_id: mainCategories[0]?.main_cat_id || '',
      sub_category_name: '',
      description: ''
    });
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!formData.main_cat_id) {
      setFeedback({ type: 'error', message: 'Main Category is required.' });
      return;
    }
    if (!formData.sub_category_name.trim()) {
      setFeedback({ type: 'error', message: 'Sub Category name is required.' });
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        // Update existing subcategory
        const res = await axios.put(`/api/products/subcategories/${editingId}`, {
          main_cat_id: formData.main_cat_id,
          sub_category_name: formData.sub_category_name.trim(),
          description: formData.description.trim()
        });

        if (res.data.success) {
          setFeedback({
            type: 'success',
            message: `Sub Category "${editingId}" updated successfully!`
          });
          handleCancel();
          await loadData();
        }
      } else {
        // Create new subcategory
        const res = await axios.post('/api/products/subcategories', {
          sub_cat_id: formData.sub_cat_id,
          main_cat_id: formData.main_cat_id,
          sub_category_name: formData.sub_category_name.trim(),
          description: formData.description.trim()
        });

        if (res.data.success) {
          setFeedback({
            type: 'success',
            message: `Sub Category "${formData.sub_category_name.trim()}" (${formData.sub_cat_id}) created successfully!`
          });
          handleCancel();
          await loadData();
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to save sub category.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sub) => {
    setIsEditing(true);
    setEditingId(sub.sub_cat_id);
    setFormData({
      sub_cat_id: sub.sub_cat_id,
      main_cat_id: sub.main_cat_id,
      sub_category_name: sub.sub_category_name,
      description: sub.description || ''
    });
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (sub) => {
    if (!window.confirm(`Are you sure you want to remove Sub Category "${sub.sub_category_name}" (${sub.sub_cat_id})?`)) {
      return;
    }

    try {
      const res = await axios.delete(`/api/products/subcategories/${sub.sub_cat_id}`);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message
        });
        await loadData();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to delete sub category.'
      });
    }
  };

  // Sort and Filter logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredSubcategories = useMemo(() => {
    return subcategories.filter(s => {
      const term = searchTerm.toLowerCase();
      const idMatch = (s.sub_cat_id || '').toLowerCase().includes(term);
      const mainMatch = (s.main_category_name || '').toLowerCase().includes(term);
      const subMatch = (s.sub_category_name || '').toLowerCase().includes(term);
      const descMatch = (s.description || '').toLowerCase().includes(term);
      return idMatch || mainMatch || subMatch || descMatch;
    }).sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (sortField === 'sub_cat_id') {
        const numA = parseInt((valA || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt((valB || '').replace(/\D/g, ''), 10) || 0;
        return sortAsc ? numA - numB : numB - numA;
      }

      const cmp = valA.toString().localeCompare(valB.toString());
      return sortAsc ? cmp : -cmp;
    });
  }, [subcategories, searchTerm, sortField, sortAsc]);

  // Pagination calculation
  const totalEntries = filteredSubcategories.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentEntries = filteredSubcategories.slice(startIndex, endIndex);

  return (
    <div className="manage-categories-page">
      {/* ========================================================
          PAGE HEADER & BREADCRUMBS (Matching trbsys.net)
          ======================================================== */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Manage Sub Categories</h1>
          <div className="breadcrumb-nav">
            <Link to="/dashboard" className="breadcrumb-link">The Royal Bakery</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Sub Access</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Categories</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Sub Categories</span>
          </div>
        </div>
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
          <button className="alert-close-btn" onClick={() => setFeedback(null)}>×</button>
        </div>
      )}

      {/* ========================================================
          FEED SUB CATEGORIES FORM CARD (Matching trbsys.net)
          ======================================================== */}
      <div className="category-form-card">
        <div className="category-form-header">
          <h2 className="category-form-title">
            {isEditing ? `EDIT SUB CATEGORY (${editingId})` : 'FEED SUB CATEGORIES'}
          </h2>
          <p className="category-form-subtitle">
            Sub Categories added on here will be shown on down below.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="subcategory-form-grid">
            {/* 1. SUB CAT ID# */}
            <div className="form-field-group">
              <label className="field-label">SUB CAT ID#</label>
              <input
                type="text"
                value={formData.sub_cat_id}
                readOnly
                disabled
                className="field-input field-input-readonly"
              />
            </div>

            {/* 2. Main Category Dropdown */}
            <div className="form-field-group">
              <label className="field-label">Main Category</label>
              <select
                name="main_cat_id"
                value={formData.main_cat_id}
                onChange={handleChange}
                className="field-select"
                disabled={submitting}
              >
                {mainCategories.map(m => (
                  <option key={m.main_cat_id} value={m.main_cat_id}>
                    {m.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Sub Category Name */}
            <div className="form-field-group">
              <label className="field-label">Sub Category</label>
              <input
                type="text"
                name="sub_category_name"
                value={formData.sub_category_name}
                onChange={handleChange}
                placeholder="Enter Sub Category"
                className="field-input"
                autoComplete="off"
                disabled={submitting}
              />
            </div>

            {/* 4. Sub Category Description */}
            <div className="form-field-group">
              <label className="field-label">Sub Category Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter Sub Category Description"
                className="field-input"
                autoComplete="off"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Centered Action Buttons */}
          <div className="form-actions-row">
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditing ? 'Update' : 'Submit'}
            </button>

            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================
          SUB CATEGORIES DATA TABLE CARD (Matching trbsys.net)
          ======================================================== */}
      <div className="categories-table-container">
        {/* Table Controls (Show entries & Search) */}
        <div className="table-controls-bar">
          <div className="entries-selector">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="entries-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="table-search-box">
            <label className="search-label">Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="table-search-input"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive">
          <table className="categories-data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('sub_cat_id')} style={{ width: '120px', cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>ID</span>
                    <ArrowUpDown size={12} className="sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('main_category_name')} style={{ width: '180px', cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Main Category</span>
                    <ArrowUpDown size={12} className="sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('sub_category_name')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Sub Category</span>
                    <ArrowUpDown size={12} className="sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Sub Category Description</span>
                    <ArrowUpDown size={12} className="sort-icon" />
                  </div>
                </th>
                <th style={{ width: '100px', textAlign: 'center' }}>
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty-table-cell">
                    <RefreshCw size={20} className="animate-spin inline-block mb-2" />
                    <div>Loading subcategories from database...</div>
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-cell">
                    No matching subcategories found.
                  </td>
                </tr>
              ) : (
                currentEntries.map(s => (
                  <tr key={s.sub_cat_id}>
                    <td className="cat-id-cell">{s.sub_cat_id}</td>
                    <td className="cat-main-cell" style={{ color: '#475569', fontWeight: 500 }}>
                      {s.main_category_name}
                    </td>
                    <td className="cat-name-cell">{s.sub_category_name}</td>
                    <td className="cat-desc-cell">{s.description || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="cat-actions-inline">
                        <button
                          type="button"
                          className="btn-cat-action btn-cat-edit"
                          onClick={() => handleEdit(s)}
                          title={`Edit ${s.sub_category_name}`}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-cat-action btn-cat-delete"
                          onClick={() => handleDelete(s)}
                          title={`Delete ${s.sub_category_name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="table-pagination-bar">
          <div className="pagination-info">
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="btn-page-nav"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                className={`btn-page-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="btn-page-nav"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

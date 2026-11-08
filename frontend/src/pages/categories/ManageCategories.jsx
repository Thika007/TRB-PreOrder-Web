import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ArrowUpDown, 
  RefreshCw,
  FolderTree
} from 'lucide-react';
import axios from 'axios';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [nextCatId, setNextCatId] = useState('MCAT9');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    main_cat_id: 'MCAT9',
    category_name: '',
    chef_description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Table Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('main_cat_id');
  const [sortAsc, setSortAsc] = useState(true);

  // Feedback Alerts
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Load Categories & Next ID from API
  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, nextRes] = await Promise.all([
        axios.get('/api/products/categories?all=true'),
        axios.get('/api/products/categories/next-id')
      ]);

      if (catRes.data.success) {
        setCategories(catRes.data.categories || []);
      }
      if (nextRes.data.success) {
        const nextId = nextRes.data.next_cat_id;
        setNextCatId(nextId);
        if (!isEditing) {
          setFormData(prev => ({ ...prev, main_cat_id: nextId }));
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to load categories from database.'
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
      main_cat_id: nextCatId,
      category_name: '',
      chef_description: ''
    });
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!formData.category_name.trim()) {
      setFeedback({ type: 'error', message: 'Main Category name is required.' });
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        // Update existing category
        const res = await axios.put(`/api/products/categories/${editingId}`, {
          category_name: formData.category_name.trim(),
          chef_description: formData.chef_description.trim()
        });

        if (res.data.success) {
          setFeedback({
            type: 'success',
            message: `Category "${editingId}" updated successfully!`
          });
          handleCancel();
          await loadData();
        }
      } else {
        // Create new category
        const res = await axios.post('/api/products/categories', {
          main_cat_id: formData.main_cat_id,
          category_name: formData.category_name.trim(),
          chef_description: formData.chef_description.trim()
        });

        if (res.data.success) {
          setFeedback({
            type: 'success',
            message: `Main Category "${formData.category_name.trim()}" (${formData.main_cat_id}) created successfully!`
          });
          // Reset form with new next ID
          handleCancel();
          await loadData();
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to save main category.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setIsEditing(true);
    setEditingId(cat.main_cat_id);
    setFormData({
      main_cat_id: cat.main_cat_id,
      category_name: cat.category_name,
      chef_description: cat.chef_description || ''
    });
    setFeedback(null);
    // Scroll form into view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to remove Main Category "${cat.category_name}" (${cat.main_cat_id})?`)) {
      return;
    }

    try {
      const res = await axios.delete(`/api/products/categories/${cat.main_cat_id}`);
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
        message: err.response?.data?.error || 'Failed to delete category.'
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

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const term = searchTerm.toLowerCase();
      const idMatch = (c.main_cat_id || '').toLowerCase().includes(term);
      const nameMatch = (c.category_name || '').toLowerCase().includes(term);
      const descMatch = (c.chef_description || '').toLowerCase().includes(term);
      return idMatch || nameMatch || descMatch;
    }).sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (sortField === 'main_cat_id') {
        const numA = parseInt((valA || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt((valB || '').replace(/\D/g, ''), 10) || 0;
        return sortAsc ? numA - numB : numB - numA;
      }

      const cmp = valA.toString().localeCompare(valB.toString());
      return sortAsc ? cmp : -cmp;
    });
  }, [categories, searchTerm, sortField, sortAsc]);

  // Pagination calculation
  const totalEntries = filteredCategories.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentEntries = filteredCategories.slice(startIndex, endIndex);

  return (
    <div className="manage-categories-page">
      {/* ========================================================
          PAGE HEADER & BREADCRUMBS (Matching trbsys.net)
          ======================================================== */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Manage Main Categories</h1>
          <div className="breadcrumb-nav">
            <Link to="/dashboard" className="breadcrumb-link">The Royal Bakery</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Main Access</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Categories</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Main Categories</span>
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
          FEED MAIN CATEGORIES FORM CARD (Matching trbsys.net)
          ======================================================== */}
      <div className="category-form-card">
        <div className="category-form-header">
          <h2 className="category-form-title">
            {isEditing ? `EDIT MAIN CATEGORY (${editingId})` : 'FEED MAIN CATEGORIES'}
          </h2>
          <p className="category-form-subtitle">
            Main Categories added on here will be shown on down below.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="category-form-grid">
            {/* 1. CAT ID# */}
            <div className="form-field-group">
              <label className="field-label">CAT ID#</label>
              <input
                type="text"
                value={formData.main_cat_id}
                readOnly
                disabled
                className="field-input field-input-readonly"
              />
            </div>

            {/* 2. Main Category */}
            <div className="form-field-group">
              <label className="field-label">Main Category</label>
              <input
                type="text"
                name="category_name"
                value={formData.category_name}
                onChange={handleChange}
                placeholder="Enter Main Category"
                className="field-input"
                autoComplete="off"
                disabled={submitting}
              />
            </div>

            {/* 3. Main Category Description */}
            <div className="form-field-group">
              <label className="field-label">Main Category Description</label>
              <input
                type="text"
                name="chef_description"
                value={formData.chef_description}
                onChange={handleChange}
                placeholder="Enter Main Category Description"
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
          CATEGORIES DATA TABLE CARD (Matching trbsys.net)
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
                <th onClick={() => handleSort('main_cat_id')} style={{ width: '130px', cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>ID</span>
                    <ArrowUpDown size={12} className="sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('category_name')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Main Category</span>
                    <ArrowUpDown size={12} className="sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('chef_description')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Main Category Description</span>
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
                  <td colSpan="4" className="empty-table-cell">
                    <RefreshCw size={20} className="animate-spin inline-block mb-2" />
                    <div>Loading categories from database...</div>
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-table-cell">
                    No matching categories found.
                  </td>
                </tr>
              ) : (
                currentEntries.map(c => (
                  <tr key={c.main_cat_id}>
                    <td className="cat-id-cell">{c.main_cat_id}</td>
                    <td className="cat-name-cell">{c.category_name}</td>
                    <td className="cat-desc-cell">{c.chef_description || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="cat-actions-inline">
                        <button
                          type="button"
                          className="btn-cat-action btn-cat-edit"
                          onClick={() => handleEdit(c)}
                          title={`Edit ${c.category_name}`}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-cat-action btn-cat-delete"
                          onClick={() => handleDelete(c)}
                          title={`Delete ${c.category_name}`}
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

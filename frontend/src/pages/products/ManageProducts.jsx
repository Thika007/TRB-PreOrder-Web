import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  RotateCcw
} from 'lucide-react';
import axios from 'axios';

export default function ManageProducts() {
  // Master lists
  const [products, setProducts] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  // Loading & submission states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    main_cat_id: '0',
    sub_cat_id: '0',
    product_name: '',
    unit_price: '',
    net_weight: '',
    description: '',
    is_discountable: '1' // 1: Discount, 0: Non Discount
  });

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Table Controls
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'discount', 'nondiscount'
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('product_id');
  const [sortAsc, setSortAsc] = useState(true);

  // Load Initial Master Data
  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes, subCatsRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/products/categories?all=true'),
        axios.get('/api/products/subcategories?all=true')
      ]);

      if (prodsRes.data && prodsRes.data.success) {
        setProducts(prodsRes.data.products || []);
      }
      if (catsRes.data && catsRes.data.success) {
        setMainCategories(catsRes.data.categories || []);
      }
      if (subCatsRes.data && subCatsRes.data.success) {
        setAllSubCategories(subCatsRes.data.subcategories || []);
      }
    } catch (err) {
      console.error('Failed to load product data:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to load products from database.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  // Update dynamic Subcategories dropdown when Main Category changes
  useEffect(() => {
    if (!formData.main_cat_id || formData.main_cat_id === '0') {
      setFilteredSubCategories([]);
    } else {
      // Find subcategories belonging to this main category
      const subs = allSubCategories.filter(s => 
        s.main_cat_id === formData.main_cat_id || 
        (s.main_category_name && s.main_category_name.toLowerCase() === formData.main_cat_id.toLowerCase())
      );
      setFilteredSubCategories(subs);
    }
  }, [formData.main_cat_id, allSubCategories]);

  // Handle Form Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Reset subcategory if main category changes
      if (name === 'main_cat_id') {
        updated.sub_cat_id = '0';
      }
      return updated;
    });
  };

  // Reset / Cancel Form
  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      main_cat_id: '0',
      sub_cat_id: '0',
      product_name: '',
      unit_price: '',
      net_weight: '',
      description: '',
      is_discountable: '1'
    });
    setFeedback(null);
  };

  // Handle Form Submit (Save / Update Product)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    // Validations
    if (!formData.product_name.trim()) {
      setFeedback({ type: 'error', message: 'Product Name is required.' });
      return;
    }
    if (!formData.unit_price || isNaN(parseFloat(formData.unit_price))) {
      setFeedback({ type: 'error', message: 'Valid Product Price is required.' });
      return;
    }
    if (formData.main_cat_id === '0' || !formData.main_cat_id) {
      setFeedback({ type: 'error', message: 'Please select a Main Category.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        main_cat_id: formData.main_cat_id,
        sub_cat_id: formData.sub_cat_id !== '0' ? formData.sub_cat_id : null,
        product_name: formData.product_name.trim(),
        unit_price: parseFloat(formData.unit_price),
        net_weight: formData.net_weight.trim() || null,
        description: formData.description.trim() || null,
        is_discountable: formData.is_discountable === '1'
      };

      if (isEditing) {
        const res = await axios.put(`/api/products/${editingId}`, payload);
        if (res.data.success) {
          setFeedback({
            type: 'success',
            message: res.data.message || `Product #${editingId} updated successfully.`
          });
          handleCancel();
          await loadMasterData();
        }
      } else {
        const res = await axios.post('/api/products', payload);
        if (res.data.success) {
          setFeedback({
            type: 'success',
            message: res.data.message || 'Product created successfully.'
          });
          handleCancel();
          await loadMasterData();
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Operation failed. Please verify input.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger Edit
  const handleEdit = (product) => {
    setIsEditing(true);
    setEditingId(product.product_id);

    // Find main_cat_id
    let mainId = product.main_cat_id || '0';
    if (!mainId && product.main_category_name) {
      const match = mainCategories.find(m => m.category_name.toLowerCase() === product.main_category_name.toLowerCase());
      if (match) mainId = match.main_cat_id;
    }

    // Find sub_cat_id
    let subId = product.sub_cat_id || '0';
    if (!subId && product.sub_category_name) {
      const match = allSubCategories.find(s => s.sub_category_name.toLowerCase() === product.sub_category_name.toLowerCase());
      if (match) subId = match.sub_cat_id;
    }

    setFormData({
      main_cat_id: mainId,
      sub_cat_id: subId,
      product_name: product.product_name || '',
      unit_price: product.unit_price !== undefined ? product.unit_price.toString() : '',
      net_weight: product.net_weight || '',
      description: product.description || '',
      is_discountable: product.is_discountable ? '1' : '0'
    });

    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trigger Delete
  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete Product "${product.product_name}" (#${product.product_id})?`)) {
      return;
    }

    try {
      const res = await axios.delete(`/api/products/${product.product_id}`);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || `Product #${product.product_id} removed.`
        });
        await loadMasterData();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to delete product.'
      });
    }
  };

  // Sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Status filter
      if (statusFilter === 'discount' && !p.is_discountable) return false;
      if (statusFilter === 'nondiscount' && p.is_discountable) return false;

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const idMatch = (p.product_id || '').toString().includes(term);
        const nameMatch = (p.product_name || '').toLowerCase().includes(term);
        const mainMatch = (p.main_category_name || '').toLowerCase().includes(term);
        const subMatch = (p.sub_category_name || '').toLowerCase().includes(term);
        const priceMatch = (p.unit_price || '').toString().includes(term);
        const weightMatch = (p.net_weight || '').toString().toLowerCase().includes(term);
        return idMatch || nameMatch || mainMatch || subMatch || priceMatch || weightMatch;
      }
      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'product_id' || sortField === 'unit_price') {
        const numA = parseFloat(valA) || 0;
        const numB = parseFloat(valB) || 0;
        return sortAsc ? numA - numB : numB - numA;
      }

      valA = (valA || '').toString().toLowerCase();
      valB = (valB || '').toString().toLowerCase();
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [products, statusFilter, searchTerm, sortField, sortAsc]);

  // Pagination Calculation
  const totalEntries = filteredProducts.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentEntries = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="manage-categories-page">
      {/* ========================================================
          PAGE HEADER & BREADCRUMBS (Matching trbsys.net)
          ======================================================== */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Create Product</h1>
          <div className="breadcrumb-nav">
            <Link to="/dashboard" className="breadcrumb-link">The Royal Bakery</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Main Access</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Product Info</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Create Product</span>
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
          <button 
            type="button" 
            onClick={() => setFeedback(null)} 
            className="alert-close-btn"
          >
            ×
          </button>
        </div>
      )}

      {/* ========================================================
          FEED PRODUCT ITEM INFORMATION FORM CARD
          ======================================================== */}
      <div className="category-form-card">
        <div className="category-form-header">
          <h3 className="category-form-title">FEED PRODUCT ITEM INFORMATION</h3>
          <p className="category-form-subtitle">To bill customer you must enter all of your product list</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row 1: Main Category, Sub Category, Product Name, Price */}
          <div className="product-form-grid-row1">
            {/* 1. Main Category */}
            <div className="form-field-group">
              <label className="field-label">
                Product Main Category <span className="required-star">*</span>
              </label>
              <select
                name="main_cat_id"
                value={formData.main_cat_id}
                onChange={handleChange}
                className="field-select"
                required
              >
                <option value="0">-- Select Main Category --</option>
                {mainCategories.map(cat => (
                  <option key={cat.main_cat_id} value={cat.main_cat_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Sub Category (Dynamically filtered) */}
            <div className="form-field-group">
              <label className="field-label">
                Product Sub Category
              </label>
              <select
                name="sub_cat_id"
                value={formData.sub_cat_id}
                onChange={handleChange}
                className="field-select"
                disabled={filteredSubCategories.length === 0}
              >
                <option value="0">-- Select Sub Category --</option>
                {filteredSubCategories.map(sub => (
                  <option key={sub.sub_cat_id} value={sub.sub_cat_id}>
                    {sub.sub_category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Product Name */}
            <div className="form-field-group">
              <label className="field-label">
                Product Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                placeholder="Enter Product Name"
                className="field-input"
                required
              />
            </div>

            {/* 4. Product Price */}
            <div className="form-field-group">
              <label className="field-label">
                Product Price <span className="required-star">*</span>
              </label>
              <input
                type="number"
                step="any"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                placeholder="Example 10.00"
                className="field-input"
                required
              />
            </div>
          </div>

          {/* Row 2: Net Weight, Description, Discount */}
          <div className="product-form-grid-row2">
            {/* 5. Net Weight */}
            <div className="form-field-group">
              <label className="field-label">
                Net Weight <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="net_weight"
                value={formData.net_weight}
                onChange={handleChange}
                placeholder="Net Weight"
                className="field-input"
              />
            </div>

            {/* 6. Description */}
            <div className="form-field-group">
              <label className="field-label">
                Description <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter Product Description"
                className="field-input"
              />
            </div>

            {/* 7. Discount Status */}
            <div className="form-field-group">
              <label className="field-label">
                Discount <span className="required-star">*</span>
              </label>
              <select
                name="is_discountable"
                value={formData.is_discountable}
                onChange={handleChange}
                className="field-select"
              >
                <option value="1">Discount</option>
                <option value="0">Non Discount</option>
              </select>
            </div>
          </div>

          {/* Centered Action Buttons */}
          <div className="form-actions-row">
            <button
              type="submit"
              disabled={submitting}
              className="btn-submit"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================
          PRODUCTS DATA TABLE & CONTROLS
          ======================================================== */}
      <div className="categories-table-container">
        {/* Table Controls Bar: Status Filter, Entries Selector & Search */}
        <div className="table-controls-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Status Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="search-label">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="entries-select"
                style={{ width: '160px' }}
              >
                <option value="all">Show all</option>
                <option value="discount">Discount Product</option>
                <option value="nondiscount">NonDiscount Product</option>
              </select>
            </div>

            {/* Entries Selector */}
            <div className="entries-selector">
              <span>Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
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
          </div>

          {/* Search Box */}
          <div className="table-search-box">
            <span className="search-label">Search:</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products..."
              className="table-search-input"
            />
          </div>
        </div>

        {/* Products Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="categories-data-table">
            <thead>
              <tr>
                {/* 1. Product ID */}
                <th onClick={() => handleSort('product_id')} style={{ cursor: 'pointer', width: '100px' }}>
                  <div className="th-content">
                    <span>Product ID</span>
                    <span className="sort-icon">
                      {sortField === 'product_id' ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronsUpDown size={14} />}
                    </span>
                  </div>
                </th>

                {/* 2. Product Name */}
                <th onClick={() => handleSort('product_name')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Product Name</span>
                    <span className="sort-icon">
                      {sortField === 'product_name' ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronsUpDown size={14} />}
                    </span>
                  </div>
                </th>

                {/* 3. Main Category */}
                <th onClick={() => handleSort('main_category_name')} style={{ cursor: 'pointer', width: '140px' }}>
                  <div className="th-content">
                    <span>Main Category</span>
                    <span className="sort-icon">
                      {sortField === 'main_category_name' ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronsUpDown size={14} />}
                    </span>
                  </div>
                </th>

                {/* 4. Sub Category */}
                <th onClick={() => handleSort('sub_category_name')} style={{ cursor: 'pointer', width: '150px' }}>
                  <div className="th-content">
                    <span>Sub Category</span>
                    <span className="sort-icon">
                      {sortField === 'sub_category_name' ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronsUpDown size={14} />}
                    </span>
                  </div>
                </th>

                {/* 5. Net Weight */}
                <th onClick={() => handleSort('net_weight')} style={{ cursor: 'pointer', width: '110px' }}>
                  <div className="th-content">
                    <span>Net Weight</span>
                    <span className="sort-icon">
                      {sortField === 'net_weight' ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronsUpDown size={14} />}
                    </span>
                  </div>
                </th>

                {/* 6. Price */}
                <th onClick={() => handleSort('unit_price')} style={{ cursor: 'pointer', width: '110px' }}>
                  <div className="th-content">
                    <span>Price</span>
                    <span className="sort-icon">
                      {sortField === 'unit_price' ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronsUpDown size={14} />}
                    </span>
                  </div>
                </th>

                {/* 7. Discount Status */}
                <th onClick={() => handleSort('is_discountable')} style={{ cursor: 'pointer', width: '160px' }}>
                  <div className="th-content">
                    <span>Discount Status</span>
                    <span className="sort-icon">
                      {sortField === 'is_discountable' ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronsUpDown size={14} />}
                    </span>
                  </div>
                </th>

                {/* 8. Actions */}
                <th style={{ width: '100px', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="empty-table-cell">
                    Loading products catalog from database...
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table-cell">
                    No products found matching filter criteria.
                  </td>
                </tr>
              ) : (
                currentEntries.map(prod => (
                  <tr key={prod.product_id}>
                    {/* ID */}
                    <td className="cat-id-cell">
                      {prod.product_id}
                    </td>

                    {/* Name */}
                    <td className="cat-name-cell">
                      {prod.product_name}
                    </td>

                    {/* Main Category */}
                    <td className="cat-desc-cell">
                      {prod.main_category_name || '-'}
                    </td>

                    {/* Sub Category */}
                    <td className="cat-desc-cell">
                      {prod.sub_category_name || '-'}
                    </td>

                    {/* Net Weight */}
                    <td className="cat-desc-cell">
                      {prod.net_weight || ''}
                    </td>

                    {/* Price */}
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {prod.unit_price !== undefined ? Number(prod.unit_price).toFixed(0) : ''}
                    </td>

                    {/* Discount Status */}
                    <td>
                      <span className={`discount-status-badge ${prod.is_discountable ? 'discount-status-discount' : 'discount-status-nondiscount'}`}>
                        {prod.is_discountable ? 'Discount Product' : 'NonDiscount Product'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="cat-actions-inline">
                        <button
                          type="button"
                          onClick={() => handleEdit(prod)}
                          className="btn-cat-action btn-cat-edit"
                          title="Edit Product"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prod)}
                          className="btn-cat-action btn-cat-delete"
                          title="Delete Product"
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

        {/* Pagination Bar */}
        <div className="table-pagination-bar">
          <div>
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-page-nav"
            >
              Previous
            </button>

            {/* Page number buttons */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = idx + 1;
              } else if (currentPage <= 4) {
                pageNum = idx + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + idx;
              } else {
                pageNum = currentPage - 3 + idx;
              }

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`btn-page-number ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="btn-page-nav"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

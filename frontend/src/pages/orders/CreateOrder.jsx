import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Trash2, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  RotateCcw, 
  User, 
  Clock, 
  Calendar,
  DollarSign,
  Cake,
  FileText
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function CreateOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ========================================================
  // 1. CATALOG STATE (Categories, Subcategories, Products)
  // ========================================================
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Active Item Builder State
  const [itemMainCatId, setItemMainCatId] = useState('');
  const [itemSubCatId, setItemSubCatId] = useState('');
  const [itemProductId, setItemProductId] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemDescription, setItemDescription] = useState('');
  const [itemGreeting1, setItemGreeting1] = useState('None');
  const [itemGreeting2, setItemGreeting2] = useState('None');
  const [itemGreetingInfo2, setItemGreetingInfo2] = useState('');
  const [itemStatus, setItemStatus] = useState('Pending');

  // Filtered dropdown lists for item builder
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // ========================================================
  // 2. ORDER ITEMS CART STATE
  // ========================================================
  const [orderItems, setOrderItems] = useState([]);

  // ========================================================
  // 3. CUSTOMER INFORMATION STATE
  // ========================================================
  const [custTitle, setCustTitle] = useState('Mr');
  const [custFirstName, setCustFirstName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custTelephone, setCustTelephone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  // Tomorrow's date in YYYY-MM-DD
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [deliveryDate, setDeliveryDate] = useState(tomorrowStr);
  const [deliveryTime, setDeliveryTime] = useState('11:00');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Mobile autocomplete state
  const [mobileSuggestions, setMobileSuggestions] = useState([]);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const mobileInputRef = useRef(null);

  // ========================================================
  // 4. PAYMENT & TOTALS STATE
  // ========================================================
  const [paymentType, setPaymentType] = useState('Cash');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [manufactureDate, setManufactureDate] = useState(tomorrowStr);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [serviceChargePercent, setServiceChargePercent] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Operation Feedback & Modal States
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [orderSuccessModal, setOrderSuccessModal] = useState(null);

  // ========================================================
  // LOAD CATALOG DATA ON COMPONENT MOUNT
  // ========================================================
  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoadingCatalog(true);
        const [catsRes, subcatsRes, prodsRes] = await Promise.all([
          axios.get('/api/products/categories'),
          axios.get('/api/products/subcategories'),
          axios.get('/api/products?is_available=1')
        ]);

        if (catsRes.data.success) {
          setMainCategories(catsRes.data.categories || []);
        }
        if (subcatsRes.data.success) {
          setSubCategories(subcatsRes.data.subcategories || []);
        }
        if (prodsRes.data.success) {
          setAllProducts(prodsRes.data.products || []);
        }
      } catch (err) {
        console.error('Error loading product catalog for orders:', err);
        setFeedback({ type: 'danger', message: 'Failed to load catalog data from server. Please refresh.' });
      } finally {
        setLoadingCatalog(false);
      }
    }

    loadCatalog();
  }, []);

  // Sync Subcategories when Main Category changes
  useEffect(() => {
    if (!itemMainCatId || itemMainCatId === '0') {
      setFilteredSubCategories([]);
      setItemSubCatId('');
      setFilteredProducts([]);
      setItemProductId('');
      setItemPrice('');
      return;
    }

    // Filter subcategories for this main category
    const subs = subCategories.filter(s => String(s.main_cat_id) === String(itemMainCatId));
    setFilteredSubCategories(subs);
    setItemSubCatId('');

    // Filter products matching main category
    const prods = allProducts.filter(p => String(p.main_cat_id) === String(itemMainCatId));
    setFilteredProducts(prods);
    setItemProductId('');
    setItemPrice('');
  }, [itemMainCatId, subCategories, allProducts]);

  // Sync Products when Subcategory changes
  useEffect(() => {
    if (!itemSubCatId || itemSubCatId === '0') {
      if (itemMainCatId) {
        const prods = allProducts.filter(p => String(p.main_cat_id) === String(itemMainCatId));
        setFilteredProducts(prods);
      } else {
        setFilteredProducts([]);
      }
      setItemProductId('');
      setItemPrice('');
      return;
    }

    // Filter products matching both main and sub category
    const prods = allProducts.filter(
      p => String(p.main_cat_id) === String(itemMainCatId) && String(p.sub_cat_id) === String(itemSubCatId)
    );
    setFilteredProducts(prods);
    setItemProductId('');
    setItemPrice('');
  }, [itemSubCatId, itemMainCatId, allProducts]);

  // Auto-fill price when product is selected
  useEffect(() => {
    if (!itemProductId || itemProductId === '0') {
      setItemPrice('');
      return;
    }

    const prd = allProducts.find(p => String(p.product_id) === String(itemProductId));
    if (prd) {
      setItemPrice(prd.unit_price !== undefined ? Number(prd.unit_price).toFixed(2) : '');
    }
  }, [itemProductId, allProducts]);

  // Auto-search customers by mobile
  useEffect(() => {
    const q = custMobile.trim();
    if (q.length >= 3) {
      const timer = setTimeout(async () => {
        try {
          const res = await axios.get(`/api/customers/search?q=${encodeURIComponent(q)}`);
          if (res.data.success && res.data.customers.length > 0) {
            setMobileSuggestions(res.data.customers);
            setShowMobileDropdown(true);
          } else {
            setMobileSuggestions([]);
            setShowMobileDropdown(false);
          }
        } catch (e) {
          console.warn('Customer lookup error:', e.message);
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setMobileSuggestions([]);
      setShowMobileDropdown(false);
    }
  }, [custMobile]);

  // Customer selected from suggestions dropdown
  const handleSelectCustomer = (c) => {
    setSelectedCustomerId(c.customer_id);
    setCustTitle(c.title || 'Mr');
    setCustFirstName(c.first_name || '');
    setCustMobile(c.mobile || '');
    setCustTelephone(c.landline || '');
    if (c.delivery_address) {
      setDeliveryAddress(c.delivery_address);
    }
    setShowMobileDropdown(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileInputRef.current && !mobileInputRef.current.contains(e.target)) {
        setShowMobileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ========================================================
  // ADD PRODUCT TO ORDER ITEMS LIST
  // ========================================================
  const handleAddProduct = () => {
    setFeedback(null);
    if (!itemProductId || itemProductId === '0') {
      setFeedback({ type: 'danger', message: 'Please select a valid Product before adding.' });
      return;
    }

    const prd = allProducts.find(p => String(p.product_id) === String(itemProductId));
    if (!prd) {
      setFeedback({ type: 'danger', message: 'Selected product could not be found.' });
      return;
    }

    const qtyNum = parseFloat(itemQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setFeedback({ type: 'danger', message: 'Quantity must be greater than zero.' });
      return;
    }

    const priceNum = parseFloat(itemPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setFeedback({ type: 'danger', message: 'Please enter a valid unit price.' });
      return;
    }

    const itemTotal = Number((qtyNum * priceNum).toFixed(2));

    const newItem = {
      temp_id: Date.now() + Math.random(),
      product_id: prd.product_id,
      product_name: prd.product_name,
      quantity: qtyNum,
      unit_price: priceNum,
      total_price: itemTotal,
      description: itemDescription.trim(),
      greeting_occasion: itemGreeting1 !== 'None' ? itemGreeting1 : null,
      greeting_milestone: itemGreeting2 !== 'None' ? itemGreeting2 : null,
      greeting_icing_text: itemDescription.trim() || null,
      greeting_info2: itemGreetingInfo2.trim() || null,
      status: itemStatus || 'Pending'
    };

    setOrderItems(prev => [...prev, newItem]);

    // Reset item builder for next product
    setItemDescription('');
    setItemGreeting1('None');
    setItemGreeting2('None');
    setItemGreetingInfo2('');
    setItemQty(1);
    // Keep category selection for rapid multi-item entry
  };

  // Remove Item from Cart
  const handleRemoveItem = (tempId) => {
    setOrderItems(prev => prev.filter(item => item.temp_id !== tempId));
  };

  // ========================================================
  // FINANCIAL TOTALS CALCULATION
  // ========================================================
  const subTotal = orderItems.reduce((acc, curr) => acc + curr.total_price, 0);
  const discountPctNum = parseFloat(discountPercent) || 0;
  const discountAmount = Number((subTotal * (discountPctNum / 100)).toFixed(2));
  const serviceChargePctNum = parseFloat(serviceChargePercent) || 0;
  const serviceChargeAmount = Number((subTotal * (serviceChargePctNum / 100)).toFixed(2));
  const deliveryChargeNum = parseFloat(deliveryCharge) || 0;
  const netTotal = Number((subTotal - discountAmount + serviceChargeAmount + deliveryChargeNum).toFixed(2));
  const advanceAmountNum = parseFloat(advanceAmount) || 0;
  const balanceDue = Math.max(0, Number((netTotal - advanceAmountNum).toFixed(2)));

  // ========================================================
  // SUBMIT ORDER TRANSACTION
  // ========================================================
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (orderItems.length === 0) {
      setFeedback({ type: 'danger', message: 'Please add at least one product to the order list.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!custFirstName.trim()) {
      setFeedback({ type: 'danger', message: 'Customer First Name is required.' });
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    if (!custMobile.trim()) {
      setFeedback({ type: 'danger', message: 'Customer Mobile Number is required.' });
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    if (!deliveryDate) {
      setFeedback({ type: 'danger', message: 'Please specify the Date of Delivery.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customer_id: selectedCustomerId,
        customer: {
          title: custTitle,
          first_name: custFirstName.trim(),
          mobile: custMobile.trim(),
          telephone: custTelephone.trim(),
          delivery_address: deliveryAddress.trim()
        },
        ordered_by: user?.user_name || 'Admin',
        delivery_date: deliveryDate,
        delivery_time: deliveryTime || '11:00 AM',
        delivery_type: deliveryAddress.trim() ? 'Home Delivery' : 'Showroom Pickup',
        delivery_address: deliveryAddress.trim(),
        manufacture_date: manufactureDate || deliveryDate,
        sub_total: subTotal,
        discount_percent: discountPctNum,
        discount_amount: discountAmount,
        service_charge: serviceChargeAmount,
        delivery_charge: deliveryChargeNum,
        total_amount: netTotal,
        advance_amount: advanceAmountNum,
        payment_type: paymentType,
        items: orderItems,
        created_by_user_id: user?.user_id || 1
      };

      const res = await axios.post('/api/orders', payload);

      if (res.data.success) {
        setOrderSuccessModal({
          order_id: res.data.order_id,
          order_number: res.data.order_number,
          receipt_no: res.data.receipt_no,
          customer_name: `${custTitle} ${custFirstName}`,
          customer_mobile: custMobile,
          delivery_date: deliveryDate,
          delivery_time: deliveryTime || '11:00 AM',
          total_amount: netTotal,
          advance_amount: advanceAmountNum,
          balance_amount: res.data.balance_amount !== undefined ? res.data.balance_amount : balanceDue,
          payment_status: res.data.payment_status || (balanceDue <= 0 ? 'Fully Paid' : 'Advance Paid'),
          items_count: orderItems.length
        });
        
        handleReset();
      } else {
        setFeedback({ type: 'danger', message: res.data.error || 'Failed to create order.' });
      }
    } catch (err) {
      console.error('Order creation error:', err);
      const msg = err.response?.data?.error || err.message || 'Server error while saving order.';
      setFeedback({ type: 'danger', message: msg });
    } finally {
      setSaving(false);
    }
  };

  // Reset entire form
  const handleReset = () => {
    setOrderItems([]);
    setItemMainCatId('');
    setItemSubCatId('');
    setItemProductId('');
    setItemPrice('');
    setItemQty(1);
    setItemDescription('');
    setItemGreeting1('None');
    setItemGreeting2('None');
    setItemGreetingInfo2('');
    setItemStatus('Pending');

    setCustTitle('Mr');
    setCustFirstName('');
    setCustMobile('');
    setCustTelephone('');
    setDeliveryAddress('');
    setSelectedCustomerId(null);
    setDeliveryDate(tomorrowStr);
    setDeliveryTime('11:00');

    setPaymentType('Cash');
    setDiscountPercent(0);
    setManufactureDate(tomorrowStr);
    setAdvanceAmount('');
    setServiceChargePercent(0);
    setDeliveryCharge(0);
  };

  return (
    <div className="manage-categories-page">
      {/* ========================================================
          PAGE HEADER & BREADCRUMBS (Matching trbsys.net standard)
          ======================================================== */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Create Orders</h1>
          <div className="breadcrumb-nav">
            <Link to="/dashboard" className="breadcrumb-link">The Royal Bakery</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link">Orders</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Create Orders</span>
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
            <p style={{ fontWeight: 600, color: feedback.type === 'success' ? '#065f46' : '#9f1239', margin: 0 }}>
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
          CARD 1: FILL ORDER INFORMATION (Exact trbsys.net Card 1)
          ======================================================== */}
      <div className="category-form-card">
        <div className="category-form-header">
          <h3 className="category-form-title">FILL ORDER INFORMATION</h3>
          <p className="category-form-subtitle">Select product hierarchy, specify cake greetings, and add items</p>
        </div>

        {/* Row 1: Main-Product-Type*, Sub-Product-Type, Product, Price, Qty */}
        <div className="order-info-grid-row1">
          {/* 1. Main-Product-Type* */}
          <div className="form-field-group">
            <label className="field-label">
              Main-Product-Type<span className="required-star">*</span>
            </label>
            <select
              value={itemMainCatId}
              onChange={(e) => setItemMainCatId(e.target.value)}
              className="field-select"
              disabled={loadingCatalog}
            >
              <option value="">Select M-Product Type</option>
              {mainCategories.map(cat => (
                <option key={cat.main_cat_id} value={cat.main_cat_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Sub-Product-Type */}
          <div className="form-field-group">
            <label className="field-label">Sub-Product-Type</label>
            <select
              value={itemSubCatId}
              onChange={(e) => setItemSubCatId(e.target.value)}
              className="field-select"
              disabled={filteredSubCategories.length === 0}
            >
              <option value="">Select S-Product Type</option>
              {filteredSubCategories.map(sub => (
                <option key={sub.sub_cat_id} value={sub.sub_cat_id}>
                  {sub.sub_category_name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Product */}
          <div className="form-field-group">
            <label className="field-label">
              Product<span className="required-star">*</span>
            </label>
            <select
              value={itemProductId}
              onChange={(e) => setItemProductId(e.target.value)}
              className="field-select"
              disabled={filteredProducts.length === 0}
            >
              <option value="">Select Product Type</option>
              {filteredProducts.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  {p.product_name} {p.net_weight ? `(${p.net_weight})` : ''} - Rs. {Number(p.unit_price).toFixed(0)}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Price */}
          <div className="form-field-group">
            <label className="field-label">Price</label>
            <input
              type="number"
              step="any"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              placeholder="0.00"
              className="field-input"
            />
          </div>

          {/* 5. Qty */}
          <div className="form-field-group">
            <label className="field-label">Qty</label>
            <input
              type="number"
              min="1"
              step="1"
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)}
              placeholder="1"
              className="field-input"
            />
          </div>
        </div>

        {/* Row 2: Description, Greetings *, Greetings *, Greetings info2, Status* */}
        <div className="order-info-grid-row2">
          {/* Description */}
          <div className="form-field-group">
            <label className="field-label">Description</label>
            <input
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Special instructions or notes"
              className="field-input"
            />
          </div>

          {/* Greetings 1 (Occasion) */}
          <div className="form-field-group">
            <label className="field-label">
              Greetings <span className="required-star">*</span>
            </label>
            <select
              value={itemGreeting1}
              onChange={(e) => setItemGreeting1(e.target.value)}
              className="field-select"
            >
              <option value="None">None</option>
              <option value="Happy Birthday">Happy Birthday</option>
              <option value="Happy Anniversary">Happy Anniversary</option>
              <option value="Congratulations">Congratulations</option>
              <option value="Best Wishes">Best Wishes</option>
              <option value="Happy Wedding Day">Happy Wedding Day</option>
              <option value="Get Well Soon">Get Well Soon</option>
              <option value="Bon Voyage">Bon Voyage</option>
            </select>
          </div>

          {/* Greetings 2 (Milestone / Age) */}
          <div className="form-field-group">
            <label className="field-label">
              Greetings <span className="required-star">*</span>
            </label>
            <select
              value={itemGreeting2}
              onChange={(e) => setItemGreeting2(e.target.value)}
              className="field-select"
            >
              <option value="None">None</option>
              <option value="1st">1st</option>
              <option value="16th">16th</option>
              <option value="18th">18th</option>
              <option value="21st">21st</option>
              <option value="25th">25th</option>
              <option value="30th">30th</option>
              <option value="40th">40th</option>
              <option value="50th">50th</option>
              <option value="60th">60th</option>
              <option value="70th">70th</option>
              <option value="75th">75th</option>
              <option value="80th">80th</option>
              <option value="90th">90th</option>
              <option value="100th">100th</option>
            </select>
          </div>

          {/* Greetings info2 (Icing text) */}
          <div className="form-field-group">
            <label className="field-label">Greetings info2</label>
            <input
              type="text"
              value={itemGreetingInfo2}
              onChange={(e) => setItemGreetingInfo2(e.target.value)}
              placeholder="Icing text on cake"
              className="field-input"
            />
          </div>

          {/* Status */}
          <div className="form-field-group">
            <label className="field-label">
              Status<span className="required-star">*</span>
            </label>
            <select
              value={itemStatus}
              onChange={(e) => setItemStatus(e.target.value)}
              className="field-select"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Row 3: Add Product Button */}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            type="button"
            onClick={handleAddProduct}
            className="btn btn-primary"
            style={{ minWidth: '160px', padding: '10px 24px' }}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          CARD 2: ORDER ITEMS TABLE (Exact trbsys.net Items Grid)
          ======================================================== */}
      <div className="category-form-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="categories-data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '240px' }}>Product Name</th>
                <th style={{ minWidth: '220px' }}>Description</th>
                <th style={{ minWidth: '80px', textAlign: 'center' }}>Qty</th>
                <th style={{ minWidth: '120px', textAlign: 'right' }}>Unit Price</th>
                <th style={{ minWidth: '130px', textAlign: 'right' }}>Total</th>
                <th style={{ minWidth: '90px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table-cell" style={{ padding: '40px' }}>
                    No products added to this order yet. Use the form above to add items.
                  </td>
                </tr>
              ) : (
                orderItems.map((item, idx) => (
                  <tr key={item.temp_id}>
                    <td className="cat-name-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#258be0', fontWeight: '700' }}>#{idx + 1}</span>
                        <span>{item.product_name}</span>
                      </div>
                    </td>
                    <td className="cat-desc-cell">
                      <div>
                        {item.description && <div>{item.description}</div>}
                        {(item.greeting_occasion || item.greeting_milestone || item.greeting_info2) && (
                          <div style={{ fontSize: '11.5px', color: '#0284c7', marginTop: '2px', fontWeight: 500 }}>
                            🎂 {item.greeting_occasion ? item.greeting_occasion : ''} 
                            {item.greeting_milestone ? ` (${item.greeting_milestone})` : ''} 
                            {item.greeting_info2 ? ` • "${item.greeting_info2}"` : ''}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {Number(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.temp_id)}
                        className="btn-cat-action btn-cat-delete"
                        title="Remove Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {orderItems.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                  <td colSpan="4" style={{ textAlign: 'right', fontWeight: 800, fontSize: '14px', color: '#0f172a', padding: '14px 16px' }}>
                    Total :
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '16px', color: '#258be0', padding: '14px 16px' }}>
                    Rs. {subTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder}>
        {/* ========================================================
            CARD 3: FILL CUSTOMER INFORMATION TO CREATE ORDER
            ======================================================== */}
        <div className="category-form-card">
          <div className="category-form-header">
            <h3 className="category-form-title">FILL CUSTOMER INFORMATION TO CREATE ORDER</h3>
            <p className="category-form-subtitle">Enter customer contact details, delivery date, time, and address</p>
          </div>

          {/* Row 1: Title, First Name*, Mobile*, Telephone, Ordered By */}
          <div className="order-customer-grid-row1">
            {/* Title */}
            <div className="form-field-group">
              <label className="field-label">Title</label>
              <select
                value={custTitle}
                onChange={(e) => setCustTitle(e.target.value)}
                className="field-select"
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
                <option value="Dr">Dr</option>
                <option value="Rev">Rev</option>
              </select>
            </div>

            {/* First Name* */}
            <div className="form-field-group">
              <label className="field-label">
                First Name<span className="required-star">*</span>
              </label>
              <input
                type="text"
                value={custFirstName}
                onChange={(e) => setCustFirstName(e.target.value)}
                placeholder="Enter customer name"
                className="field-input"
                required
              />
            </div>

            {/* Mobile* (With Live Search Autocomplete) */}
            <div className="form-field-group autocomplete-wrapper" ref={mobileInputRef}>
              <label className="field-label">
                Mobile<span className="required-star">*</span>
              </label>
              <input
                type="text"
                value={custMobile}
                onChange={(e) => {
                  setCustMobile(e.target.value);
                  setSelectedCustomerId(null);
                }}
                onFocus={() => {
                  if (mobileSuggestions.length > 0) setShowMobileDropdown(true);
                }}
                placeholder="07XXXXXXXX"
                className="field-input"
                required
              />
              {/* Autocomplete Dropdown */}
              {showMobileDropdown && mobileSuggestions.length > 0 && (
                <div className="autocomplete-dropdown">
                  {mobileSuggestions.map(c => (
                    <div
                      key={c.customer_id}
                      className="autocomplete-item"
                      onClick={() => handleSelectCustomer(c)}
                    >
                      <span className="autocomplete-item-name">{c.title ? `${c.title} ` : ''}{c.first_name}</span>
                      <span className="autocomplete-item-mobile">{c.mobile}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Telephone */}
            <div className="form-field-group">
              <label className="field-label">Telephone</label>
              <input
                type="text"
                value={custTelephone}
                onChange={(e) => setCustTelephone(e.target.value)}
                placeholder="Landline (optional)"
                className="field-input"
              />
            </div>

            {/* Ordered By (Readonly) */}
            <div className="form-field-group">
              <label className="field-label">Ordered By</label>
              <input
                type="text"
                value={user?.user_name || user?.full_name || 'Admin'}
                readOnly
                className="field-input field-input-readonly"
              />
            </div>
          </div>

          {/* Row 2: Date of Delivery, Time, Delivery Address */}
          <div className="order-customer-grid-row2">
            {/* Date of Delivery */}
            <div className="form-field-group">
              <label className="field-label">
                Date of Delivery<span className="required-star">*</span>
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => {
                  setDeliveryDate(e.target.value);
                  if (!manufactureDate || manufactureDate === deliveryDate) {
                    setManufactureDate(e.target.value);
                  }
                }}
                min={todayStr}
                className="field-input"
                required
              />
            </div>

            {/* Time */}
            <div className="form-field-group">
              <label className="field-label">Time</label>
              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="field-input"
              />
            </div>

            {/* Delivery Address */}
            <div className="form-field-group">
              <label className="field-label">Delivery Address</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter address for delivery (leave blank for showroom pickup)"
                className="field-input"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            CARD 4: FILL PAYMENT INFORMATION
            ======================================================== */}
        <div className="category-form-card">
          <div className="category-form-header">
            <h3 className="category-form-title">FILL PAYMENT INFORMATION</h3>
            <p className="category-form-subtitle">Record advance deposits, discounts, and calculate live balances</p>
          </div>

          {/* Row 1: Payment Type*, Discount (%), Manufacture Date, Advance, Service Charge(%), Delivery Charge */}
          <div className="order-payment-grid">
            {/* Payment Type* */}
            <div className="form-field-group">
              <label className="field-label">
                Payment Type<span className="required-star">*</span>
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="field-select"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Online Transfer">Online Transfer</option>
                <option value="Credit">Credit</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {/* Discount (%) */}
            <div className="form-field-group">
              <label className="field-label">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="0"
                className="field-input"
              />
            </div>

            {/* Manufacture Date */}
            <div className="form-field-group">
              <label className="field-label">Manufacture Date</label>
              <input
                type="date"
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
                className="field-input"
              />
            </div>

            {/* Advance */}
            <div className="form-field-group">
              <label className="field-label">Advance (Deposit)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                placeholder="0.00"
                className="field-input"
              />
            </div>

            {/* Service Charge(%) */}
            <div className="form-field-group">
              <label className="field-label">Service Charge(%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={serviceChargePercent}
                onChange={(e) => setServiceChargePercent(e.target.value)}
                placeholder="0"
                className="field-input"
              />
            </div>

            {/* Delivery Charge */}
            <div className="form-field-group">
              <label className="field-label">Delivery Charge</label>
              <input
                type="number"
                min="0"
                step="any"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                placeholder="0.00"
                className="field-input"
              />
            </div>
          </div>

          {/* Financial Summary Strip */}
          <div className="order-financial-strip">
            <div className="financial-metric">
              <span className="financial-metric-label">Sub Total</span>
              <span className="financial-metric-value">
                Rs. {subTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="financial-metric">
                <span className="financial-metric-label">Discount ({discountPctNum}%)</span>
                <span className="financial-metric-value" style={{ color: '#10b981' }}>
                  - Rs. {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {serviceChargeAmount > 0 && (
              <div className="financial-metric">
                <span className="financial-metric-label">Service Charge ({serviceChargePctNum}%)</span>
                <span className="financial-metric-value">
                  + Rs. {serviceChargeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {deliveryChargeNum > 0 && (
              <div className="financial-metric">
                <span className="financial-metric-label">Delivery Fee</span>
                <span className="financial-metric-value">
                  + Rs. {deliveryChargeNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="financial-metric">
              <span className="financial-metric-label">Net Total</span>
              <span className="financial-metric-value highlight-total">
                Rs. {netTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="financial-metric">
              <span className="financial-metric-label">Advance Paid</span>
              <span className="financial-metric-value highlight-paid">
                Rs. {advanceAmountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="financial-metric">
              <span className="financial-metric-label">Balance Due</span>
              <span className="financial-metric-value highlight-balance">
                Rs. {balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Row 2: Action Buttons (Submit & Reset) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ minWidth: '140px', padding: '10px 24px' }}
            >
              {saving ? 'Creating Order...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-teal"
              style={{ minWidth: '140px', padding: '10px 24px' }}
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </form>

      {/* ========================================================
          ORDER SUCCESS MODAL / RECEIPT CONFIRMATION
          ======================================================== */}
      {orderSuccessModal && (
        <div className="order-modal-backdrop">
          <div className="order-modal-box">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                Order Placed Successfully!
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Order #{orderSuccessModal.order_number} has been queued into kitchen production
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Order Number:</span>
                <span style={{ fontWeight: '700', color: '#258be0' }}>{orderSuccessModal.order_number}</span>
              </div>
              {orderSuccessModal.receipt_no && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Advance Receipt No:</span>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>{orderSuccessModal.receipt_no}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Customer:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{orderSuccessModal.customer_name} ({orderSuccessModal.customer_mobile})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Delivery Schedule:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{orderSuccessModal.delivery_date} at {orderSuccessModal.delivery_time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Items Count:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{orderSuccessModal.items_count} items</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Total Amount:</span>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>
                  Rs. {orderSuccessModal.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Advance Paid:</span>
                <span style={{ fontWeight: '800', color: '#10b981' }}>
                  Rs. {orderSuccessModal.advance_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <span style={{ color: '#64748b', fontWeight: '700' }}>Balance Due:</span>
                <span style={{ fontWeight: '800', color: orderSuccessModal.balance_amount > 0 ? '#f43f5e' : '#10b981' }}>
                  Rs. {orderSuccessModal.balance_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary"
                style={{ padding: '10px 18px' }}
              >
                <Printer size={16} />
                <span>Print Bill</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderSuccessModal(null)}
                className="btn btn-primary"
                style={{ padding: '10px 18px' }}
              >
                <Plus size={16} />
                <span>Create Another Order</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/manage_orders')}
                className="btn btn-cancel"
                style={{ padding: '10px 18px' }}
              >
                <FileText size={16} />
                <span>Manage Orders</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

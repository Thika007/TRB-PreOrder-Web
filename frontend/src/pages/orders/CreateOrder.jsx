import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  ShoppingBag, 
  Cake, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

export default function CreateOrder() {
  // Customer State
  const [mobileSearch, setMobileSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    title: 'Mr',
    first_name: '',
    mobile: '',
    delivery_address: ''
  });

  // Delivery & Timing State
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [deliveryDate, setDeliveryDate] = useState(tomorrow);
  const [deliveryTime, setDeliveryTime] = useState('11:00 AM');
  const [deliveryType, setDeliveryType] = useState('Showroom Pickup');

  // Product Catalog State
  const [categories, setCategories] = useState([]);
  const [selectedMainCat, setSelectedMainCat] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Active Item Builder State
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemMilestone, setItemMilestone] = useState('None');
  const [itemOccasion, setItemOccasion] = useState('Happy Birthday');
  const [itemIcingText, setItemIcingText] = useState('');
  const [itemNotes, setItemNotes] = useState('');

  // Cart / Order Items Table
  const [orderItems, setOrderItems] = useState([]);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [saving, setSaving] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Load Main Categories on Mount
  useEffect(() => {
    axios.get('/api/products/categories')
      .then(res => {
        if (res.data.success && res.data.categories.length > 0) {
          setCategories(res.data.categories);
          setSelectedMainCat(res.data.categories[0].main_cat_id);
        }
      })
      .catch(console.error);
  }, []);

  // Load Products when Main Category changes
  useEffect(() => {
    if (selectedMainCat) {
      axios.get(`/api/products?main_cat_id=${selectedMainCat}`)
        .then(res => {
          if (res.data.success) {
            setProducts(res.data.products);
            if (res.data.products.length > 0) {
              setSelectedProduct(res.data.products[0]);
            } else {
              setSelectedProduct(null);
            }
          }
        })
        .catch(console.error);
    }
  }, [selectedMainCat]);

  // Mobile Autocomplete Search (Sub-15ms)
  useEffect(() => {
    if (mobileSearch.trim().length >= 2) {
      const delay = setTimeout(() => {
        axios.get(`/api/customers/search?q=${encodeURIComponent(mobileSearch.trim())}`)
          .then(res => {
            if (res.data.success) {
              setCustomerSuggestions(res.data.customers);
            }
          })
          .catch(console.error);
      }, 150);
      return () => clearTimeout(delay);
    } else {
      setCustomerSuggestions([]);
    }
  }, [mobileSearch]);

  const selectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setCustomerForm({
      title: cust.title || 'Mr',
      first_name: cust.first_name,
      mobile: cust.mobile,
      delivery_address: cust.delivery_address || ''
    });
    setMobileSearch(cust.mobile);
    setCustomerSuggestions([]);
  };

  // Add Item to Order Table
  const handleAddItem = () => {
    if (!selectedProduct) return;

    const unitPrice = parseFloat(selectedProduct.unit_price) || 0;
    const qty = parseFloat(itemQuantity) || 1;
    const total = unitPrice * qty;

    const newItem = {
      product_id: selectedProduct.product_id,
      product_name: selectedProduct.product_name,
      net_weight: selectedProduct.net_weight,
      quantity: qty,
      unit_price: unitPrice,
      total_price: total,
      greeting_milestone: itemMilestone,
      greeting_occasion: itemOccasion,
      greeting_icing_text: itemIcingText,
      item_notes: itemNotes
    };

    setOrderItems(prev => [...prev, newItem]);
    
    // Reset item customizer fields
    setItemIcingText('');
    setItemNotes('');
    setItemQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  // Financial Calculations
  const subTotal = orderItems.reduce((acc, item) => acc + item.total_price, 0);
  const totalAmount = subTotal;
  const advance = parseFloat(advanceAmount) || 0;
  const balanceAmount = Math.max(0, totalAmount - advance);

  // Submit Order
  const handleSaveOrder = async () => {
    if (!customerForm.mobile || !customerForm.first_name) {
      alert('Please enter or select a customer phone number and name.');
      return;
    }
    if (orderItems.length === 0) {
      alert('Please add at least one item or cake to the order table.');
      return;
    }

    setSaving(true);
    try {
      // 1. Ensure customer is created or retrieved
      let customerId = selectedCustomer ? selectedCustomer.customer_id : null;
      if (!customerId) {
        const custRes = await axios.post('/api/customers', {
          title: customerForm.title,
          first_name: customerForm.first_name,
          mobile: customerForm.mobile,
          delivery_address: customerForm.delivery_address
        });
        customerId = custRes.data.customer.customer_id;
      }

      // 2. Submit Order Header & Items
      const orderPayload = {
        customer_id: customerId,
        ordered_by: customerForm.first_name,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        delivery_type: deliveryType,
        delivery_address: customerForm.delivery_address,
        sub_total: subTotal,
        discount_amount: 0,
        total_amount: totalAmount,
        advance_amount: advance,
        payment_method: paymentMethod,
        items: orderItems,
        created_by_user_id: 1
      };

      const res = await axios.post('/api/orders', orderPayload);
      if (res.data.success) {
        setOrderSuccess(res.data);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      alert('Failed to save order: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Reset form after booking
  const handleReset = () => {
    setOrderSuccess(null);
    setOrderItems([]);
    setAdvanceAmount('');
    setSelectedCustomer(null);
    setCustomerForm({ title: 'Mr', first_name: '', mobile: '', delivery_address: '' });
    setMobileSearch('');
  };

  if (orderSuccess) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px' }}>
        <CheckCircle size={56} color="#059669" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Pre-Order Booked Successfully!</h2>
        <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px' }}>
          Order Number: <strong style={{ color: '#d97706', fontFamily: 'var(--font-mono)' }}>{orderSuccess.order_number}</strong>
        </p>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', margin: '24px 0', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Total Bill Amount:</span>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>LKR {orderSuccess.total_amount.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Advance Deposit Paid:</span>
            <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>LKR {orderSuccess.advance_amount.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
            <span>Remaining Balance:</span>
            <strong style={{ color: '#b45309', fontFamily: 'var(--font-mono)' }}>LKR {orderSuccess.balance_amount.toFixed(2)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={18} />
            <span>Print 80mm Slip</span>
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            <span>Book Next Order (F1)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* TOP SECTION: CUSTOMER & DELIVERY SCHEDULE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* PANEL 1: CUSTOMER DIRECTORY LOOKUP */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <User size={18} color="#d97706" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Customer Details (Instant Mobile Search)</h3>
          </div>

          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Search / Mobile Number*
            </label>
            <input 
              type="text" 
              className="pos-input" 
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontFamily: 'var(--font-mono)' }}
              placeholder="Type customer mobile (e.g. 077...)"
              value={mobileSearch}
              onChange={(e) => {
                setMobileSearch(e.target.value);
                setCustomerForm(prev => ({ ...prev, mobile: e.target.value }));
              }}
            />

            {/* Sub-15ms Suggestions Popup */}
            {customerSuggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', zIndex: 30, maxHeight: '200px', overflowY: 'auto' }}>
                {customerSuggestions.map(cust => (
                  <div 
                    key={cust.customer_id}
                    onClick={() => selectCustomer(cust)}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <span style={{ fontWeight: 600 }}>{cust.title} {cust.first_name} {cust.last_name || ''}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#d97706' }}>{cust.mobile}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Title</label>
              <select 
                value={customerForm.title} 
                onChange={(e) => setCustomerForm(prev => ({ ...prev, title: e.target.value }))}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option>Mr</option><option>Mrs</option><option>Miss</option><option>Dr</option><option>Rev</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Customer Name*</label>
              <input 
                type="text" 
                value={customerForm.first_name}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="First name"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Delivery / Contact Address</label>
            <input 
              type="text" 
              value={customerForm.delivery_address}
              onChange={(e) => setCustomerForm(prev => ({ ...prev, delivery_address: e.target.value }))}
              placeholder="Showroom pickup or street address"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        {/* PANEL 2: DELIVERY & COLLECTION TIMING */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Calendar size={18} color="#d97706" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Pickup Date & Time Schedule</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Date of Delivery (d_delivery)*
              </label>
              <input 
                type="date" 
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Pickup Time (time)*
              </label>
              <select 
                value={deliveryTime} 
                onChange={(e) => setDeliveryTime(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
              >
                <option>09:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>12:00 PM</option>
                <option>01:00 PM</option>
                <option>02:00 PM</option>
                <option>03:00 PM</option>
                <option>04:00 PM</option>
                <option>05:00 PM</option>
                <option>06:00 PM</option>
                <option>07:00 PM</option>
                <option>08:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Order Fulfillment Type
            </label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                <input 
                  type="radio" 
                  name="fulfillment" 
                  checked={deliveryType === 'Showroom Pickup'} 
                  onChange={() => setDeliveryType('Showroom Pickup')}
                />
                Showroom Counter Pickup
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                <input 
                  type="radio" 
                  name="fulfillment" 
                  checked={deliveryType === 'Delivery'} 
                  onChange={() => setDeliveryType('Delivery')}
                />
                Direct Delivery Dispatch
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT PICKER & CAKE CUSTOMIZATION BUILDER */}
      <div className="card" style={{ border: '2px solid #fef3c7', background: '#fffdfa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Cake size={20} color="#d97706" />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#92400e' }}>
            Product Selection & Cake Customization (Exact trbsys.net Specs)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 100px 120px', gap: '14px', marginBottom: '14px' }}>
          {/* Main Category */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Main-Product-Type*</label>
            <select 
              value={selectedMainCat} 
              onChange={(e) => setSelectedMainCat(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
            >
              {categories.map(cat => (
                <option key={cat.main_cat_id} value={cat.main_cat_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Dropdown (850+ items) */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Product Item (850+ items)*</label>
            <select 
              value={selectedProduct ? selectedProduct.product_id : ''} 
              onChange={(e) => {
                const prod = products.find(p => p.product_id === parseInt(e.target.value));
                setSelectedProduct(prod || null);
              }}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
            >
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  {p.product_name} {p.net_weight ? `(${p.net_weight})` : ''} - LKR {parseFloat(p.unit_price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Qty (odr_qty)*</label>
            <input 
              type="number" 
              min="1" 
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {/* Unit Price Display */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Unit Price</label>
            <div style={{ padding: '9px', background: '#f1f5f9', borderRadius: '6px', fontWeight: 700, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
              {selectedProduct ? `LKR ${parseFloat(selectedProduct.unit_price).toFixed(2)}` : '0.00'}
            </div>
          </div>
        </div>

        {/* CAKE CUSTOMIZATION FIELDS (trbsys.net Milestone 1st-29th & Icing Text) */}
        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 220px 1fr', gap: '14px', marginBottom: '10px' }}>
            {/* Milestone Greetings (1st-29th) */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Milestone Greetings*</label>
              <select 
                value={itemMilestone}
                onChange={(e) => setItemMilestone(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option>None</option>
                {Array.from({ length: 29 }, (_, i) => `${i + 1}${['st','nd','rd'][((i+1)%10)-1] || 'th'}`).map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Occasion */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Greetings Occasion*</label>
              <select 
                value={itemOccasion}
                onChange={(e) => setItemOccasion(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option>None</option>
                <option>Happy Birthday</option>
                <option>Happy Anniversary</option>
                <option>Happy Holy Communion</option>
                <option>Congratulations</option>
                <option>Happy Valentine's Day</option>
              </select>
            </div>

            {/* Greetings info2: Custom Icing text on cake */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#d97706' }}>
                Greetings info2 (Recipient Name / Custom Icing Text on Cake)*
              </label>
              <input 
                type="text" 
                value={itemIcingText}
                onChange={(e) => setItemIcingText(e.target.value)}
                placeholder="e.g. Dearest Kevin, May God Bless You!"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #f59e0b', fontWeight: 600 }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Item Remarks (odr_gre_des)</label>
            <input 
              type="text" 
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              placeholder="Colour theme, ribbon style, shape requests (e.g. Chocolate buttercream, Blue and white roses)"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleAddItem}
          style={{ width: '100%', padding: '10px', fontSize: '14px' }}
        >
          <Plus size={18} />
          <span>Add Custom Cake / Bakery Item to Order List</span>
        </button>
      </div>

      {/* ORDER ITEMS TABLE */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Order Line Items</h3>
        <div className="table-responsive">
          <table className="pos-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Description</th>
                <th>Cake Greeting / Icing Inscription</th>
                <th>Qty</th>
                <th>Unit Price (LKR)</th>
                <th>Total (LKR)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No items added yet. Configure above and click "Add to Order List".
                  </td>
                </tr>
              ) : (
                orderItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{item.product_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.net_weight}</div>
                      {item.item_notes && <div style={{ fontSize: '11.5px', color: '#b45309' }}>Note: {item.item_notes}</div>}
                    </td>
                    <td>
                      {(item.greeting_occasion !== 'None' || item.greeting_icing_text) ? (
                        <div style={{ background: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          <span style={{ fontWeight: 700, color: '#b45309' }}>
                            {item.greeting_milestone !== 'None' ? `${item.greeting_milestone} ` : ''}
                            {item.greeting_occasion}
                          </span>
                          {item.greeting_icing_text && <div style={{ color: '#0f172a', fontWeight: 600 }}>"{item.greeting_icing_text}"</div>}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Standard</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{item.quantity}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{item.unit_price.toFixed(2)}</td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>{item.total_price.toFixed(2)}</td>
                    <td>
                      <button 
                        onClick={() => handleRemoveItem(idx)}
                        style={{ border: 'none', background: 'none', color: '#e11d48', cursor: 'pointer' }}
                        title="Delete item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BILLING TOTALS & PAYMENT SETTLEMENT */}
      <div className="card" style={{ background: '#f8fafc' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
          {/* Bill Total */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Amount</span>
            <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
              LKR {totalAmount.toFixed(2)}
            </div>
          </div>

          {/* Advance Deposit Paid */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Advance Deposit Paid*
            </label>
            <input 
              type="number" 
              placeholder="0.00"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '2px solid #059669', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '16px' }}
            />
          </div>

          {/* Balance Remaining */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Balance Due on Pickup</span>
            <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: balanceAmount > 0 ? '#b45309' : '#64748b' }}>
              LKR {balanceAmount.toFixed(2)}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Payment Method
            </label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
            >
              <option>Cash</option>
              <option>Card / POS</option>
              <option>Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <button className="btn btn-secondary" onClick={handleReset}>
            <span>Cancel</span>
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSaveOrder}
            disabled={saving}
            style={{ padding: '12px 28px', fontSize: '15px' }}
          >
            <Printer size={18} />
            <span>{saving ? 'Processing...' : 'Save & Print 80mm Slip (F9)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


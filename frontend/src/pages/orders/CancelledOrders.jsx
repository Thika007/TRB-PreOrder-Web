import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  AlertCircle, 
  X, 
  Printer, 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Tag, 
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import axios from 'axios';

export default function CancelledOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reasonFilter, setReasonFilter] = useState('Show all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting state (default by date desc)
  const [sortField, setSortField] = useState('cancelled_date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Details Modal
  const [viewingOrder, setViewingOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Print Preview Modal
  const [printModalData, setPrintModalData] = useState(null);

  // Fetch cancelled orders
  const fetchCancelledOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/orders/cancelled?limit=500`;
      if (reasonFilter !== 'Show all') {
        url += `&reason=${encodeURIComponent(reasonFilter)}`;
      }
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }

      const res = await axios.get(url);
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch cancelled orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelledOrders();
  }, [reasonFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCancelledOrders();
  };

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ChevronsUpDown size={13} style={{ color: '#94a3b8', marginLeft: '4px', display: 'inline-block' }} />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp size={13} style={{ color: '#0284c7', marginLeft: '4px', display: 'inline-block' }} />
      : <ChevronDown size={13} style={{ color: '#0284c7', marginLeft: '4px', display: 'inline-block' }} />;
  };

  // Filtered & Sorted orders list
  const processedOrders = useMemo(() => {
    let result = [...orders];

    // Client-side search if user types without pressing enter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(o => 
        (o.invoice_id && o.invoice_id.toLowerCase().includes(q)) ||
        (o.order_number && o.order_number.toLowerCase().includes(q)) ||
        (o.reason && o.reason.toLowerCase().includes(q)) ||
        (o.cancelled_by && o.cancelled_by.toLowerCase().includes(q)) ||
        (o.cancelled_date && o.cancelled_date.includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_mobile && o.customer_mobile.includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, searchTerm, sortField, sortDirection]);

  // Extract unique reasons for dropdown filter
  const reasonOptions = useMemo(() => {
    const set = new Set();
    orders.forEach(o => {
      if (o.reason) set.add(o.reason);
    });
    // Ensure default trbsys standard reasons are present
    set.add('CXL');
    set.add('C');
    return Array.from(set);
  }, [orders]);

  // View Order Details
  const handleViewOrder = async (order) => {
    setViewingOrder(order);
    setLoadingDetails(true);
    setOrderDetails(null);
    try {
      const res = await axios.get(`/api/orders/${order.order_id}`);
      if (res.data.success) {
        setOrderDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Print Handler
  const handleOpenPrint = (mode = 'receipt') => {
    if (!orderDetails) return;
    setPrintModalData({
      order: orderDetails.order,
      items: orderDetails.items || [],
      payments: orderDetails.payments || [],
      mode: mode
    });
  };

  return (
    <div className="manage-orders-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '100%' }}>
      
      {/* ========================================================
          PAGE HEADER & BREADCRUMBS (Exact trbsys.net format)
          ======================================================== */}
      <div className="page-header-row" style={{ marginBottom: '4px' }}>
        <div>
          <h1 className="page-main-heading" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Cancelled Orders
          </h1>
          <div className="breadcrumb-nav" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
            <Link to="/dashboard" className="breadcrumb-link" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 500 }}>
              The Royal Bakery
            </Link>
            <span className="breadcrumb-separator" style={{ color: '#94a3b8' }}>/</span>
            <span className="breadcrumb-current" style={{ color: '#64748b', fontWeight: 500 }}>Cancelled Orders</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          TOP CONTROLS BAR (Matches trbsys.net reference exactly)
          ======================================================== */}
      <div className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Left: Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Status</label>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              <option value="Show all">Show all</option>
              {reasonOptions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Right: Search Box */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <form onSubmit={handleSearchSubmit}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '6px 12px 6px 30px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    width: '200px',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* ========================================================
          CANCELLED ORDERS TABLE (Exact 4 Columns matching trbsys)
          ======================================================== */}
      <div className="card" style={{ padding: '0', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div className="table-responsive">
          <table className="trb-orders-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #e2e8f0' }}>
                <th 
                  onClick={() => handleSort('invoice_id')} 
                  style={{ padding: '14px 20px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap', width: '25%' }}
                >
                  Invoice Id {getSortIcon('invoice_id')}
                </th>
                <th 
                  onClick={() => handleSort('reason')} 
                  style={{ padding: '14px 20px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap', width: '25%' }}
                >
                  Reason {getSortIcon('reason')}
                </th>
                <th 
                  onClick={() => handleSort('cancelled_by')} 
                  style={{ padding: '14px 20px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap', width: '25%' }}
                >
                  Cancelled By {getSortIcon('cancelled_by')}
                </th>
                <th 
                  onClick={() => handleSort('cancelled_date')} 
                  style={{ padding: '14px 20px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap', width: '25%' }}
                >
                  Date {getSortIcon('cancelled_date')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading cancelled orders...
                  </td>
                </tr>
              ) : processedOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '44px 20px', color: '#64748b' }}>
                    <AlertCircle size={28} style={{ margin: '0 auto 8px auto', display: 'block', color: '#cbd5e1' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>No cancelled orders found.</span>
                  </td>
                </tr>
              ) : (
                processedOrders.map((order, idx) => (
                  <tr 
                    key={order.order_id || idx}
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 1 ? '#f8fafc' : '#ffffff'}
                  >
                    {/* 1. Invoice Id (Clickable blue link matching trbsys.net) */}
                    <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                      <span
                        onClick={() => handleViewOrder(order)}
                        title="Click to view full order details"
                        style={{
                          color: '#258be0',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {order.invoice_id || order.order_number}
                      </span>
                    </td>

                    {/* 2. Reason */}
                    <td style={{ padding: '14px 20px', color: '#334155', fontWeight: 500, verticalAlign: 'middle' }}>
                      {order.reason || 'CXL'}
                    </td>

                    {/* 3. Cancelled By */}
                    <td style={{ padding: '14px 20px', color: '#334155', fontWeight: 500, verticalAlign: 'middle' }}>
                      {order.cancelled_by || 'Admin'}
                    </td>

                    {/* 4. Date */}
                    <td style={{ padding: '14px 20px', color: '#475569', fontWeight: 500, verticalAlign: 'middle' }}>
                      {order.cancelled_date || (order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : '-')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        {processedOrders.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', backgroundColor: '#ffffff' }}>
            <span>Showing <strong>{processedOrders.length}</strong> cancelled {processedOrders.length === 1 ? 'order' : 'orders'}</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Click any Invoice ID to inspect original booking details</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          ORDER DETAILS POPUP MODAL (When clicking an Invoice ID link)
          ========================================================================= */}
      {viewingOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card" style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            width: '680px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={22} style={{ color: '#ef4444' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Cancelled Order #{viewingOrder.invoice_id || viewingOrder.order_number}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
                    Status: Cancelled • Reason: {viewingOrder.reason || 'CXL'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setViewingOrder(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {loadingDetails ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading order details...
                </div>
              ) : orderDetails ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Cancellation Audit Banner */}
                  <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#991b1b', fontWeight: 700, display: 'block' }}>Cancellation Reason</span>
                      <strong style={{ fontSize: '14px', color: '#b91c1c' }}>{viewingOrder.reason || 'CXL'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#991b1b', fontWeight: 700, display: 'block' }}>Cancelled By</span>
                      <strong style={{ fontSize: '14px', color: '#b91c1c' }}>{viewingOrder.cancelled_by || 'Admin'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#991b1b', fontWeight: 700, display: 'block' }}>Cancelled Date</span>
                      <strong style={{ fontSize: '14px', color: '#b91c1c' }}>{viewingOrder.cancelled_date || '-'}</strong>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Customer Information
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13.5px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Name: </span>
                        <strong>{orderDetails.order.customer_name}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Mobile: </span>
                        <strong>{orderDetails.order.customer_mobile || '-'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Scheduled Delivery: </span>
                        <strong>{orderDetails.order.delivery_date ? new Date(orderDetails.order.delivery_date).toISOString().split('T')[0] : '-'} ({orderDetails.order.delivery_time})</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Delivery Address: </span>
                        <span>{orderDetails.order.delivery_address || 'Showroom Pickup'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Items in this Order ({orderDetails.items?.length || 0})
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '8px 10px', textAlign: 'left' }}>Product</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right' }}>Unit Price</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.items?.map((it, idx) => (
                          <tr key={it.order_item_id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 10px' }}>
                              <strong style={{ color: '#0f172a' }}>{it.product_name}</strong>
                              {(it.greeting_occasion || it.greeting_milestone || it.greeting_icing_text) && (
                                <div style={{ fontSize: '11.5px', color: '#0284c7', marginTop: '2px' }}>
                                  🎂 {it.greeting_occasion || ''} {it.greeting_milestone ? `(${it.greeting_milestone})` : ''} {it.greeting_icing_text ? `• "${it.greeting_icing_text}"` : ''}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>{it.quantity}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                              Rs. {Number(it.unit_price).toFixed(2)}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                              Rs. {Number(it.total_price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Summary */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span>Total Amount:</span>
                        <strong style={{ color: '#0f172a' }}>Rs. {Number(orderDetails.order.total_amount).toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                        <span>Advance Paid:</span>
                        <strong>Rs. {Number(orderDetails.order.advance_amount).toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontWeight: 800, color: '#ef4444' }}>
                        <span>Status:</span>
                        <span>CANCELLED</span>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
                  Could not load full details for this order.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenPrint('receipt')}
                  className="btn btn-secondary"
                  style={{ fontSize: '12.5px', padding: '6px 14px' }}
                >
                  <Printer size={14} />
                  <span>Thermal Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenPrint('a5')}
                  className="btn btn-secondary"
                  style={{ fontSize: '12.5px', padding: '6px 14px' }}
                >
                  <FileText size={14} />
                  <span>Print A5</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="btn btn-primary"
                style={{ fontSize: '12.5px', padding: '6px 20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRINT PREVIEW MODAL (Thermal Receipt & A5 Bill)
          ========================================================================= */}
      {printModalData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div className="card" style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            width: printModalData.mode === 'a5' ? '760px' : '420px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={18} style={{ color: '#0284c7' }} />
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                  {printModalData.mode === 'a5' ? 'A5 Bill Preview (Cancelled)' : 'Thermal Receipt Preview (Cancelled)'}
                </strong>
              </div>
              <button onClick={() => setPrintModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Document Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#f1f5f9' }}>
              <div style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontFamily: printModalData.mode === 'receipt' ? 'monospace' : 'inherit',
                fontSize: printModalData.mode === 'receipt' ? '12px' : '13px',
                border: '1px dashed #cbd5e1'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>THE ROYAL BAKERY</h2>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Pre-Order & Cake Customization POS</p>
                  <div style={{ display: 'inline-block', marginTop: '8px', padding: '3px 10px', backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 800, borderRadius: '4px', fontSize: '12px' }}>
                    *** CANCELLED ORDER ***
                  </div>
                </div>

                <div style={{ borderBottom: '1px dashed #94a3b8', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div>Invoice: <strong>#{printModalData.order.order_number}</strong></div>
                  <div>Customer: <strong>{printModalData.order.customer_name}</strong></div>
                  <div>Mobile: {printModalData.order.customer_mobile || '-'}</div>
                  <div>Delivery Date: {printModalData.order.delivery_date ? new Date(printModalData.order.delivery_date).toISOString().split('T')[0] : '-'} {printModalData.order.delivery_time}</div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: '10px' }}>
                  {printModalData.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{it.quantity}x {it.product_name}</span>
                      <strong>Rs. {Number(it.total_price).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed #94a3b8', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>Total Amount:</span>
                  <span>Rs. {Number(printModalData.order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#f8fafc' }}>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '6px 18px', fontSize: '13px' }}>
                <Printer size={14} />
                <span>Print Document</span>
              </button>
              <button onClick={() => setPrintModalData(null)} className="btn btn-secondary" style={{ padding: '6px 18px', fontSize: '13px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

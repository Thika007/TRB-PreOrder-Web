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
  CheckCircle2, 
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  FileCheck2
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function BillAuthorized() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Show all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('order_id');
  const [sortDirection, setSortDirection] = useState('desc');

  // Authorize Confirmation Modal
  const [authorizingOrder, setAuthorizingOrder] = useState(null);
  const [authorizing, setAuthorizing] = useState(false);

  // Print-A5 Modal Data
  const [printModalData, setPrintModalData] = useState(null);
  const [loadingPrint, setLoadingPrint] = useState(false);

  // Fetch orders for Authorize Bills
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/orders/authorize-list?limit=500`;
      if (statusFilter !== 'Show all') {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }

      const res = await axios.get(url);
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch authorize orders list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // Sorting Handler
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

  // Client-side search and sort
  const processedOrders = useMemo(() => {
    let result = [...orders];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(o => 
        (o.invoice_id && o.invoice_id.toLowerCase().includes(q)) ||
        (o.order_number && o.order_number.toLowerCase().includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_mobile && o.customer_mobile.includes(q)) ||
        (o.items_breakdown && o.items_breakdown.toLowerCase().includes(q)) ||
        (o.delivery_date && o.delivery_date.includes(q))
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'total_amount' || sortField === 'balance_amount') {
        valA = parseFloat(valA || 0);
        valB = parseFloat(valB || 0);
      } else {
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, searchTerm, sortField, sortDirection]);

  // Handle Authorize confirmation
  const handleOpenAuthorize = (order) => {
    setAuthorizingOrder(order);
  };

  const confirmAuthorizeOrder = async () => {
    if (!authorizingOrder) return;
    setAuthorizing(true);
    try {
      const res = await axios.put(`/api/orders/${authorizingOrder.order_id}/authorize`, {
        user_id: user?.user_id || 1
      });
      if (res.data.success) {
        showSuccess(`Bill #${authorizingOrder.invoice_id || authorizingOrder.order_number} authorized successfully!`, 'Bill Authorized');
        setAuthorizingOrder(null);
        fetchOrders();
      }
    } catch (err) {
      showError('Authorization failed: ' + (err.response?.data?.error || err.message), 'Authorization Failed');
    } finally {
      setAuthorizing(false);
    }
  };

  // Open Print-A5
  const handleOpenPrintA5 = async (order) => {
    setLoadingPrint(true);
    try {
      const res = await axios.get(`/api/orders/${order.order_id}`);
      if (res.data.success) {
        setPrintModalData({
          order: res.data.order,
          items: res.data.items || [],
          payments: res.data.payments || []
        });
      }
    } catch (err) {
      showError('Failed to load A5 invoice data: ' + err.message, 'Print Error');
    } finally {
      setLoadingPrint(false);
    }
  };

  return (
    <div className="manage-orders-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '100%' }}>
      
      {/* ========================================================
          PAGE HEADER & BREADCRUMBS (Matches trbsys.net standard)
          ======================================================== */}
      <div className="page-header-row" style={{ marginBottom: '4px' }}>
        <div>
          <h1 className="page-main-heading" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Authorize Bills
          </h1>
          <div className="breadcrumb-nav" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
            <Link to="/dashboard" className="breadcrumb-link" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 500 }}>
              The Royal Bakery
            </Link>
            <span className="breadcrumb-separator" style={{ color: '#94a3b8' }}>/</span>
            <span className="breadcrumb-current" style={{ color: '#64748b', fontWeight: 500 }}>Authorize Bills</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          TOP CONTROLS (Status Filter & Search Box)
          ======================================================== */}
      <div className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                minWidth: '130px'
              }}
            >
              <option value="Show all">Show all</option>
              <option value="Pending">Pending</option>
              <option value="Authorized">Authorized</option>
              <option value="Baking">Baking</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Search Box */}
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
                    width: '220px',
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
          AUTHORIZE BILLS TABLE (Exact 8 Columns matching trbsys)
          ======================================================== */}
      <div className="card" style={{ padding: '0', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div className="table-responsive">
          <table className="trb-orders-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #e2e8f0' }}>
                <th onClick={() => handleSort('invoice_id')} style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Invoice ID {getSortIcon('invoice_id')}
                </th>
                <th onClick={() => handleSort('items_breakdown')} style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}>
                  Name {getSortIcon('items_breakdown')}
                </th>
                <th onClick={() => handleSort('delivery_date')} style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Date of Delivery {getSortIcon('delivery_date')}
                </th>
                <th onClick={() => handleSort('total_amount')} style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Total {getSortIcon('total_amount')}
                </th>
                <th onClick={() => handleSort('order_status')} style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Status {getSortIcon('order_status')}
                </th>
                <th onClick={() => handleSort('balance_amount')} style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Balance {getSortIcon('balance_amount')}
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  Print
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading bills for authorization...
                  </td>
                </tr>
              ) : processedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '44px 20px', color: '#64748b' }}>
                    <AlertCircle size={28} style={{ margin: '0 auto 8px auto', display: 'block', color: '#cbd5e1' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>No pre-orders found in authorization queue.</span>
                  </td>
                </tr>
              ) : (
                processedOrders.map((order, idx) => {
                  const isPaid = parseFloat(order.balance_amount || 0) <= 0;
                  const balanceDue = parseFloat(order.balance_amount || 0);
                  const isAuth = order.order_status === 'Authorized' || order.is_authorized === 1;

                  // Parse items breakdown
                  const itemLines = order.items_breakdown 
                    ? order.items_breakdown.split('\n').filter(Boolean)
                    : [];

                  return (
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
                      {/* 1. Invoice ID */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {order.invoice_id || order.order_number}
                      </td>

                      {/* 2. Name (Multi-line product breakdown matching trbsys) */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', color: '#334155' }}>
                        {itemLines.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {itemLines.map((line, lIdx) => (
                              <div key={lIdx} style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>
                                {line}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>

                      {/* 3. Date of Delivery */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', color: '#475569', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {order.delivery_date || '-'}
                      </td>

                      {/* 4. Total */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {Number(order.total_amount || 0).toFixed(2)}
                      </td>

                      {/* 5. Status Badge */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        {order.order_status === 'Authorized' ? (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '4px'
                          }}>
                            Authorized
                          </span>
                        ) : order.order_status === 'Cancelled' ? (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#f59e0b',
                            color: '#ffffff',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '4px'
                          }}>
                            Cancelled
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#22d3ee',
                            color: '#ffffff',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '4px'
                          }}>
                            {order.order_status || 'Pending'}
                          </span>
                        )}
                      </td>

                      {/* 6. Balance Badge */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        {isPaid ? (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '4px'
                          }}>
                            Paid
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#f59e0b',
                            color: '#ffffff',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '4px'
                          }}>
                            {Math.round(balanceDue)} Due
                          </span>
                        )}
                      </td>

                      {/* 7. Print (Print-A5 link matching trbsys) */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <span
                          onClick={() => handleOpenPrintA5(order)}
                          title="Print A5 Bill"
                          style={{
                            color: '#258be0',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          Print-A5
                        </span>
                      </td>

                      {/* 8. Action (Bill Authorize link matching trbsys) */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        {isAuth ? (
                          <span style={{
                            color: '#10b981',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12.5px'
                          }}>
                            <CheckCircle2 size={14} />
                            Authorized
                          </span>
                        ) : order.order_status === 'Cancelled' ? (
                          <span style={{ color: '#94a3b8', fontSize: '12.5px', fontStyle: 'italic' }}>
                            Cancelled
                          </span>
                        ) : (
                          <span
                            onClick={() => handleOpenAuthorize(order)}
                            title="Click to Authorize this Bill"
                            style={{
                              color: '#258be0',
                              fontWeight: 500,
                              cursor: 'pointer',
                              textDecoration: 'none'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            Bill Authorize
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        {processedOrders.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', backgroundColor: '#ffffff' }}>
            <span>Showing <strong>{processedOrders.length}</strong> pre-orders in billing queue</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Click "Bill Authorize" to officially validate and approve for kitchen production</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          AUTHORIZE BILL CONFIRMATION MODAL
          ========================================================================= */}
      {authorizingOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card" style={{
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            width: '460px',
            maxWidth: '92vw',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <button
              type="button"
              onClick={() => setAuthorizingOrder(null)}
              title="Close"
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <X size={16} />
            </button>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <FileCheck2 size={28} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Authorize Bill #{authorizingOrder.invoice_id || authorizingOrder.order_number}?
            </h3>

            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Confirm official authorization for this pre-order. This will validate billing and mark the items as approved for kitchen baking.
            </p>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '20px', textAlign: 'left', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Customer:</span>
                <strong>{authorizingOrder.customer_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Delivery Date:</span>
                <strong>{authorizingOrder.delivery_date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: 700, borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
                <span>Total Amount:</span>
                <span>Rs. {Number(authorizingOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAuthorizingOrder(null)}
                style={{ flex: 1, padding: '9px 16px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAuthorizeOrder}
                disabled={authorizing}
                className="btn btn-primary"
                style={{ flex: 1.5, padding: '9px 16px', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
              >
                {authorizing ? 'Authorizing...' : 'Confirm Authorize'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRINT-A5 INVOICE DOCUMENT MODAL
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
            width: '780px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={18} style={{ color: '#0284c7' }} />
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                  A5 Bill Document Preview (Order #{printModalData.order.order_number})
                </strong>
              </div>
              <button onClick={() => setPrintModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* A5 Printable Document Canvas */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#f1f5f9' }}>
              <div style={{
                backgroundColor: '#ffffff',
                padding: '28px',
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                color: '#1e293b'
              }}>
                {/* Header Brand */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '0.03em' }}>
                      THE ROYAL BAKERY
                    </h2>
                    <p style={{ margin: '0 0 2px 0', fontSize: '11.5px', color: '#64748b' }}>
                      No. 508, Galle Road, Colombo 06, Sri Lanka
                    </p>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                      Tel: 011-2588484 / 011-2582121 • Email: info@theroyalbakery.lk
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: printModalData.order.order_status === 'Authorized' ? '#dcfce7' : '#e0f2fe',
                      color: printModalData.order.order_status === 'Authorized' ? '#15803d' : '#0369a1',
                      fontWeight: 800,
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: '1px solid currentColor',
                      marginBottom: '6px'
                    }}>
                      {printModalData.order.order_status === 'Authorized' ? 'AUTHORIZED BILL' : 'PRE-ORDER INVOICE'}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      #{printModalData.order.order_number}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Date: {printModalData.order.order_date ? new Date(printModalData.order.order_date).toISOString().split('T')[0] : '-'}
                    </div>
                  </div>
                </div>

                {/* Customer & Delivery Logistics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Customer Details</span>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{printModalData.order.customer_name}</strong>
                    <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>Mobile: {printModalData.order.customer_mobile || '-'}</div>
                    {printModalData.order.customer_email && <div style={{ fontSize: '12px', color: '#64748b' }}>Email: {printModalData.order.customer_email}</div>}
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Delivery & Schedule</span>
                    <div style={{ fontSize: '13px', color: '#0f172a' }}>
                      Date: <strong>{printModalData.order.delivery_date ? new Date(printModalData.order.delivery_date).toISOString().split('T')[0] : '-'}</strong> at <strong>{printModalData.order.delivery_time}</strong>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>
                      Address: {printModalData.order.delivery_address || 'Showroom Pickup'}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #0f172a', borderTop: '2px solid #0f172a', backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>#</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Item Description</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>Unit Price</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>Amount (Rs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printModalData.items.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 10px', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <strong style={{ color: '#0f172a' }}>{it.product_name}</strong>
                          {(it.greeting_occasion || it.greeting_milestone || it.greeting_icing_text) && (
                            <div style={{ fontSize: '11.5px', color: '#0284c7', marginTop: '2px' }}>
                              🎂 {it.greeting_occasion || ''} {it.greeting_milestone ? `(${it.greeting_milestone})` : ''} {it.greeting_icing_text ? `• "${it.greeting_icing_text}"` : ''}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>{it.quantity}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{Number(it.unit_price).toFixed(2)}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{Number(it.total_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                  <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Sub Total:</span>
                      <strong>Rs. {Number(printModalData.order.sub_total || printModalData.order.total_amount).toFixed(2)}</strong>
                    </div>
                    {parseFloat(printModalData.order.discount_amount || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                        <span>Discount:</span>
                        <strong>- Rs. {Number(printModalData.order.discount_amount).toFixed(2)}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                      <span>Net Total:</span>
                      <span>Rs. {Number(printModalData.order.total_amount).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                      <span>Advance Deposit:</span>
                      <span>Rs. {Number(printModalData.order.advance_amount).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '6px', fontWeight: 900, fontSize: '14px', color: parseFloat(printModalData.order.balance_amount) > 0 ? '#d97706' : '#15803d' }}>
                      <span>Balance Due:</span>
                      <span>Rs. {Number(printModalData.order.balance_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures & Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px dashed #cbd5e1', fontSize: '12px', color: '#64748b' }}>
                  <div style={{ textAlign: 'center', width: '180px' }}>
                    <div style={{ borderBottom: '1px solid #94a3b8', height: '35px', marginBottom: '4px' }}></div>
                    <span>Customer Signature</span>
                  </div>
                  <div style={{ textAlign: 'center', width: '180px' }}>
                    <div style={{ borderBottom: '1px solid #94a3b8', height: '35px', marginBottom: '4px' }}></div>
                    <span>Authorized By (Manager)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#f8fafc' }}>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '7px 20px', fontSize: '13px' }}>
                <Printer size={15} />
                <span>Print Document</span>
              </button>
              <button onClick={() => setPrintModalData(null)} className="btn btn-secondary" style={{ padding: '7px 18px', fontSize: '13px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

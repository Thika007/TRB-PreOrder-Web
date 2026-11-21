import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Printer, 
  CreditCard, 
  AlertCircle,
  X,
  CheckCircle2,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Download
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { printOrderInvoice } from '../../utils/invoicePrinter';

export default function ManageOrders() {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [totalAmountSum, setTotalAmountSum] = useState(0);
  const [statusFilter, setStatusFilter] = useState('Show all');
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState('order_id');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals
  const [activePaymentOrder, setActivePaymentOrder] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [paying, setPaying] = useState(false);

  // Print Modal
  const [printModalData, setPrintModalData] = useState(null); // { order, items, payments, mode: 'receipt' | 'a5' }
  const [loadingPrint, setLoadingPrint] = useState(false);

  // Edit Modal
  const [editingOrder, setEditingOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    customer_mobile: '',
    delivery_date: '',
    delivery_time: '',
    delivery_type: 'Showroom Pickup',
    delivery_address: '',
    order_status: 'Pending'
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Cancel Confirmation
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('CXL');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const apiStatus = statusFilter === 'Show all' ? 'All' : statusFilter;
      let url = `/api/orders?status=${encodeURIComponent(apiStatus)}&limit=500`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setOrders(res.data.orders || []);
        if (res.data.total_amount_sum !== undefined) {
          setTotalAmountSum(parseFloat(res.data.total_amount_sum || 0));
        } else {
          const sum = (res.data.orders || []).reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0);
          setTotalAmountSum(sum);
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
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

  const sortedOrders = useMemo(() => {
    let sorted = [...orders];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      sorted = sorted.filter(o => 
        (o.order_number && o.order_number.toLowerCase().includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_mobile && o.customer_mobile.includes(q)) ||
        (o.items_summary && o.items_summary.toLowerCase().includes(q))
      );
    }

    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'total_amount' || sortField === 'balance_amount' || sortField === 'advance_amount') {
        aVal = parseFloat(aVal || 0);
        bVal = parseFloat(bVal || 0);
      } else if (sortField === 'delivery_date') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [orders, sortField, sortDirection, searchTerm]);

  // Pagination
  const totalEntries = sortedOrders.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return sortedOrders.slice(start, start + entriesPerPage);
  }, [sortedOrders, currentPage, entriesPerPage]);

  // Payment Settlement
  const openPaymentModal = (order) => {
    setActivePaymentOrder(order);
    setPayAmount(order.balance_amount);
  };

  const handleSettlePayment = async () => {
    if (!activePaymentOrder || !payAmount) return;
    setPaying(true);
    try {
      const res = await axios.post(`/api/orders/${activePaymentOrder.order_id}/pay`, {
        amount_paid: parseFloat(payAmount),
        payment_method: payMethod,
        cashier_user_id: 1
      });

      if (res.data.success) {
        showSuccess(`Payment Recorded! Receipt No: ${res.data.receipt_no} | Remaining Balance: LKR ${parseFloat(res.data.remaining_balance).toFixed(2)}`, 'Payment Recorded');
        setActivePaymentOrder(null);
        fetchOrders();
      }
    } catch (err) {
      showError(err.response?.data?.error || err.message, 'Payment Failed');
    } finally {
      setPaying(false);
    }
  };

  // Direct Print (80mm Receipt or A5 Invoice) - No second confirmation modal!
  const handleOpenPrint = async (order, mode) => {
    setLoadingPrint(true);
    try {
      const res = await axios.get(`/api/orders/${order.order_id}`);
      if (res.data.success) {
        printOrderInvoice(
          res.data.order,
          res.data.items || [],
          res.data.payments || [],
          mode
        );
      } else {
        printOrderInvoice(order, [], [], mode);
      }
    } catch (err) {
      console.error('Failed to load order details for print:', err);
      printOrderInvoice(order, [], [], mode);
    } finally {
      setLoadingPrint(false);
    }
  };

  // Edit Order Workflow
  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setEditFormData({
      customer_name: order.customer_name || '',
      customer_mobile: order.customer_mobile || '',
      delivery_date: order.delivery_date ? new Date(order.delivery_date).toISOString().split('T')[0] : '',
      delivery_time: order.delivery_time || '10:00 AM',
      delivery_type: order.delivery_type || 'Showroom Pickup',
      delivery_address: order.delivery_address || '',
      order_status: order.order_status || 'Pending'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    setSavingEdit(true);
    try {
      const res = await axios.put(`/api/orders/${editingOrder.order_id}`, editFormData);
      if (res.data.success) {
        showSuccess(`Order #${editingOrder.order_number} updated successfully!`, 'Order Updated');
        setEditingOrder(null);
        fetchOrders();
      }
    } catch (err) {
      showError('Failed to update order: ' + (err.response?.data?.error || err.message), 'Update Failed');
    } finally {
      setSavingEdit(false);
    }
  };

  // Cancel Order Workflow
  const handleCancelOrder = (order) => {
    setCancelReason('CXL');
    setCancellingOrder(order);
  };

  const confirmCancelOrder = async () => {
    if (!cancellingOrder) return;
    setCancelling(true);
    try {
      const res = await axios.put(`/api/orders/${cancellingOrder.order_id}/cancel`, {
        reason: cancelReason || 'CXL'
      });
      if (res.data.success) {
        showSuccess(`Order #${cancellingOrder.order_number} has been cancelled.`, 'Order Cancelled');
        setCancellingOrder(null);
        fetchOrders();
      }
    } catch (err) {
      showError('Cancellation failed: ' + (err.response?.data?.error || err.message), 'Cancellation Failed');
    } finally {
      setCancelling(false);
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

  return (
    <div className="manage-orders-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '100%' }}>
      
      {/* TOP CONTROLS BAR (Matches trbsys.net reference) */}
      <div className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Left Controls: Status dropdown & Show Entries */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '7px 14px',
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
                <option value="Baking">Baking</option>
                <option value="Ready">Ready</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
              <span>Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>
          </div>

          {/* Right Controls: Total Amount Box & Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Total Amount box matching screenshot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.2px' }}>
                Total Amount
              </span>
              <div style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 18px',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#1e293b',
                minWidth: '110px',
                textAlign: 'center'
              }}>
                {Math.round(totalAmountSum).toLocaleString()}
              </div>
            </div>

            {/* Search Input matching screenshot */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Search:</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Invoice, item, or customer..."
                  style={{
                    padding: '6px 12px 6px 30px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    width: '210px',
                    outline: 'none'
                  }}
                />
                <Search size={14} style={{ position: 'absolute', left: '9px', top: '9px', color: '#94a3b8' }} />
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* ORDERS GRID TABLE (Exact Layout & Columns as trbsys.net reference) */}
      <div className="card" style={{ padding: '0', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div className="table-responsive">
          <table className="trb-orders-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #e2e8f0' }}>
                <th onClick={() => handleSort('order_number')} style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Invoice ID {getSortIcon('order_number')}
                </th>
                <th onClick={() => handleSort('balance_amount')} style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Make Payment {getSortIcon('balance_amount')}
                </th>
                <th onClick={() => handleSort('items_summary')} style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}>
                  Name {getSortIcon('items_summary')}
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
                  Print {getSortIcon('order_id')}
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  Action {getSortIcon('order_id')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '44px 20px', color: '#64748b' }}>
                    <AlertCircle size={28} style={{ margin: '0 auto 8px auto', display: 'block', color: '#cbd5e1' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>No pre-orders found for the selected filter.</span>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, idx) => {
                  const balanceNum = parseFloat(order.balance_amount || 0);
                  const isDelivered = order.order_status === 'Delivered';
                  const isPending = order.order_status === 'Pending';
                  const isCancelled = order.order_status === 'Cancelled';
                  const isBaking = order.order_status === 'Baking';
                  const isReady = order.order_status === 'Ready';

                  // Format Delivery Date YYYY-MM-DD
                  let formattedDate = '-';
                  if (order.delivery_date) {
                    try {
                      formattedDate = new Date(order.delivery_date).toISOString().split('T')[0];
                    } catch (e) {
                      formattedDate = String(order.delivery_date);
                    }
                  }

                  return (
                    <tr 
                      key={order.order_id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                        transition: 'background-color 0.15s'
                      }}
                      className="trb-table-row"
                    >
                      {/* Invoice ID */}
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>
                        {order.order_number}
                      </td>

                      {/* Make Payment */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {balanceNum > 0 && !isCancelled ? (
                          <button
                            type="button"
                            onClick={() => openPaymentModal(order)}
                            className="trb-link-btn"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              padding: 0,
                              fontWeight: 600,
                              fontSize: '13px',
                              cursor: 'pointer',
                              textDecoration: 'none'
                            }}
                          >
                            Make Payment
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>

                      {/* Name (Items Summary) */}
                      <td style={{ padding: '12px 16px', color: '#1e293b', maxWidth: '280px', lineHeight: '1.4' }}>
                        {order.items_summary ? (
                          <span>{order.items_summary}</span>
                        ) : (
                          <span style={{ color: '#475569' }}>{order.customer_name || 'Counter Order'}</span>
                        )}
                      </td>

                      {/* Date of Delivery */}
                      <td style={{ padding: '12px 16px', color: '#1e293b', whiteSpace: 'nowrap' }}>
                        {formattedDate}
                      </td>

                      {/* Total */}
                      <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {parseFloat(order.total_amount || 0).toFixed(2)}
                      </td>

                      {/* Status Badge (Matches screenshot colors & radius) */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span 
                          style={{
                            display: 'inline-block',
                            padding: '3px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'center',
                            minWidth: '70px',
                            backgroundColor: isPending 
                              ? '#00b4d8' 
                              : isDelivered 
                                ? '#22c55e' 
                                : isBaking 
                                  ? '#f59e0b' 
                                  : isCancelled 
                                    ? '#ef4444' 
                                    : '#0284c7',
                            color: '#ffffff'
                          }}
                        >
                          {order.order_status}
                        </span>
                      </td>

                      {/* Balance Badge (Matches screenshot colors & format) */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {balanceNum > 0 && !isCancelled ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              backgroundColor: '#fb923c',
                              color: '#ffffff',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {balanceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Due
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 14px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              backgroundColor: '#22c55e',
                              color: '#ffffff'
                            }}
                          >
                            Paid
                          </span>
                        )}
                      </td>

                      {/* Print Column (Two stacked links: Print & Print-A5) */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenPrint(order, 'receipt')}
                            className="trb-link-btn"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              padding: 0,
                              textAlign: 'left',
                              fontSize: '13px',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Print
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenPrint(order, 'a5')}
                            className="trb-link-btn"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              padding: 0,
                              textAlign: 'left',
                              fontSize: '13px',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Print-A5
                          </button>
                        </div>
                      </td>

                      {/* Action Column (Two stacked links: Edit Order & Cancel Order) */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(order)}
                            className="trb-link-btn"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              padding: 0,
                              textAlign: 'left',
                              fontSize: '13px',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Edit Order
                          </button>
                          {order.order_status !== 'Cancelled' ? (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order)}
                              className="trb-link-btn trb-link-cancel"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#2563eb',
                                padding: 0,
                                textAlign: 'left',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Cancel Order
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Cancelled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing {totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '5px',
                backgroundColor: '#ffffff',
                fontSize: '12.5px',
                color: currentPage === 1 ? '#94a3b8' : '#334155',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 6px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  backgroundColor: currentPage === page ? '#0284c7' : '#ffffff',
                  color: currentPage === page ? '#ffffff' : '#334155',
                  fontWeight: currentPage === page ? 700 : 500,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{
                padding: '6px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '5px',
                backgroundColor: '#ffffff',
                fontSize: '12.5px',
                color: (currentPage === totalPages || totalPages === 0) ? '#94a3b8' : '#334155',
                cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          1. PRINT MODAL (Supports Both Standard Receipt & Print-A5 Delivery Note)
          ========================================================================= */}
      {printModalData && (
        <div className="print-modal-backdrop" style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div className="card print-modal-content" style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            maxWidth: printModalData.mode === 'a5' ? '820px' : '440px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Modal Header Controls (Hidden when printing) */}
            <div className="no-print" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={18} style={{ color: '#0284c7' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {printModalData.mode === 'a5' 
                    ? `Print-A5: Production & Delivery Note (#${printModalData.order?.order_number})`
                    : `POS Receipt Slip (#${printModalData.order?.order_number})`}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '13px',
                    backgroundColor: '#0284c7',
                    borderColor: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={14} />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setPrintModalData(null)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '4px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              
              {/* --- MODE A: STANDARD 80mm THERMAL RECEIPT SLIP --- */}
              {printModalData.mode === 'receipt' && (
                <div className="print-thermal-receipt" style={{
                  maxWidth: '340px',
                  margin: '0 auto',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '12px',
                  color: '#000',
                  lineHeight: '1.4'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '1px' }}>THE ROYAL BAKERY</div>
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>PRE-ORDER & PRODUCTION POS</div>
                    <div style={{ fontSize: '10px' }}>No. 294 Galle Road, Colombo 03</div>
                    <div style={{ fontSize: '10px' }}>Tel: +94 11 258 8888 / +94 77 123 4567</div>
                    <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }} />
                  </div>

                  <div style={{ marginBottom: '10px', fontSize: '11px' }}>
                    <div><strong>ORDER #:</strong> {printModalData.order?.order_number}</div>
                    <div><strong>DATE:</strong> {new Date(printModalData.order?.order_date || Date.now()).toLocaleString()}</div>
                    <div><strong>CUSTOMER:</strong> {printModalData.order?.customer_name}</div>
                    <div><strong>CONTACT:</strong> {printModalData.order?.customer_mobile}</div>
                    <div><strong>DELIVERY:</strong> {printModalData.order?.delivery_date ? new Date(printModalData.order.delivery_date).toISOString().split('T')[0] : ''} @ {printModalData.order?.delivery_time}</div>
                    <div><strong>TYPE:</strong> {printModalData.order?.delivery_type}</div>
                    {printModalData.order?.delivery_address && (
                      <div><strong>ADDRESS:</strong> {printModalData.order.delivery_address}</div>
                    )}
                  </div>

                  <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

                  {/* Items list */}
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '10px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                        <th style={{ paddingBottom: '4px' }}>Item</th>
                        <th style={{ textAlign: 'center', paddingBottom: '4px' }}>Qty</th>
                        <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printModalData.items && printModalData.items.length > 0 ? (
                        printModalData.items.map((item, i) => (
                          <React.Fragment key={i}>
                            <tr>
                              <td style={{ paddingTop: '4px' }}>{item.product_name}</td>
                              <td style={{ textAlign: 'center', paddingTop: '4px' }}>{item.quantity}</td>
                              <td style={{ textAlign: 'right', paddingTop: '4px' }}>{parseFloat(item.total_price || 0).toFixed(2)}</td>
                            </tr>
                            {item.greeting_icing_text && (
                              <tr>
                                <td colSpan="3" style={{ fontSize: '10px', fontStyle: 'italic', paddingLeft: '8px', color: '#333' }}>
                                  Msg: "{item.greeting_icing_text}"
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ paddingTop: '4px' }}>{printModalData.order?.items_summary || 'Order Items'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

                  {/* Financials */}
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Sub Total:</span>
                      <span>Rs. {parseFloat(printModalData.order?.sub_total || printModalData.order?.total_amount || 0).toFixed(2)}</span>
                    </div>
                    {parseFloat(printModalData.order?.discount_amount || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Discount:</span>
                        <span>- Rs. {parseFloat(printModalData.order.discount_amount).toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', borderTop: '1px solid #000', paddingTop: '4px', marginTop: '2px' }}>
                      <span>TOTAL:</span>
                      <span>Rs. {parseFloat(printModalData.order?.total_amount || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Advance Paid:</span>
                      <span>Rs. {parseFloat(printModalData.order?.advance_amount || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px dashed #000', paddingTop: '4px' }}>
                      <span>BALANCE DUE:</span>
                      <span>Rs. {parseFloat(printModalData.order?.balance_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ borderBottom: '1px dashed #000', margin: '14px 0 8px 0' }} />

                  <div style={{ textAlign: 'center', fontSize: '10px' }}>
                    <div>Thank you for choosing The Royal Bakery!</div>
                    <div>Please present this slip at counter collection.</div>
                    <div style={{ marginTop: '8px', fontSize: '9px', color: '#666' }}>TRB-POS SYSTEM v2.0</div>
                  </div>
                </div>
              )}

              {/* --- MODE B: PRINT-A5 PRODUCTION & DELIVERY NOTE --- */}
              {printModalData.mode === 'a5' && (
                <div className="print-a5-document" style={{
                  border: '2px solid #0f172a',
                  padding: '24px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontFamily: 'Segoe UI, Arial, sans-serif'
                }}>
                  {/* Letterhead Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div>
                      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px' }}>
                        THE ROYAL BAKERY
                      </h1>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Pre-Order & Production Dispatch Note (A5)
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>
                        No. 294 Galle Road, Colombo 03, Sri Lanka | Tel: +94 11 258 8888 / +94 77 123 4567
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0284c7', fontFamily: 'monospace' }}>
                        {printModalData.order?.order_number}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Status: <strong style={{ textTransform: 'uppercase', color: printModalData.order?.order_status === 'Delivered' ? '#16a34a' : '#d97706' }}>{printModalData.order?.order_status}</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Booked: {new Date(printModalData.order?.order_date || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Dual Info Boxes: Customer & Delivery Specifications */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    
                    {/* Customer Info Box */}
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', backgroundColor: '#f8fafc', fontSize: '12px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                        Customer Details
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div><strong>Name:</strong> {printModalData.order?.customer_name || 'Walk-in Customer'}</div>
                        <div><strong>Mobile:</strong> {printModalData.order?.customer_mobile || '-'}</div>
                        {printModalData.order?.customer_landline && (
                          <div><strong>Phone:</strong> {printModalData.order?.customer_landline}</div>
                        )}
                        <div><strong>Order Type:</strong> <span style={{ fontWeight: 700, color: '#0284c7' }}>{printModalData.order?.delivery_type || 'Showroom Pickup'}</span></div>
                      </div>
                    </div>

                    {/* Delivery & Kitchen Timing Box */}
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', backgroundColor: '#f8fafc', fontSize: '12px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                        Delivery & Dispatch Target
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div><strong>Target Date:</strong> <span style={{ fontWeight: 800, fontSize: '13px' }}>{printModalData.order?.delivery_date ? new Date(printModalData.order.delivery_date).toISOString().split('T')[0] : '-'}</span></div>
                        <div><strong>Target Time:</strong> <span style={{ fontWeight: 800, fontSize: '13px', color: '#d97706' }}>{printModalData.order?.delivery_time || '10:00 AM'}</span></div>
                        <div><strong>Dispatch Address:</strong> {printModalData.order?.delivery_address || 'Showroom Counter Pick-up'}</div>
                      </div>
                    </div>

                  </div>

                  {/* Production & Item Specifications Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Production Items & Custom Specifications
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #cbd5e1' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                          <th style={{ padding: '8px 10px', width: '35px' }}>#</th>
                          <th style={{ padding: '8px 10px' }}>Product Description</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', width: '70px' }}>Qty</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right', width: '100px' }}>Unit (LKR)</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right', width: '110px' }}>Total (LKR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printModalData.items && printModalData.items.length > 0 ? (
                          printModalData.items.map((item, idx) => (
                            <React.Fragment key={idx}>
                              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                                <td style={{ padding: '8px 10px', fontWeight: 600 }}>{idx + 1}</td>
                                <td style={{ padding: '8px 10px', fontWeight: 700 }}>
                                  {item.product_name}
                                  {item.net_weight && <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>({item.net_weight})</span>}
                                </td>
                                <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace' }}>{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>{parseFloat(item.total_price || 0).toFixed(2)}</td>
                              </tr>
                              {/* Special Cake Inscriptions / Decor / Kitchen Notes */}
                              {(item.greeting_icing_text || item.cake_shape_flavor || item.cake_colour_theme || item.item_notes) && (
                                <tr style={{ backgroundColor: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
                                  <td />
                                  <td colSpan="4" style={{ padding: '6px 10px', fontSize: '11px', color: '#92400e' }}>
                                    {item.greeting_icing_text && <div>🎂 <strong>Cake Inscription:</strong> "{item.greeting_icing_text}"</div>}
                                    {item.cake_shape_flavor && <div>🍰 <strong>Flavor / Shape:</strong> {item.cake_shape_flavor}</div>}
                                    {item.cake_colour_theme && <div>🎨 <strong>Theme / Color:</strong> {item.cake_colour_theme}</div>}
                                    {item.item_notes && <div>📝 <strong>Special Chef Note:</strong> {item.item_notes}</div>}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))
                        ) : (
                          <tr>
                            <td style={{ padding: '8px 10px' }}>1</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>{printModalData.order?.items_summary || 'Standard Pre-Order Package'}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>1</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right' }}>{parseFloat(printModalData.order?.total_amount || 0).toFixed(2)}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{parseFloat(printModalData.order?.total_amount || 0).toFixed(2)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Financials & Settlement Summary Box */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                    <div style={{ width: '280px', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b' }}>Sub Total:</span>
                        <span style={{ fontWeight: 600 }}>Rs. {parseFloat(printModalData.order?.sub_total || printModalData.order?.total_amount || 0).toFixed(2)}</span>
                      </div>
                      {parseFloat(printModalData.order?.discount_amount || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', borderBottom: '1px solid #e2e8f0', color: '#059669' }}>
                          <span>Discount Applied:</span>
                          <span style={{ fontWeight: 600 }}>- Rs. {parseFloat(printModalData.order.discount_amount).toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', backgroundColor: '#f1f5f9', fontWeight: 800, fontSize: '13px' }}>
                        <span>Total Payable:</span>
                        <span>Rs. {parseFloat(printModalData.order?.total_amount || 0).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', color: '#059669', fontWeight: 700 }}>
                        <span>Advance Received:</span>
                        <span>Rs. {parseFloat(printModalData.order?.advance_amount || 0).toFixed(2)}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: parseFloat(printModalData.order?.balance_amount || 0) > 0 ? '#fef3c7' : '#ecfdf5',
                        borderTop: '2px solid #0f172a',
                        fontWeight: 900,
                        fontSize: '13.5px',
                        color: parseFloat(printModalData.order?.balance_amount || 0) > 0 ? '#b45309' : '#059669'
                      }}>
                        <span>Balance Due:</span>
                        <span>Rs. {parseFloat(printModalData.order?.balance_amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures & Formal Dispatch Line */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1', fontSize: '11.5px' }}>
                    <div>
                      <div style={{ marginBottom: '32px', color: '#64748b' }}>
                        Order verified and received in good condition:
                      </div>
                      <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <strong>Customer Acceptance Signature</strong>
                        <span style={{ color: '#64748b' }}>Date</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ marginBottom: '32px', color: '#64748b' }}>
                        Dispatched & Approved from Royal Bakery Kitchen:
                      </div>
                      <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <strong>Authorized Dispatcher / Cashier</strong>
                        <span style={{ color: '#64748b' }}>Seal</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. EDIT ORDER MODAL (Allows updating schedule, customer details & status)
          ========================================================================= */}
      {editingOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          padding: '20px'
        }}>
          <div className="card" style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            width: '520px',
            maxWidth: '92vw',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Edit Order #{editingOrder.order_number}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Modify delivery schedule, customer contact, and order status</span>
              </div>
              <button 
                onClick={() => setEditingOrder(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Customer Name */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={editFormData.customer_name}
                  onChange={(e) => setEditFormData({ ...editFormData, customer_name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  Customer Mobile Phone *
                </label>
                <input
                  type="text"
                  value={editFormData.customer_mobile}
                  onChange={(e) => setEditFormData({ ...editFormData, customer_mobile: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              {/* Date & Time Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={editFormData.delivery_date}
                    onChange={(e) => setEditFormData({ ...editFormData, delivery_date: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Delivery Time Slot *
                  </label>
                  <input
                    type="text"
                    value={editFormData.delivery_time}
                    onChange={(e) => setEditFormData({ ...editFormData, delivery_time: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Delivery Type & Status Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Delivery Method
                  </label>
                  <select
                    value={editFormData.delivery_type}
                    onChange={(e) => setEditFormData({ ...editFormData, delivery_type: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                  >
                    <option value="Showroom Pickup">Showroom Pickup</option>
                    <option value="Home Delivery">Home Delivery</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Order Status
                  </label>
                  <select
                    value={editFormData.order_status}
                    onChange={(e) => setEditFormData({ ...editFormData, order_status: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Baking">Baking</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Delivery Address (if Delivery) */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  Delivery Destination / Notes
                </label>
                <textarea
                  rows="2"
                  value={editFormData.delivery_address}
                  onChange={(e) => setEditFormData({ ...editFormData, delivery_address: e.target.value })}
                  placeholder="Leave blank for showroom counter pick up..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingOrder(null)}
                  style={{ flex: 1, padding: '9px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '9px 16px', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                >
                  {savingEdit ? 'Saving Changes...' : 'Save Order Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. CANCEL ORDER CONFIRMATION MODAL
          ========================================================================= */}
      {cancellingOrder && (
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
            width: '440px',
            maxWidth: '92vw',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <button
              type="button"
              onClick={() => setCancellingOrder(null)}
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
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <Trash2 size={26} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Cancel Order #{cancellingOrder.order_number}?
            </h3>

            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Are you sure you want to cancel this order? This will mark the order and any queued kitchen baking tasks as <strong>Cancelled</strong>.
            </p>

            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Cancellation Reason
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="CXL">CXL (Standard Cancellation)</option>
                <option value="C">C (Customer Request)</option>
                <option value="Customer Cancelled">Customer Cancelled</option>
                <option value="Duplicate Order">Duplicate Order</option>
                <option value="Incorrect Entry">Incorrect Entry</option>
                <option value="Payment Issue">Payment Issue</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCancellingOrder(null)}
                style={{ flex: 1, padding: '9px 16px' }}
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                disabled={cancelling}
                className="btn btn-primary"
                style={{ flex: 1, padding: '9px 16px', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MAKE PAYMENT MODAL (Menu 3.3 Balance Settlement)
          ========================================================================= */}
      {activePaymentOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: '420px', maxWidth: '90vw', padding: '24px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Make Payment - Balance Settlement
              </h3>
              <button 
                onClick={() => setActivePaymentOrder(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Order Number:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{activePaymentOrder.order_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Customer:</span>
                <strong>{activePaymentOrder.customer_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b45309', fontWeight: 700, borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                <span>Total Balance Due:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>LKR {parseFloat(activePaymentOrder.balance_amount).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                Amount to Collect (LKR)*
              </label>
              <input 
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '2px solid #059669', fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                Payment Tender Method
              </label>
              <select 
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
              >
                <option>Cash</option>
                <option>Card / POS</option>
                <option>Bank Transfer</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setActivePaymentOrder(null)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSettlePayment}
                disabled={paying}
                style={{ flex: 2, background: '#059669', borderColor: '#059669' }}
              >
                <CheckCircle2 size={16} />
                <span>{paying ? 'Processing...' : 'Settle & Print Slip'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

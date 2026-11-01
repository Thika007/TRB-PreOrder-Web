import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Calendar, 
  Printer, 
  CreditCard, 
  Eye, 
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryDateFilter, setDeliveryDateFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Payment Modal State
  const [activePaymentOrder, setActivePaymentOrder] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [paying, setPaying] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/orders?status=${statusFilter}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (deliveryDateFilter) url += `&delivery_date=${deliveryDateFilter}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, deliveryDateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

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
        alert(`Payment Recorded! Receipt No: ${res.data.receipt_no}\nRemaining Balance: LKR ${res.data.remaining_balance.toFixed(2)}`);
        setActivePaymentOrder(null);
        fetchOrders();
      }
    } catch (err) {
      alert('Payment failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setPaying(false);
    }
  };

  const statusTabs = ['All', 'Pending', 'Baking', 'Ready', 'Delivered', 'Cancelled'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* FILTER TABS & SEARCH BAR */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {statusTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: statusFilter === tab ? 'none' : '1px solid #cbd5e1',
                  background: statusFilter === tab ? '#0f172a' : '#fff',
                  color: statusFilter === tab ? '#fbbf24' : '#64748b',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Inputs */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="date"
              value={deliveryDateFilter}
              onChange={(e) => setDeliveryDateFilter(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search order # or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '7px 12px 7px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '220px' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '12.5px' }}>
              Filter
            </button>
          </form>
        </div>
      </div>

      {/* ORDERS GRID TABLE */}
      <div className="card">
        <div className="table-responsive">
          <table className="pos-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Delivery Date</th>
                <th>Time</th>
                <th>Total (LKR)</th>
                <th>Advance</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <AlertCircle size={24} style={{ margin: '0 auto 6px auto', display: 'block', color: '#cbd5e1' }} />
                    No pre-orders found for the selected filter.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.order_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                      {order.order_number}
                    </td>
                    <td style={{ fontWeight: 600 }}>{order.customer_name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>{order.customer_mobile}</td>
                    <td style={{ fontWeight: 600 }}>
                      {new Date(order.delivery_date).toLocaleDateString()}
                    </td>
                    <td style={{ color: '#d97706', fontWeight: 600 }}>{order.delivery_time}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 600 }}>
                      {parseFloat(order.advance_amount).toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: order.balance_amount > 0 ? '#b45309' : '#64748b', fontWeight: 700 }}>
                      {parseFloat(order.balance_amount).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge badge-${order.order_status?.toLowerCase()}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {order.balance_amount > 0 && order.order_status !== 'Cancelled' && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => openPaymentModal(order)}
                            style={{ padding: '4px 8px', fontSize: '11px', background: '#059669' }}
                            title="Settle Remaining Balance"
                          >
                            <CreditCard size={13} />
                            <span>Pay</span>
                          </button>
                        )}
                        <button 
                          className="btn btn-secondary"
                          onClick={() => window.print()}
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Print Receipt"
                        >
                          <Printer size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MAKE PAYMENT MODAL (Menu 3.3 Balance Settlement) */}
      {activePaymentOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '420px', maxWidth: '90vw', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
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
                <span>Order Number:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{activePaymentOrder.order_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Customer:</span>
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
                style={{ flex: 2, background: '#059669' }}
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


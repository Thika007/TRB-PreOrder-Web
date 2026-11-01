import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Clock, 
  Users, 
  PlusCircle, 
  ArrowRight, 
  ChefHat, 
  Truck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    newCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, customersRes] = await Promise.all([
          axios.get('/api/orders?limit=10'),
          axios.get('/api/customers?limit=1')
        ]);

        if (ordersRes.data.success) {
          const orders = ordersRes.data.orders;
          setRecentOrders(orders);
          setStats({
            totalOrders: ordersRes.data.total || 0,
            pendingOrders: orders.filter(o => o.order_status === 'Pending').length,
            newCustomers: customersRes.data.total || 0
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI SUMMARY CARDS (Exact trbsys.net Header Cards) */}
      <div className="stat-grid">
        {/* CARD 1: TOTAL ORDERS */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <ShoppingBag size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.totalOrders}</span>
            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>This Month Admin</span>
          </div>
        </div>

        {/* CARD 2: TOTAL PENDING ORDERS */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Pending Orders</span>
            <span className="stat-value" style={{ color: '#d97706' }}>{stats.pendingOrders}</span>
            <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 600, marginTop: '2px' }}>Awaiting Prep / Auth</span>
          </div>
        </div>

        {/* CARD 3: TOTAL NEW CUSTOMERS */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <Users size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Customers</span>
            <span className="stat-value">{stats.newCustomers}</span>
            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Indexed Mobile Profiles</span>
          </div>
        </div>
      </div>

      {/* QUICK LAUNCH ACTIONS BANNER */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.3px' }}>
              Royal Bakery Showroom Counter Station
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
              Ultra-fast local billing running on Microsoft SQL Server. Zero internet lag, instant printing.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/add-order')}
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              <PlusCircle size={18} />
              <span>Book Cake Order (F1)</span>
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/manage_orders')}
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <span>Manage Orders Grid</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Recent Showroom Pre-Orders</h3>
            <p style={{ fontSize: '12.5px', color: '#64748b' }}>Latest cake and bakery bookings placed at showroom counters</p>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/manage_orders')}
            style={{ fontSize: '12.5px', padding: '6px 12px' }}
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="pos-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Delivery Date & Time</th>
                <th>Type</th>
                <th>Total (LKR)</th>
                <th>Advance</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <AlertCircle size={28} style={{ margin: '0 auto 8px auto', display: 'block', color: '#cbd5e1' }} />
                    <span>No pre-orders recorded yet. Press <strong>[F1]</strong> to create the first cake pre-order!</span>
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.order_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                      {order.order_number}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{order.customer_mobile}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 600 }}>{order.delivery_time}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px' }}>{order.delivery_type}</span>
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: '#059669', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {parseFloat(order.advance_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: order.balance_amount > 0 ? '#b45309' : '#64748b', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {parseFloat(order.balance_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge badge-${order.order_status?.toLowerCase()}`}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

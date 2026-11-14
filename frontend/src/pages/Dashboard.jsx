import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Info,
  PlusCircle, 
  ArrowRight, 
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Users,
  TrendingUp,
  RotateCw
} from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthName = lastMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Real-time Database KPI Stats
  const [stats, setStats] = useState({
    thisMonth: {
      totalOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      deliveredOrders: 0,
      newCustomers: 0,
      totalRevenue: 0,
      advanceCollected: 0,
      balanceDue: 0
    },
    lastMonth: {
      totalOrders: 0,
      pendingOrders: 0,
      newCustomers: 0,
      totalRevenue: 0
    },
    allTime: {
      totalOrders: 0,
      pendingOrders: 0,
      totalCustomers: 0
    }
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Fetch real-time dashboard data directly from MSSQL database
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (isSilent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [statsRes, recentRes] = await Promise.all([
        axios.get('/api/dashboard/stats').catch(err => {
          console.warn('Dashboard stats endpoint failed, falling back:', err.message);
          return { data: { success: false } };
        }),
        axios.get('/api/dashboard/recent-orders?limit=10').catch(err => {
          console.warn('Recent orders endpoint failed, falling back:', err.message);
          return { data: { success: false } };
        })
      ]);

      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (recentRes.data && recentRes.data.success) {
        setRecentOrders(recentRes.data.orders || []);
      }
      
      setLastSync(new Date());
    } catch (err) {
      console.error('Failed to load real-time dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load and live auto-polling every 15 seconds
  useEffect(() => {
    fetchDashboardData(false);

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 15000);

    const handleWindowFocus = () => {
      fetchDashboardData(true);
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchDashboardData]);

  return (
    <div className="dashboard-page-container">
      {/* ========================================================
          SECTION 1: CURRENT MONTH OPERATIONS (Real-time DB Data)
          ======================================================== */}
      <div className="dashboard-metric-section">
        <div className="dashboard-section-header-wrap">
          <div className="dashboard-section-title-group">
            <h2 className="dashboard-section-heading">Current Month Operations</h2>
            <span className="metric-period-pill live">
              <span className="live-dot"></span>
              Active Cycle • {currentMonthName}
            </span>
          </div>

          {/* Live Sync Badge & Manual Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#10b981', 
                display: 'inline-block',
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)'
              }}></span>
              Live Database Connected {lastSync ? `• ${lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
            </span>
            <button
              type="button"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="btn btn-secondary text-sm"
              style={{ padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Refresh live metrics from database"
            >
              <RotateCw size={13} className={refreshing ? 'trb-spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>

        <div className="trb-card-grid">
          {/* Card 1: Total Orders This Month */}
          <div className="kpi-stat-card kpi-card-blue">
            <div className="kpi-top-row">
              <div className="kpi-label-group">
                <span className="kpi-label">TOTAL PRE-ORDERS</span>
              </div>
              <div className="kpi-icon-box icon-box-blue" title="Total orders placed in the current cycle">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value value-blue">{stats.thisMonth.totalOrders}</span>
            </div>
            <div className="kpi-footer-row">
              <TrendingUp size={14} className="kpi-footer-icon icon-blue" />
              <span>
                {stats.thisMonth.totalRevenue > 0 
                  ? `Rs. ${stats.thisMonth.totalRevenue.toLocaleString()} volume • ${stats.thisMonth.cancelledOrders} cancelled` 
                  : 'Booked bakery orders this month'}
              </span>
            </div>
          </div>

          {/* Card 2: Total Pending Orders This Month */}
          <div className="kpi-stat-card kpi-card-amber">
            <div className="kpi-top-row">
              <div className="kpi-label-group">
                <span className="kpi-label">PENDING IN QUEUE</span>
              </div>
              <div className="kpi-icon-box icon-box-amber" title="Orders pending kitchen preparation or dispatch">
                <Clock size={20} />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value value-amber">{stats.thisMonth.pendingOrders}</span>
            </div>
            <div className="kpi-footer-row">
              <Clock size={14} className="kpi-footer-icon icon-amber" />
              <span>Awaiting production or delivery ({stats.allTime?.pendingOrders || stats.thisMonth.pendingOrders} active)</span>
            </div>
          </div>

          {/* Card 3: Total New Customers This Month */}
          <div className="kpi-stat-card kpi-card-emerald">
            <div className="kpi-top-row">
              <div className="kpi-label-group">
                <span className="kpi-label">NEW CUSTOMER PROFILES</span>
              </div>
              <div className="kpi-icon-box icon-box-emerald" title="Newly registered customer phone profiles">
                <Users size={20} />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value value-emerald">{stats.thisMonth.newCustomers}</span>
            </div>
            <div className="kpi-footer-row">
              <Users size={14} className="kpi-footer-icon icon-emerald" />
              <span>Registered counter profiles this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 2: PRIOR MONTH BENCHMARK (Real-time DB Data)
          ======================================================== */}
      <div className="dashboard-metric-section">
        <div className="dashboard-section-header-wrap">
          <div className="dashboard-section-title-group">
            <h2 className="dashboard-section-heading">Prior Month Benchmark</h2>
            <span className="metric-period-pill">
              Closed Cycle • {lastMonthName}
            </span>
          </div>
        </div>

        <div className="trb-card-grid">
          {/* Card 1: Last Month Total Orders */}
          <div className="kpi-stat-card kpi-card-blue">
            <div className="kpi-top-row">
              <div className="kpi-label-group">
                <span className="kpi-label">TOTAL PRE-ORDERS</span>
              </div>
              <div className="kpi-icon-box icon-box-blue" title="Total completed orders in the previous month">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value value-blue">{stats.lastMonth.totalOrders}</span>
            </div>
            <div className="kpi-footer-row">
              <ShoppingBag size={14} className="kpi-footer-icon icon-blue" />
              <span>
                {stats.lastMonth.totalRevenue > 0
                  ? `Rs. ${stats.lastMonth.totalRevenue.toLocaleString()} volume`
                  : 'Historical closed volume'}
              </span>
            </div>
          </div>

          {/* Card 2: Last Month Total Pending Orders */}
          <div className="kpi-stat-card kpi-card-amber">
            <div className="kpi-top-row">
              <div className="kpi-label-group">
                <span className="kpi-label">UNFULFILLED / CARRIED</span>
              </div>
              <div className="kpi-icon-box icon-box-amber" title="Pending orders recorded in the previous month">
                <Clock size={20} />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value value-amber">{stats.lastMonth.pendingOrders}</span>
            </div>
            <div className="kpi-footer-row">
              <Clock size={14} className="kpi-footer-icon icon-amber" />
              <span>Carried forward or archived</span>
            </div>
          </div>

          {/* Card 3: Last Month Total New Customers */}
          <div className="kpi-stat-card kpi-card-emerald">
            <div className="kpi-top-row">
              <div className="kpi-label-group">
                <span className="kpi-label">REGISTERED CUSTOMERS</span>
              </div>
              <div className="kpi-icon-box icon-box-emerald" title="Customer profiles registered in the previous month">
                <Users size={20} />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value value-emerald">{stats.lastMonth.newCustomers}</span>
            </div>
            <div className="kpi-footer-row">
              <Users size={14} className="kpi-footer-icon icon-emerald" />
              <span>Profiles registered in {lastMonthName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 3: RECENT SHOWROOM PRE-ORDERS
          ======================================================== */}
      <div className="recent-orders-card">
        <div className="recent-orders-header">
          <div>
            <h3 className="card-heading">Recent Showroom Pre-Orders</h3>
            <p className="card-subheading">Latest cake and bakery bookings placed at showroom counters</p>
          </div>
          <button 
            className="btn btn-secondary text-sm"
            onClick={() => navigate('/manage_orders')}
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-orders-state">
            <div className="empty-icon-wrap">
              <ShoppingBag size={32} />
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              No Pre-Orders Recorded Yet
            </h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Press [F1] or click below to create the first cake pre-order!
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/add-order')}
            >
              <PlusCircle size={15} />
              <span>Create New Order (F1)</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table className="categories-data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '150px' }}>Order #</th>
                  <th style={{ minWidth: '180px' }}>Customer</th>
                  <th style={{ minWidth: '170px' }}>Delivery Schedule</th>
                  <th style={{ minWidth: '130px', textAlign: 'center' }}>Type</th>
                  <th style={{ minWidth: '120px', textAlign: 'right' }}>Total (LKR)</th>
                  <th style={{ minWidth: '120px', textAlign: 'right' }}>Advance</th>
                  <th style={{ minWidth: '120px', textAlign: 'right' }}>Balance</th>
                  <th style={{ minWidth: '130px', textAlign: 'center' }}>Status</th>
                  <th style={{ minWidth: '90px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => {
                  const delDate = ord.delivery_date 
                    ? new Date(ord.delivery_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '-';
                  const isPickup = (ord.delivery_type || '').toLowerCase().includes('pickup') || (ord.delivery_type || '').toLowerCase().includes('showroom');
                  const statusRaw = (ord.order_status || 'Pending').toLowerCase().replace(/\s+/g, '-');
                  
                  return (
                    <tr key={ord.order_id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        <span style={{ color: '#258be0', marginRight: '4px' }}>#</span>
                        {ord.order_number}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{ord.customer_name || 'Walk-in Customer'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{ord.customer_mobile || ord.mobile || '-'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{delDate}</div>
                        <div style={{ fontSize: '11.5px', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Clock size={12} />
                          <span>{ord.delivery_time || '11:00 AM'}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`trb-badge ${isPickup ? 'trb-badge-pickup' : 'trb-badge-delivery'}`}>
                          {ord.delivery_type || 'Showroom Pickup'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        Rs. {parseFloat(ord.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                        Rs. {parseFloat(ord.advance_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', color: parseFloat(ord.balance_amount || 0) > 0 ? '#e11d48' : '#059669', fontWeight: 700 }}>
                        Rs. {parseFloat(ord.balance_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`trb-badge trb-badge-${statusRaw}`}>
                          <span className="trb-badge-dot"></span>
                          {ord.order_status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => navigate('/manage_orders')}
                          className="btn-cat-action btn-cat-edit"
                          title="Manage Order"
                        >
                          <ArrowRight size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

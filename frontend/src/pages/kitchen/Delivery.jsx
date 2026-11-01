import React, { useState, useEffect } from 'react';
import { Truck, Calendar, Printer, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function Delivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/kitchen/delivery-sheet?date=${selectedDate}&type=${selectedType}`);
      if (res.data.success) {
        setDeliveries(res.data.deliveries);
      }
    } catch (err) {
      console.error('Failed to load delivery sheet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [selectedDate, selectedType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="#d97706" />
              <label style={{ fontSize: '12.5px', fontWeight: 700 }}>Dispatch Date:</label>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} color="#d97706" />
              <label style={{ fontSize: '12.5px', fontWeight: 700 }}>Type:</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
              >
                <option value="All">All Dispatches</option>
                <option value="Showroom Pickup">Showroom Pickup</option>
                <option value="Delivery">Direct Delivery</option>
              </select>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={15} />
            <span>Print Delivery Run Sheet</span>
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
          Today's Collection & Delivery Dispatch Log
        </h3>

        <div className="table-responsive">
          <table className="pos-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Due Time</th>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>Type</th>
                <th>Delivery Address</th>
                <th>Bill Total</th>
                <th>Balance Due</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <AlertCircle size={24} style={{ margin: '0 auto 6px auto', display: 'block', color: '#cbd5e1' }} />
                    No orders scheduled for delivery or pickup on this date.
                  </td>
                </tr>
              ) : (
                deliveries.map(d => (
                  <tr key={d.order_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{d.order_number}</td>
                    <td style={{ color: '#d97706', fontWeight: 700 }}>{d.delivery_time}</td>
                    <td style={{ fontWeight: 600 }}>{d.customer_name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{d.mobile}</td>
                    <td><span className="badge badge-authorized">{d.delivery_type}</span></td>
                    <td style={{ fontSize: '12.5px', color: '#475569' }}>{d.delivery_address || 'Showroom Counter'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{parseFloat(d.total_amount).toFixed(2)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: d.balance_amount > 0 ? '#b45309' : '#059669' }}>
                      {parseFloat(d.balance_amount).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge badge-${d.payment_status === 'Fully Paid' ? 'ready' : 'pending'}`}>
                        {d.payment_status}
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


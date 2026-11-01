import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Plus, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`/api/customers?page=${page}&limit=25&search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setCustomers(res.data.customers);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search by customer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 14px 8px 34px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', width: '320px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
          </div>

          <div style={{ color: '#64748b', fontSize: '13px' }}>
            Total Registered Customers: <strong style={{ color: '#0f172a' }}>{total}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="pos-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>Landline</th>
                <th>Delivery Address</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No customer records found.
                  </td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.customer_id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {c.title} {c.first_name} {c.last_name || ''}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#d97706' }}>
                      {c.mobile}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                      {c.landline || '-'}
                    </td>
                    <td style={{ color: '#475569' }}>
                      {c.delivery_address || 'Showroom Pickup'}
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {c.email || '-'}
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


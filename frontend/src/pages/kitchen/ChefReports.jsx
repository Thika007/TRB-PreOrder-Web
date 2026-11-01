import React, { useState, useEffect } from 'react';
import { ChefHat, Calendar, Printer, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function ChefReports() {
  const [worksheet, setWorksheet] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedChef, setSelectedChef] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchWorksheet = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/kitchen/chef-worksheet?date=${selectedDate}&chef=${selectedChef}`);
      if (res.data.success) {
        setWorksheet(res.data.worksheet);
      }
    } catch (err) {
      console.error('Failed to load chef worksheet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorksheet();
  }, [selectedDate, selectedChef]);

  const handleUpdateStatus = async (productionId, newStatus) => {
    try {
      await axios.put(`/api/kitchen/status/${productionId}`, { status: newStatus });
      fetchWorksheet();
    } catch (err) {
      alert('Failed to update kitchen status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* FILTER & DISPATCH BAR */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="#d97706" />
              <label style={{ fontSize: '12.5px', fontWeight: 700 }}>Bake Target Date:</label>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChefHat size={16} color="#d97706" />
              <label style={{ fontSize: '12.5px', fontWeight: 700 }}>Chef in Charge:</label>
              <select 
                value={selectedChef}
                onChange={(e) => setSelectedChef(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
              >
                <option value="All">All Chefs</option>
                <option value="Cheff Premaratna">Cheff Premaratna (Cakes & Pastries)</option>
                <option value="Cheff Wickramapala">Cheff Wickramapala (Breads & Cake-2)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={fetchWorksheet} title="Refresh List">
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>
            <button className="btn btn-primary" onClick={() => window.print()} title="Print Chef Worksheets">
              <Printer size={15} />
              <span>Print Kitchen Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHEF BAKING SCHEDULE TABLE */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
          Daily Cake & Bakery Production Worksheet
        </h3>

        <div className="table-responsive">
          <table className="pos-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Due Time</th>
                <th>Product Description</th>
                <th>Qty</th>
                <th>Cake Greeting & Inscription</th>
                <th>Item Remarks</th>
                <th>Assigned Chef</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {worksheet.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No cake orders scheduled for baking on this date.
                  </td>
                </tr>
              ) : (
                worksheet.map(item => (
                  <tr key={item.production_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{item.order_number}</td>
                    <td style={{ color: '#d97706', fontWeight: 700 }}>{item.delivery_time}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{item.product_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Weight: {item.net_weight || 'Standard'}</div>
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{item.quantity}</td>
                    <td>
                      {(item.greeting_occasion !== 'None' || item.greeting_icing_text) ? (
                        <div style={{ background: '#fef3c7', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                          <div style={{ fontWeight: 800, color: '#b45309', fontSize: '12.5px' }}>
                            {item.greeting_milestone !== 'None' ? `${item.greeting_milestone} ` : ''}
                            {item.greeting_occasion}
                          </div>
                          {item.greeting_icing_text && (
                            <div style={{ color: '#0f172a', fontWeight: 700, marginTop: '2px', fontSize: '13px' }}>
                              "{item.greeting_icing_text}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Standard Bake</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{item.item_notes || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{item.assigned_chef || 'Kitchen Queue'}</td>
                    <td>
                      <span className={`badge badge-${item.production_status === 'Finished' ? 'ready' : (item.production_status === 'In Oven' ? 'baking' : 'pending')}`}>
                        {item.production_status}
                      </span>
                    </td>
                    <td>
                      {item.production_status !== 'Finished' ? (
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleUpdateStatus(item.production_id, 'Finished')}
                          style={{ padding: '4px 8px', fontSize: '11px', background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                          title="Mark as Baked & Finished"
                        >
                          <CheckCircle size={13} />
                          <span>Finished</span>
                        </button>
                      ) : (
                        <span style={{ color: '#059669', fontWeight: 700, fontSize: '11px' }}>Ready</span>
                      )}
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

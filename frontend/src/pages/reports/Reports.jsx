import React from 'react';
import { BarChart3, FileText, DollarSign, Calendar } from 'lucide-react';

export default function Reports() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Reports & Sales Analytics</h3>
        <p style={{ color: '#64748b', fontSize: '13px' }}>
          Corresponds to Menu 6: Overall Invoices, Product Wise Sales, and All Payment Summary.
        </p>

        <div className="stat-grid" style={{ marginTop: '20px' }}>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => window.print()}>
            <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <FileText size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">By Invoice Report</span>
              <span style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Daily pre-order bill breakdown</span>
            </div>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => window.print()}>
            <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <DollarSign size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Payment Collection Report</span>
              <span style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Cash, Card & Advance reconciliation</span>
            </div>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => window.print()}>
            <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <BarChart3 size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Product Wise Sales</span>
              <span style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Top sold cakes & bakery bakes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

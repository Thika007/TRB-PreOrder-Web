import React from 'react';
import { MessageSquare, Send, Users } from 'lucide-react';

export default function Promotions() {
  return (
    <div className="card" style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <MessageSquare size={22} color="#d97706" />
        <h3 style={{ fontSize: '17px', fontWeight: 800 }}>SMS Promotions Portal (Menu 7: Promotion SMS)</h3>
      </div>
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
        Replaces legacy trbsys.net promotion module with direct customer SMS broadcasts for bakery milestones.
      </p>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12.5px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Target Audience</label>
        <select style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
          <option>All Registered Pre-Order Customers (Active Profiles)</option>
          <option>Customers with Orders in Last 30 Days</option>
          <option>Custom Cake VIP Clients</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12.5px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>SMS Message Content</label>
        <textarea 
          rows="4" 
          placeholder="Special weekend offer at The Royal Bakery! Order your custom cakes today..."
          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
        ></textarea>
      </div>

      <button className="btn btn-primary" onClick={() => alert('SMS Gateway integration configured for production delivery.')}>
        <Send size={16} />
        <span>Send Promotional Broadcast</span>
      </button>
    </div>
  );
}

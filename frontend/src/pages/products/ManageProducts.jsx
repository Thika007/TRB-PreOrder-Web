import React, { useState, useEffect } from 'react';
import { Layers, Search, Plus, Filter } from 'lucide-react';
import axios from 'axios';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/products/categories')
      .then(res => {
        if (res.data.success) setCategories(res.data.categories);
      })
      .catch(console.error);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products?';
      if (selectedCat) url += `main_cat_id=${selectedCat}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCat, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select 
              value={selectedCat} 
              onChange={(e) => setSelectedCat(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '13px' }}
            >
              <option value="">All Categories (850+ Items)</option>
              {categories.map(cat => (
                <option key={cat.main_cat_id} value={cat.main_cat_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>

            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search product name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '8px 14px 8px 34px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '280px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing <strong style={{ color: '#0f172a' }}>{products.length}</strong> Products
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="pos-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product Name</th>
                <th>Main Category</th>
                <th>Sub Category</th>
                <th>Net Weight</th>
                <th>Price (LKR)</th>
                <th>Discount Status</th>
                <th>DanuPOS Link</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No products found matching filter.
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.product_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#64748b' }}>
                      {p.product_code || `PRD-${p.product_id}`}
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{p.product_name}</td>
                    <td><span className="badge badge-authorized">{p.main_category_name || '-'}</span></td>
                    <td style={{ color: '#64748b' }}>{p.sub_category_name || '-'}</td>
                    <td>{p.net_weight || '-'}</td>
                    <td style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {parseFloat(p.unit_price).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${p.is_discountable ? 'badge-ready' : 'badge-delivered'}`}>
                        {p.is_discountable ? 'Discount' : 'Non Discount'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#64748b' }}>
                      {p.danupos_item_code || 'Auto-Mapped'}
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


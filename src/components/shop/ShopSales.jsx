// src/components/shop/ShopSales.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../TopBar';
import ShopSidebar, { SHOP_COLLAPSED_WIDTH } from './ShopSidebar';
import API_BASE from '../../api';

export default function ShopSales() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const hasAccess = Boolean(token && role === 'storeowner');

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!hasAccess) return;
    axios.get(`${API_BASE}/api/products/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setItems(data))
      .catch(()=>{});
  }, [hasAccess, token]);

  if (!hasAccess) return <Navigate to="/" replace />;

  const shell = { maxWidth: 1100, margin:'0 auto', padding:16, paddingLeft: SHOP_COLLAPSED_WIDTH + 16 };
  const card  = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16 };
  const row   = { display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:10, alignItems:'center' };

  return (
    <>
      <TopBar />
      <ShopSidebar />
      <div style={shell}>
        <main>
          <div style={{ ...card, marginBottom:12 }}>
            <h2 style={{ marginTop:0 }}>Sales & Reach</h2>
            <div style={{ ...row, fontWeight:700, borderBottom:'1px solid #eee', paddingBottom:8 }}>
              <div>Product</div><div>Price</div><div>Views</div><div>Created</div>
            </div>
            {!items.length ? (
              <div style={{ color:'#666', marginTop:10 }}>You don’t have products yet.</div>
            ) : items.map(p => (
              <div key={p._id} style={{ ...row, padding:'10px 0', borderBottom:'1px solid #f3f4f6' }}>
                <div>{p.title}</div>
                <div>${Number(p.price||0).toFixed(2)}</div>
                <div>{p.views || 0}</div>
                <div>{new Date(p.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

// src/components/shop/ShopSettings.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import TopBar from '../TopBar';
import ShopSidebar, { SHOP_COLLAPSED_WIDTH } from './ShopSidebar';

export default function ShopSettings() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const hasAccess = Boolean(token && role === 'storeowner');

  if (!hasAccess) return <Navigate to="/" replace />;

  const shell = { maxWidth: 1100, margin:'0 auto', padding:16, paddingLeft: SHOP_COLLAPSED_WIDTH + 16 };
  const card  = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16 };
  const input = { width:'100%', padding:10, border:'1px solid #e5e7eb', borderRadius:10 };

  return (
    <>
      <TopBar />
      <ShopSidebar />
      <div style={shell}>
        <main>
          <div style={card}>
            <h2 style={{ marginTop:0 }}>Shop Settings</h2>
            <div style={{ display:'grid', gap:12, maxWidth:600 }}>
              <label>
                <div style={{ fontWeight:600, marginBottom:6 }}>Store status</div>
                <select style={input} defaultValue="open">
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </label>

              <label>
                <div style={{ fontWeight:600, marginBottom:6 }}>Notifications</div>
                <select style={input} defaultValue="all">
                  <option value="all">All</option>
                  <option value="important">Important only</option>
                  <option value="none">None</option>
                </select>
              </label>

              <div style={{ color:'#64748b' }}>
                (If you want these to persist, I can wire them to your `/api/users/me` under a `settings` object.)
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

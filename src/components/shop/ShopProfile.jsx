// src/components/shop/ShopProfile.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../TopBar';
import ShopSidebar, { SHOP_COLLAPSED_WIDTH } from './ShopSidebar';
import API_BASE from '../../api';

export default function ShopProfile() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const hasAccess = Boolean(token && role === 'storeowner');

  const [me, setMe] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!hasAccess) return;
    axios
      .get(`${API_BASE}/api/store-owners/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setMe(data))
      .catch((e) => setErr(e.response?.data?.message || 'Failed to load profile'));
  }, [hasAccess, token]);

  if (!hasAccess) return <Navigate to="/" replace />;

  const shell = { maxWidth: 1100, margin:'0 auto', padding:16, paddingLeft: SHOP_COLLAPSED_WIDTH + 16 };
  const card  = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16 };

  return (
    <>
      <TopBar />
      <ShopSidebar />
      <div style={shell}>
        <main>
          <div style={card}>
            <h2 style={{ marginTop:0 }}>Shop Profile</h2>
            {err && <div style={{ color:'crimson', marginBottom:10 }}>{err}</div>}
            {!me ? 'Loading...' : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><strong>Email:</strong> {me.email}</div>
                <div><strong>Name:</strong> {`${me.firstName||''} ${me.lastName||''}`.trim() || '—'}</div>
                <div><strong>Country:</strong> {me.country || '—'}</div>
                <div><strong>Referral Code:</strong> {me.referralCode || '—'}</div>
                <div style={{ gridColumn:'1 / -1' }}>
                  <strong>Social:</strong>{' '}
                  {Object.entries(me.social||{})
                    .map(([k,v])=>v?`${k}:${v}`:null)
                    .filter(Boolean).join(' • ') || '—'}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

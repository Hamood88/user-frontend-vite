// src/components/shop/ShopSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const COLLAPSED_WIDTH = 56;
const EXPANDED_WIDTH  = 280;

function ShopSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const NavItem = ({ to, label }) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setOpen(false)}
        style={{
          display: 'block',
          padding: '10px 12px',
          borderRadius: 10,
          textDecoration: 'none',
          color: active ? '#111' : '#333',
          background: active ? '#eef2ff' : 'transparent',
          fontWeight: active ? 700 : 500
        }}
      >
        {label}
      </Link>
    );
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* collapsed rail */}
      <aside
        style={{
          position: 'fixed', left: 0, top: 0, width: COLLAPSED_WIDTH, height: '100vh',
          borderRight: '1px solid #e5e7eb', background: '#fff', zIndex: 1000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, gap: 8
        }}
      >
        <button
          onClick={() => setOpen(true)}
          style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
          title="Menu"
        >☰</button>
      </aside>

      {/* backdrop */}
      {open && <div onClick={()=>setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.2)', zIndex:1000 }} />}

      {/* drawer */}
      {open && (
        <div style={{
          position:'fixed', left:0, top:0, width:EXPANDED_WIDTH, height:'100vh',
          borderRight:'1px solid #e5e7eb', background:'#fff', zIndex:1001,
          display:'flex', flexDirection:'column', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ padding:16, borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:18 }}>
            Shop Menu
            <button onClick={()=>setOpen(false)} style={{ border:'1px solid #e5e7eb', background:'#fff', borderRadius:8, padding:'6px 10px', cursor:'pointer' }}>✕</button>
          </div>

          <nav style={{ padding:12, display:'grid', gap:6, flex:1, overflowY:'auto' }}>
            <NavItem to="/shop/feed" label="Feed" />
            <NavItem to="/shop/profile" label="Profile" />
            <NavItem to="/shop/sales" label="Sales" />
            <NavItem to="/shop/settings" label="Settings" />
          </nav>

          <div style={{ padding:12, borderTop:'1px solid #e5e7eb' }}>
            <button
              onClick={logout}
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #ef4444', color:'#ef4444', background:'#fff', cursor:'pointer', fontWeight:600 }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ShopSidebar;
export const SHOP_COLLAPSED_WIDTH = COLLAPSED_WIDTH;

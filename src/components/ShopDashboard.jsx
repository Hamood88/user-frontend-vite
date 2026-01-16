// src/components/ShopDashboard.jsx
import React from 'react';

function ShopDashboard({ shop, onLogout }) {
  if (!shop) return <div>Loading shop data...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h2>Welcome, {shop.storeName}!</h2>
      <div>
        Owner: {shop.ownerFirstName} {shop.ownerLastName}
      </div>
      <div>
        Email: {shop.ownerEmail}
      </div>
      <button onClick={onLogout} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 7, background: '#3730a3', color: '#fff', border: 'none', fontWeight: 600 }}>Logout</button>
    </div>
  );
}

export default ShopDashboard;

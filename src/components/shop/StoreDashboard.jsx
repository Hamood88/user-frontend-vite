import React from 'react';

function StoreDashboard({ shop, onLogout }) {
  if (!shop) return <div>Loading shop data...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h2>Welcome, {shop.ownerFirstName}!</h2>
      <p>Store Name: <b>{shop.storeName}</b></p>
      <p>Owner Name: <b>{shop.ownerFirstName} {shop.ownerLastName}</b></p>
      <p>Email: <b>{shop.ownerEmail}</b></p>
      {/* Add more shop features here */}
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default StoreDashboard;

import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://moondala-backend.onrender.com';

function ShopRegister({ onSuccess }) {
  const [form, setForm] = useState({
    storeName: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    password: '',
    inviterReferralCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/shop-early-access/apply`, {
        shopName: form.storeName,
        ownerFirstName: form.ownerFirstName,
        ownerLastName: form.ownerLastName,
        email: form.ownerEmail,
        password: form.password,
        phone: '', // Optional field
        dateOfBirth: '', // Optional field
        country: '', // Optional field
        inviterCode: form.inviterReferralCode || ''
      });
      setSubmitted(true);
      setLoading(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };
// Show success message after submission
  if (submitted) {
    return (
      <div
        style={{
          background: '#fff',
          padding: 40,
          maxWidth: 420,
          margin: '30px auto',
          borderRadius: 12,
          boxShadow: '0 4px 16px #0001',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
        <h2 style={{ 
          fontSize: 28,
          fontWeight: 'bold',
          color: '#178a63',
          marginBottom: 16,
          letterSpacing: 0.5
        }}>
          You're in!
        </h2>
        <p style={{
          fontSize: 16,
          color: '#64748b',
          lineHeight: 1.7,
          marginBottom: 12
        }}>
          The Moondala shop app isn't ready yet.
        </p>
        <p style={{
          fontSize: 16,
          color: '#64748b',
          lineHeight: 1.7,
          fontWeight: 600
        }}>
          We'll notify you as soon as it's live.
        </p>
      </div>
    );
  }

  
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#fff',
        padding: 30,
        maxWidth: 380,
        margin: '30px auto',
        borderRadius: 12,
        boxShadow: '0 4px 16px #0001',
        display: 'flex',
        flexDirection: 'column',
        gap: 17
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: 12 }}>Shop Owner Registration</h2>
      <input
        name="storeName"
        placeholder="Store Name"
        value={form.storeName}
        onChange={handleChange}
        requiredrequired)"
        value={form.inviterReferralCode}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '12px 0',
          background: '#178a63',
          color: '#fff',
          fontWeight: 700,
          borderRadius: 7,
          fontSize: 17,
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Submitting...' : 'Apply for Shop'}
      </button>
      {error && <div style={{ color: '#b20000', textAlign: 'center', marginTop: 8 }}>{error
        placeholder="Owner Email"
        value={form.ownerEmail}
        onChange={handleChange}
        required
        type="email"
        autoComplete="email"
        style={inputStyle}
      />
      <input
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        type="password"
        minLength={6}
        style={inputStyle}
      />
      <input
        name="inviterReferralCode"
        placeholder="Referral Code (optional)"
        value={form.inviterReferralCode}
        onChange={handleChange}
        style={inputStyle}
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '12px 0',
          background: '#3730a3',
          color: '#fff',
          fontWeight: 700,
          borderRadius: 7,
          fontSize: 17,
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Registering...' : 'Register Shop'}
      </button>
      {error && <div style={{ color: '#b20000', textAlign: 'center' }}>{error}</div>}
      {success && <div style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
    </form>
  );
}

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 7,
  border: '1.5px solid #e2e4ee',
  fontSize: 16,
  fontWeight: 500,
  background: '#f8f9ff'
};

export default ShopRegister;

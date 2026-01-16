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
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/shops/register`, form);
      setSuccess('Shop registered! You can now log in.');
      setForm({
        storeName: '',
        ownerFirstName: '',
        ownerLastName: '',
        ownerEmail: '',
        password: '',
        inviterReferralCode: ''
      });
      setLoading(false);
      if (onSuccess) onSuccess(res.data.shop);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

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
        required
        autoComplete="organization"
        style={inputStyle}
      />
      <input
        name="ownerFirstName"
        placeholder="Owner First Name"
        value={form.ownerFirstName}
        onChange={handleChange}
        required
        autoComplete="given-name"
        style={inputStyle}
      />
      <input
        name="ownerLastName"
        placeholder="Owner Last Name"
        value={form.ownerLastName}
        onChange={handleChange}
        required
        autoComplete="family-name"
        style={inputStyle}
      />
      <input
        name="ownerEmail"
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

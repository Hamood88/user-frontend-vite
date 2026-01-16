import React, { useState } from 'react';
import axios from 'axios';

const StoreRegister = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get inviter ref from URL if exists
  const inviterRef =
    new URLSearchParams(window.location.search).get('invitedByUserRef') || '';

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/shop/register', {
        ...form,
        invitedByUserRef: inviterRef,
      });
      setSuccess('Shop registered! You can log in now.');
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register Shop</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Shop Name" required />
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
      {error && <div style={{color:'red'}}>{error}</div>}
      {success && <div style={{color:'green'}}>{success}</div>}
      <button type="submit">Register</button>
    </form>
  );
};

export default StoreRegister;

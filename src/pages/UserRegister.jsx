import React, { useState } from 'react';
import axios from 'axios';

const UserRegister = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    country: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://moondala-backend.onrender.com/api/register', form);
      alert('Registration successful! You can now login.');
      window.location.href = '/login';
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '500px', margin: 'auto' }}>
      <h2>User Registration</h2>
      <form onSubmit={handleRegister}>
        <input name="firstName" placeholder="First Name" required onChange={handleChange} style={inputStyle} />
        <input name="lastName" placeholder="Last Name" required onChange={handleChange} style={inputStyle} />
        <input name="email" type="email" placeholder="Email" required onChange={handleChange} style={inputStyle} />
        <input name="password" type="password" placeholder="Password" required onChange={handleChange} style={inputStyle} />
        <input name="age" type="number" placeholder="Age" required onChange={handleChange} style={inputStyle} />
        <input name="country" placeholder="Country" required onChange={handleChange} style={inputStyle} />

        <button type="submit" style={buttonStyle}>Register</button>
      </form>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  marginBottom: '10px',
  padding: '10px',
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#2ecc71',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

export default UserRegister;

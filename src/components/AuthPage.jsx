import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Dropdown options
const countryList = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Australia", "Egypt", "Jordan", "UAE", "Other"
];
const sportList = [
  "Soccer", "Basketball", "Tennis", "Baseball", "Cricket", "Golf", "Swimming", "Running", "Volleyball", "Other"
];
const interestList = [
  "Music", "Movies", "Books", "Tech", "Travel", "Cooking", "Art", "Gaming", "Fitness", "Other"
];

// User Login/Register
const UserAuth = ({ inviterRef }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    age: '', country: '', favoriteSport: '', interests: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMultiSelect = e => {
    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setForm({ ...form, interests: options });
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('token', res.data.token);
      setSuccess('Login successful!');
      setTimeout(() => navigate('/user/feed'), 400); // USER FEED
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/register', {
        ...form,
        invitedBy: inviterRef,
      });
      setSuccess('Registration successful!');
      setForm({
        firstName: '', lastName: '', email: '', password: '',
        age: '', country: '', favoriteSport: '', interests: []
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button onClick={() => setTab('login')} style={tab === 'login' ? btnActive : btnInactive}>Login</button>
        <button onClick={() => setTab('register')} style={tab === 'register' ? btnActive : btnInactive}>Register</button>
      </div>
      {tab === 'login' ? (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required style={inputStyle} />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required style={inputStyle} />
          <button type="submit" style={mainBtnStyle}>Login</button>
        </form>
      ) : (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required style={inputStyle} />
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required style={inputStyle} />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required style={inputStyle} />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required style={inputStyle} />
          <select name="age" value={form.age} onChange={handleChange} required style={inputStyle}>
            <option value="">Select Age</option>
            {Array.from({ length: 91 }, (_, i) => i + 10).map(age =>
              <option key={age} value={age}>{age}</option>
            )}
          </select>
          <select name="country" value={form.country} onChange={handleChange} required style={inputStyle}>
            <option value="">Select Country</option>
            {countryList.map(country =>
              <option key={country} value={country}>{country}</option>
            )}
          </select>
          <select name="favoriteSport" value={form.favoriteSport} onChange={handleChange} required style={inputStyle}>
            <option value="">Favorite Sport</option>
            {sportList.map(sport =>
              <option key={sport} value={sport}>{sport}</option>
            )}
          </select>
          <select name="interests" value={form.interests} onChange={handleMultiSelect} multiple style={{ ...inputStyle, height: 80 }}>
            {interestList.map(interest =>
              <option key={interest} value={interest}>{interest}</option>
            )}
          </select>
          <button type="submit" style={mainBtnStyle}>Register</button>
        </form>
      )}
      {error && <div style={{ color: '#e84545', marginTop: 12, fontWeight: 500 }}>{error}</div>}
      {success && <div style={{ color: '#118b40', marginTop: 12, fontWeight: 500 }}>{success}</div>}
    </div>
  );
};

// Shop Login/Register
const ShopAuth = ({ inviterRef }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await axios.post('http://localhost:5000/api/shop/login', {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('shopToken', res.data.token);
      setSuccess('Shop login successful!');
      setTimeout(() => navigate('/shop/feed'), 400); // SHOP FEED
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/shop/register', {
        ...form,
        invitedByUserRef: inviterRef,
      });
      setSuccess('Shop registration successful!');
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button onClick={() => setTab('login')} style={tab === 'login' ? shopBtnActive : shopBtnInactive}>Login</button>
        <button onClick={() => setTab('register')} style={tab === 'register' ? shopBtnActive : shopBtnInactive}>Register</button>
      </div>
      {tab === 'login' ? (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Shop Email" required style={inputStyle} />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required style={inputStyle} />
          <button type="submit" style={{ ...mainBtnStyle, background: '#3bb271' }}>Login</button>
        </form>
      ) : (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Shop Name" required style={inputStyle} />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Shop Email" required style={inputStyle} />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required style={inputStyle} />
          <button type="submit" style={{ ...mainBtnStyle, background: '#3bb271' }}>Register</button>
        </form>
      )}
      {error && <div style={{ color: '#e84545', marginTop: 12, fontWeight: 500 }}>{error}</div>}
      {success && <div style={{ color: '#118b40', marginTop: 12, fontWeight: 500 }}>{success}</div>}
    </div>
  );
};

const inputStyle = {
  padding: '12px 14px',
  fontSize: 15,
  border: '1px solid #dbeafe',
  borderRadius: 7,
  outline: 'none',
  background: '#f9fafb'
};
const mainBtnStyle = {
  background: '#4f8cfb',
  color: '#fff',
  fontWeight: 'bold',
  padding: '12px 0',
  border: 'none',
  borderRadius: 7,
  fontSize: 16,
  cursor: 'pointer',
  marginTop: 8
};
const btnActive = {
  flex: 1,
  padding: 12,
  border: 'none',
  borderRadius: 8,
  background: '#4f8cfb',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
  cursor: 'pointer'
};
const btnInactive = {
  flex: 1,
  padding: 12,
  border: 'none',
  borderRadius: 8,
  background: '#e3eaf7',
  color: '#4066a3',
  fontWeight: 'bold',
  fontSize: 16,
  cursor: 'pointer'
};
const shopBtnActive = {
  flex: 1,
  padding: 12,
  border: 'none',
  borderRadius: 8,
  background: '#3bb271',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
  cursor: 'pointer'
};
const shopBtnInactive = {
  flex: 1,
  padding: 12,
  border: 'none',
  borderRadius: 8,
  background: '#e3f6ea',
  color: '#27724a',
  fontWeight: 'bold',
  fontSize: 16,
  cursor: 'pointer'
};

export default function AuthPage() {
  const inviterRef =
    new URLSearchParams(window.location.search).get('invitedByUserRef') || '';
  return (
    <div style={{
      minHeight: '100vh',
      minWidth: '100vw',
      background: 'linear-gradient(135deg,#4f8cfb 0%,#3bb271 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        width: 900,
        maxWidth: '98vw',
        background: '#fff',
        borderRadius: 26,
        boxShadow: '0 8px 32px #3b5aa81a',
        overflow: 'hidden',
        minHeight: 540
      }}>
        <div style={{
          flex: 1,
          padding: 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(120deg,#e9f0fe 70%,#fff 100%)',
          borderRight: '1px solid #e3e8f0'
        }}>
          <h2 style={{ textAlign: 'center', color: '#2257bf', marginBottom: 16, letterSpacing: 1 }}>User</h2>
          <UserAuth inviterRef={inviterRef} />
        </div>
        <div style={{
          flex: 1,
          padding: 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(120deg,#e3f6ea 70%,#fff 100%)',
        }}>
          <h2 style={{ textAlign: 'center', color: '#178a63', marginBottom: 16, letterSpacing: 1 }}>Shop Owner</h2>
          <ShopAuth inviterRef={inviterRef} />
        </div>
      </div>
    </div>
  );
}

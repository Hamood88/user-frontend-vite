import { useState } from "react";
import { apiPost } from "../api";

export function ShopAuthForm({ mode }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [shopName, setShopName] = useState("");
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [inviterCode, setInviterCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiPost("/shop-early-access/apply", {
        shopName,
        ownerFirstName,
        ownerLastName,
        email,
        password,
        phone,
        dateOfBirth,
        country,
        inviterCode: inviterCode.trim().toUpperCase() || undefined
      });
      
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show success message after submission
  if (submitted) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        minHeight: '400px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#22c55e',
          marginBottom: '16px',
          letterSpacing: '0.5px'
        }}>
          You're in!
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          lineHeight: '1.7',
          marginBottom: '12px',
          maxWidth: '400px'
        }}>
          The Moondala shop app isn't ready yet.
        </p>
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          lineHeight: '1.7',
          fontWeight: '600'
        }}>
          We'll notify you as soon as it's live.
        </p>
      </div>
    );
  }

  // Show "Coming Soon" for login mode (no login allowed)
  if (mode === "login") {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        minHeight: '400px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛠️</div>
        <h3 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#22c55e',
          marginBottom: '16px',
          letterSpacing: '0.5px'
        }}>
          Shop Dashboard Coming Soon
        </h3>
        <p style={{
          fontSize: '15px',
          color: '#94a3b8',
          lineHeight: '1.7',
          maxWidth: '380px'
        }}>
          Seller login will be available once the shop app is live.
        </p>
      </div>
    );
  }

  // Show registration form for signup mode
  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxHeight: '500px',
      overflowY: 'auto',
      padding: '4px'
    }}>
      {error && (
        <div style={{
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#fca5a5',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Shop Name *"
        value={shopName}
        onChange={(e) => setShopName(e.target.value)}
        required
        style={inputStyle}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <input
          type="text"
          placeholder="Owner First Name *"
          value={ownerFirstName}
          onChange={(e) => setOwnerFirstName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Owner Last Name *"
          value={ownerLastName}
          onChange={(e) => setOwnerLastName(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      <input
        type="email"
        placeholder="Shop Email *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Password (8+ chars) *"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        style={inputStyle}
      />

      <input
        type="tel"
        placeholder="Phone Number *"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        style={inputStyle}
      />

      <input
        type="date"
        placeholder="Owner Date of Birth *"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        required
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Country *"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        required
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Inviter Code (required) *"
        value={inviterCode}
        onChange={(e) => setInviterCode(e.target.value)}
        required
        style={inputStyle}
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '14px',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          marginTop: '8px'
        }}
      >
        {loading ? "Submitting..." : "Join Waitlist"}
      </button>
    </form>
  );
}

const inputStyle = {
  padding: '12px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default ShopAuthForm;

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiPost } from "../api";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic",
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
  "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
].sort();

export function ShopAuthForm({ mode }) {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [shopName, setShopName] = useState("");
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [inviterCode, setInviterCode] = useState("");

  // Auto-fill inviter code from URL
  useEffect(() => {
    const codeFromUrl = searchParams.get("inviter") || 
                       searchParams.get("code") || 
                       searchParams.get("ref") || "";
    if (codeFromUrl) {
      setInviterCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const dateOfBirth = `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`;
      
      const payload = {
        shopName,
        ownerFirstName,
        ownerLastName,
        email,
        password,
        phone,
        dateOfBirth,
        country,
        inviterCode: inviterCode.trim().toUpperCase()
      };

      console.log("Submitting shop registration:", payload);
      
      await apiPost("/shop-early-access/apply", payload);
      
      setSubmitted(true);
    } catch (err) {
      console.error("Shop registration error:", err);
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
          placeholder="First Name *"
          value={ownerFirstName}
          onChange={(e) => setOwnerFirstName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Last Name *"
          value={ownerLastName}
          onChange={(e) => setOwnerLastName(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      <input
        type="email"
        placeholder="Email *"
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

      <div>
        <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>
          Date of Birth *
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <select
            value={dobDay}
            onChange={(e) => setDobDay(e.target.value)}
            required
            style={selectStyle}
          >
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={dobMonth}
            onChange={(e) => setDobMonth(e.target.value)}
            required
            style={selectStyle}
          >
            <option value="">Month</option>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={dobYear}
            onChange={(e) => setDobYear(e.target.value)}
            required
            style={selectStyle}
          >
            <option value="">Year</option>
            {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        required
        style={selectStyle}
      >
        <option value="">Select Country *</option>
        {COUNTRIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input
        type="tel"
        placeholder="Phone Number *"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Inviter Code *"
        value={inviterCode}
        onChange={(e) => setInviterCode(e.target.value)}
        required
        style={{
          ...inputStyle,
          ...(inviterCode ? { background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' } : {})
        }}
        disabled={!!searchParams.get("inviter")}
      />
      {inviterCode && (
        <span style={{ fontSize: '12px', color: '#22c55e', marginTop: '-8px' }}>
          ✓ Inviter code: {inviterCode}
        </span>
      )}
      {!inviterCode && (
        <span style={{ fontSize: '12px', color: '#fca5a5', marginTop: '-8px' }}>
          Required - Use referral link or enter the code
        </span>
      )}

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

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

export default ShopAuthForm;

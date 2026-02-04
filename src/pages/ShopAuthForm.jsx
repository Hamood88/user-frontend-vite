import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiPost } from "../api";

// Add global styles for select options
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  select option {
    background-color: #1e1e1e;
    color: #fff;
    padding: 8px;
  }
  select option:hover {
    background-color: #22c55e;
    color: #000;
  }
  select option:checked {
    background: linear-gradient(#22c55e, #22c55e);
    background-color: #22c55e !important;
    color: #000 !important;
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('style[data-shop-select]')) {
  styleSheet.setAttribute('data-shop-select', 'true');
  document.head.appendChild(styleSheet);
}

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

export function ShopAuthForm({ mode, onModeChange }) {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
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
      if (mode === "login") {
        // Login existing shop
        const response = await apiPost("/shop/auth/login", {
          shopEmail: email,
          password
        });

        if (response?.token) {
          // Redirect to shop dashboard with token in URL
          // The shop frontend will read the token from URL and store it
          window.location.href = `https://shop-frontend.vercel.app/shop/login?token=${encodeURIComponent(response.token)}`;
        } else {
          throw new Error("Login failed - no token received");
        }
      } else {
        // Register new shop
        const dateOfBirth = `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`;
        
        const payload = {
          shopName,
          ownerFirstName,
          ownerLastName,
          shopEmail: email,
          email,
          password,
          phoneNumber: phone,
          ownerDateOfBirth: dateOfBirth,
          country,
          inviterCode: inviterCode.trim().toUpperCase() || undefined
        };

        console.log("Submitting shop registration:", payload);
        
        const response = await apiPost("/shop/auth/register", payload);
        
        if (response?.token) {
          // Redirect to shop dashboard with token in URL
          // The shop frontend will read the token from URL and store it
          window.location.href = `https://shop-frontend.vercel.app/shop/login?token=${encodeURIComponent(response.token)}`;
        } else {
          setSubmitted(true);
        }
      }
    } catch (err) {
      console.error("Shop auth error:", err);
      setError(err?.message || `${mode === "login" ? "Login" : "Registration"} failed. Please try again.`);
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
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#22c55e',
          marginBottom: '16px',
          letterSpacing: '0.5px'
        }}>
          Shop Created Successfully!
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          lineHeight: '1.7',
          marginBottom: '24px',
          maxWidth: '400px'
        }}>
          Redirecting you to the shop dashboard...
        </p>
      </div>
    );
  }

  // Show login form for login mode
  if (mode === "login") {
    return (
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
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
          type="email"
          placeholder="Shop Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Signing in..." : "Sign In to Shop"}
        </button>
      </form>
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
        placeholder="Inviter Code (optional)"
        value={inviterCode}
        onChange={(e) => setInviterCode(e.target.value)}
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
        {loading ? "Creating Shop..." : "Create Shop"}
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
  colorScheme: 'dark',
  WebkitAppearance: 'none',
  appearance: 'none',
  backgroundColor: 'rgba(30, 30, 30, 0.8)',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/csvg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  backgroundSize: '20px',
  paddingRight: '40px',
};

export default ShopAuthForm;

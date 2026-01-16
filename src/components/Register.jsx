import React, { useMemo, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";
const REGISTER_URL = `${API_BASE}/api/auth/register`;

function calcAgeFromDob(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const sportsList = [
  "Soccer",
  "Basketball",
  "American Football",
  "Baseball",
  "Tennis",
  "Cricket",
  "Rugby",
  "Hockey",
  "Volleyball",
  "Boxing",
  "MMA",
  "Golf",
  "Swimming",
  "Running",
  "Cycling",
  "Wrestling",
  "Formula 1",
];

const interestsList = [
  "Technology",
  "Fashion",
  "Beauty",
  "Fitness",
  "Sports",
  "Gaming",
  "Music",
  "Movies",
  "Travel",
  "Food",
  "Cars",
  "Home & Decor",
  "Pets",
  "Books",
  "Business",
  "Photography",
];

const countryList = [
  "United States",
  "Canada",
  "United Kingdom",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Turkey",
  "Saudi Arabia",
  "United Arab Emirates",
  "Egypt",
  "Morocco",
  "Algeria",
  "Tunisia",
  "Iraq",
  "Jordan",
  "Lebanon",
  "Syria",
  "Palestine",
  "Yemen",
  "Oman",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "India",
  "Pakistan",
  "Bangladesh",
  "China",
  "Japan",
  "South Korea",
  "Vietnam",
  "Philippines",
  "Australia",
  "New Zealand",
  "Brazil",
  "Argentina",
  "Mexico",
  "South Africa",
];

const Register = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "", // ✅ FIX: backend expects dateOfBirth
    phoneNumber: "", // ✅ NEW REQUIRED
    country: "",
    favoriteSport: "",
    interests: [],
    email: "",
    password: "",

    invitedByCode: "", // ✅ FIX: works with your backend referral logic
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const computedAge = useMemo(() => calcAgeFromDob(form.dateOfBirth), [form.dateOfBirth]);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const toggleInterest = (interest) => {
    setForm((p) => {
      const exists = p.interests.includes(interest);
      return {
        ...p,
        interests: exists ? p.interests.filter((x) => x !== interest) : [...p.interests, interest],
      };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // ✅ front-end required checks (to match backend)
    if (!form.firstName.trim()) return setMsg("First name is required.");
    if (!form.lastName.trim()) return setMsg("Last name is required.");
    if (!form.email.trim()) return setMsg("Email is required.");
    if (!form.password.trim()) return setMsg("Password is required.");
    if (!form.phoneNumber.trim()) return setMsg("Phone number is required.");
    if (!form.country.trim()) return setMsg("Country is required.");
    if (!form.gender.trim()) return setMsg("Gender is required.");
    if (!form.dateOfBirth) return setMsg("Date of birth is required.");
    if (!form.favoriteSport.trim()) return setMsg("Favorite sport is required.");
    if (!Array.isArray(form.interests) || form.interests.length < 1) {
      return setMsg("Please select at least 1 interest.");
    }

    // ✅ keep your age rule (10+)
    const age = computedAge;
    if (!age || age < 10) {
      setMsg("Please enter a valid Date of Birth (age must be 10+).");
      return;
    }

    setLoading(true);
    try {
      // ✅ payload matches backend fields exactly
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,

        phoneNumber: form.phoneNumber.trim(),
        country: form.country,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth, // ✅ yyyy-mm-dd from <input type="date">

        favoriteSport: form.favoriteSport,
        interests: form.interests,

        // ✅ referral code support (backend reads invitedByCode || referralCode || inviterCode)
        invitedByCode: form.invitedByCode.trim(),
      };

      await axios.post(REGISTER_URL, payload);

      setMsg("✅ Registered successfully. Now you can login.");
      setLoading(false);

      // Optional: redirect to login
      // window.location.href = "/login";
    } catch (err) {
      setLoading(false);
      setMsg(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <div style={styles.row}>
        <input
          style={styles.input}
          name="firstName"
          placeholder="First name"
          value={form.firstName}
          onChange={onChange}
          required
        />
        <input
          style={styles.input}
          name="lastName"
          placeholder="Last name"
          value={form.lastName}
          onChange={onChange}
          required
        />
      </div>

      <div style={styles.row}>
        <select style={styles.input} name="gender" value={form.gender} onChange={onChange} required>
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input
          style={styles.input}
          type="date"
          name="dateOfBirth"   // ✅ FIX
          value={form.dateOfBirth}
          onChange={onChange}
          required
        />
      </div>

      <div style={styles.helper}>
        {computedAge ? `Age: ${computedAge}` : "Pick your date of birth to calculate age"}
      </div>

      {/* ✅ NEW: Phone Number + Country */}
      <div style={styles.row}>
        <input
          style={styles.input}
          name="phoneNumber"
          placeholder="Phone number"
          value={form.phoneNumber}
          onChange={onChange}
          required
        />

        <select style={styles.input} name="country" value={form.country} onChange={onChange} required>
          <option value="">Country</option>
          {countryList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.row}>
        <select
          style={styles.input}
          name="favoriteSport"
          value={form.favoriteSport}
          onChange={onChange}
          required
        >
          <option value="">Favorite sport</option>
          {sportsList.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.interestsBox}>
        <div style={styles.label}>Interests (choose multiple) *</div>
        <div style={styles.pills}>
          {interestsList.map((interest) => {
            const active = form.interests.includes(interest);
            return (
              <button
                type="button"
                key={interest}
                onClick={() => toggleInterest(interest)}
                style={active ? styles.pillActive : styles.pill}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      <input
        style={styles.input}
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={onChange}
        required
      />

      <input
        style={styles.input}
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={onChange}
        required
      />

      <input
        style={styles.input}
        name="invitedByCode"
        placeholder="Referral code (optional)"
        value={form.invitedByCode}
        onChange={onChange}
      />

      {msg ? (
        <div style={{ marginTop: 8, color: msg.startsWith("✅") ? "green" : "red" }}>
          {msg}
        </div>
      ) : null}

      <button disabled={loading} style={styles.submit} type="submit">
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
};

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 520,
  },
  row: {
    display: "flex",
    gap: 10,
  },
  input: {
    flex: 1,
    padding: "12px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
  },
  helper: {
    marginTop: -6,
    fontSize: 12,
    color: "#666",
  },
  interestsBox: {
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
  },
  label: {
    fontSize: 13,
    marginBottom: 10,
    color: "#444",
  },
  pills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
  },
  pillActive: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
  },
  submit: {
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: 15,
  },
};

export default Register;

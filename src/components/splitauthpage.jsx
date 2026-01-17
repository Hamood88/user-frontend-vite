import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, setUserSession } from "../api";

export default function SplitAuthPage() {
  const navigate = useNavigate();

  // ---------------- USER ----------------
  const [userMode, setUserMode] = useState("login"); // "login" | "register"
  const [userMsg, setUserMsg] = useState("");

  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",

    // ✅ Referral code (optional) - send as invitedByCode
    invitedByCode: "",

    // ✅ REQUIRED fields for Mall targeting + profile
    dateOfBirth: "", // YYYY-MM-DD (from <input type="date">)
    gender: "",
    country: "",
    phoneNumber: "", // ✅ NEW REQUIRED
    favoriteSport: "",
    interests: [],
  });

  // ---------------- STORE ----------------
  const [storeMode, setStoreMode] = useState("login");
  const [storeMsg, setStoreMsg] = useState("");
  const [storeForm, setStoreForm] = useState({
    storeName: "",
    email: "",
    password: "",
  });

  // --------- Options (dropdowns) ----------
  const genderOptions = ["male", "female", "other"];

  const countryOptions = [
    "United States",
    "Canada",
    "Mexico",
    "United Kingdom",
    "France",
    "Germany",
    "Spain",
    "Italy",
    "Netherlands",
    "Sweden",
    "Norway",
    "Denmark",
    "Ireland",
    "Turkey",
    "Saudi Arabia",
    "United Arab Emirates",
    "Qatar",
    "Kuwait",
    "Jordan",
    "Lebanon",
    "Egypt",
    "Morocco",
    "Algeria",
    "Tunisia",
    "Nigeria",
    "South Africa",
    "India",
    "Pakistan",
    "Bangladesh",
    "China",
    "Japan",
    "South Korea",
    "Philippines",
    "Indonesia",
    "Australia",
    "New Zealand",
    "Brazil",
    "Argentina",
    "Colombia",
  ];

  const sportOptions = [
    "Soccer",
    "Basketball",
    "American Football",
    "Baseball",
    "Tennis",
    "Boxing",
    "MMA",
    "Hockey",
    "Cricket",
    "Rugby",
    "Golf",
    "Swimming",
    "Running",
    "Cycling",
    "Wrestling",
  ];

  const interestOptions = [
    "Technology",
    "Gaming",
    "Fitness",
    "Sports",
    "Fashion",
    "Beauty",
    "Travel",
    "Cars",
    "Food",
    "Music",
    "Movies",
    "Photography",
    "Books",
    "Business",
    "Investing",
    "Home & Decor",
    "Pets",
    "Outdoors",
  ];

  // --------- Helpers ----------
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (Number.isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const userAge = useMemo(() => calculateAge(userForm.dateOfBirth), [userForm.dateOfBirth]);

  // --------- Handlers ----------
  const onUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest) => {
    setUserForm((prev) => {
      const has = prev.interests.includes(interest);
      return {
        ...prev,
        interests: has
          ? prev.interests.filter((x) => x !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const onStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveAuthToLocalStorage = (res) => {
    // ✅ Prefer userToken (your newer convention), but keep token for backward compatibility
    if (res?.data?.token) {
      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("token", res.data.token);
    }
    if (res?.data?.user) localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("role", "user");
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserMsg("");

    try {
      // -------- LOGIN --------
      if (userMode === "login") {
        const data = await apiPost("/auth/login", {
          email: userForm.email,
          password: userForm.password,
        });

        // persist session using shared helper
        setUserSession({ token: data.token, user: data.user });

        setUserMsg("✅ User login success!");
        navigate("/feed");
        return;
      }

      // -------- REGISTER (REQUIRED VALIDATION) --------
      if (!userForm.firstName.trim() || !userForm.lastName.trim()) {
        setUserMsg("❌ Please enter first and last name");
        return;
      }
      if (!userForm.dateOfBirth) {
        setUserMsg("❌ Please select your date of birth");
        return;
      }
      if (userAge === null) {
        setUserMsg("❌ Invalid date of birth");
        return;
      }
      if (userAge < 10) {
        setUserMsg("❌ You must be at least 10 years old");
        return;
      }
      if (!userForm.gender) {
        setUserMsg("❌ Please select your gender");
        return;
      }
      if (!userForm.phoneNumber.trim()) {
        setUserMsg("❌ Please enter your phone number");
        return;
      }
      if (!userForm.country) {
        setUserMsg("❌ Please select your country");
        return;
      }
      if (!userForm.favoriteSport) {
        setUserMsg("❌ Please select your favorite sport");
        return;
      }
      if (!Array.isArray(userForm.interests) || userForm.interests.length === 0) {
        setUserMsg("❌ Please select at least 1 interest");
        return;
      }

      const payload = {
        firstName: userForm.firstName.trim(),
        lastName: userForm.lastName.trim(),
        email: userForm.email.trim(),
        password: userForm.password,

        // ✅ referral code field that backend checks first
        invitedByCode: (userForm.invitedByCode || "").trim(),

        // ✅ FIX: backend expects dateOfBirth (not dob)
        dateOfBirth: userForm.dateOfBirth,

        gender: userForm.gender,
        phoneNumber: userForm.phoneNumber.trim(),
        country: userForm.country,

        favoriteSport: userForm.favoriteSport,
        interests: userForm.interests,
      };

      const data = await apiPost("/auth/register", payload);

      setUserSession({ token: data.token, user: data.user });

      setUserMsg("✅ User registered successfully!");
      navigate("/feed");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Something went wrong";
      setUserMsg("❌ " + msg);
    }
  };

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    setStoreMsg("");
    setStoreMsg("ℹ️ Store login/register not wired yet. We can connect store routes next.");
  };

  // --------- Styles ----------
  const wrap = {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  };

  const half = {
    flex: 1,
    padding: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRight: "1px solid #eee",
  };

  const halfRight = { ...half, borderRight: "none" };

  const card = {
    width: "100%",
    maxWidth: 520,
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    background: "white",
  };

  const tabs = { display: "flex", gap: 10, marginBottom: 16 };

  const tabBtn = (active) => ({
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    cursor: "pointer",
    background: active ? "#f3f3f3" : "white",
    fontWeight: active ? "700" : "500",
  });

  const input = {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
  };

  const btn = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    background: "black",
    color: "white",
    fontWeight: 700,
    marginTop: 6,
  };

  const interestBox = {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    maxHeight: 160,
    overflowY: "auto",
  };

  const interestRow = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 0",
  };

  return (
    <div style={wrap}>
      {/* LEFT: USER */}
      <section style={half}>
        <div style={card}>
          <h2 style={{ marginTop: 0 }}>User</h2>

          <div style={tabs}>
            <button
              type="button"
              style={tabBtn(userMode === "login")}
              onClick={() => setUserMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              style={tabBtn(userMode === "register")}
              onClick={() => setUserMode("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleUserSubmit}>
            {userMode === "register" && (
              <>
                <input
                  style={input}
                  name="firstName"
                  placeholder="First name"
                  value={userForm.firstName}
                  onChange={onUserChange}
                  required
                />
                <input
                  style={input}
                  name="lastName"
                  placeholder="Last name"
                  value={userForm.lastName}
                  onChange={onUserChange}
                  required
                />

                <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
                  Date of Birth
                </label>
                <input
                  style={input}
                  type="date"
                  name="dateOfBirth"   // ✅ FIX
                  value={userForm.dateOfBirth}
                  onChange={onUserChange}
                  required
                />

                <div style={{ marginBottom: 10, fontSize: 14 }}>
                  <b>Calculated Age:</b> {userAge === null ? "—" : `${userAge} years`}
                </div>

                <select
                  style={input}
                  name="gender"
                  value={userForm.gender}
                  onChange={onUserChange}
                  required
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                {/* ✅ NEW REQUIRED: Phone Number */}
                <input
                  style={input}
                  name="phoneNumber"
                  placeholder="Phone number"
                  value={userForm.phoneNumber}
                  onChange={onUserChange}
                  required
                />

                <select
                  style={input}
                  name="country"
                  value={userForm.country}
                  onChange={onUserChange}
                  required
                >
                  <option value="">Select country</option>
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  style={input}
                  name="favoriteSport"
                  value={userForm.favoriteSport}
                  onChange={onUserChange}
                  required
                >
                  <option value="">Select favorite sport</option>
                  {sportOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <div style={{ marginBottom: 6, fontWeight: 700 }}>Interests</div>
                <div style={interestBox}>
                  {interestOptions.map((interest) => (
                    <label key={interest} style={interestRow}>
                      <input
                        type="checkbox"
                        checked={userForm.interests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                      />
                      <span>{interest}</span>
                    </label>
                  ))}
                </div>

                <input
                  style={input}
                  name="invitedByCode" // ✅ FIX
                  placeholder="Referral code (optional)"
                  value={userForm.invitedByCode}
                  onChange={onUserChange}
                />
              </>
            )}

            <input
              style={input}
              name="email"
              placeholder="Email"
              value={userForm.email}
              onChange={onUserChange}
              required
            />

            <input
              style={input}
              name="password"
              placeholder="Password"
              type="password"
              value={userForm.password}
              onChange={onUserChange}
              required
            />

            <button style={btn} type="submit">
              {userMode === "login" ? "Login" : "Register"}
            </button>
          </form>

          {userMsg && <div style={{ marginTop: 12, fontSize: 14 }}>{userMsg}</div>}
        </div>
      </section>

      {/* RIGHT: STORE */}
      <section style={halfRight}>
        <div style={card}>
          <h2 style={{ marginTop: 0 }}>Store</h2>

          <div style={tabs}>
            <button
              type="button"
              style={tabBtn(storeMode === "login")}
              onClick={() => setStoreMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              style={tabBtn(storeMode === "register")}
              onClick={() => setStoreMode("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleStoreSubmit}>
            {storeMode === "register" && (
              <input
                style={input}
                name="storeName"
                placeholder="Store name"
                value={storeForm.storeName}
                onChange={onStoreChange}
                required
              />
            )}

            <input
              style={input}
              name="email"
              placeholder="Store email"
              value={storeForm.email}
              onChange={onStoreChange}
              required
            />

            <input
              style={input}
              name="password"
              placeholder="Password"
              type="password"
              value={storeForm.password}
              onChange={onStoreChange}
              required
            />

            <button style={btn} type="submit">
              {storeMode === "login" ? "Login" : "Register"}
            </button>
          </form>

          {storeMsg && <div style={{ marginTop: 12, fontSize: 14 }}>{storeMsg}</div>}
        </div>
      </section>
    </div>
  );
}

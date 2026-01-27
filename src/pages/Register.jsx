// user-frontend/src/pages/Register.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE, userRegister, clearUserSession } from "../api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function calcAgeFromDob(dobString) {
  if (!dobString) return null;
  const d = new Date(dobString);
  if (Number.isNaN(d.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export default function Register() {
  const navigate = useNavigate();
  const query = useQuery();

  // ✅ Pull inviter code from URL (support multiple param names)
  const inviterFromUrl =
    (query.get("ref") ||
      query.get("invitedBy") ||
      query.get("code") ||
      query.get("referral") ||
      "")?.trim();

  // ✅ If there is a code in the URL, lock it forever (not removable)
  const lockInviter = !!inviterFromUrl;

  const COUNTRIES = [
    "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan",
    "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
    "Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Cote d'Ivoire","Croatia","Cuba","Cyprus","Czechia",
    "Denmark","Djibouti","Dominica","Dominican Republic",
    "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
    "Fiji","Finland","France",
    "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
    "Haiti","Honduras","Hungary",
    "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
    "Jamaica","Japan","Jordan",
    "Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan",
    "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
    "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
    "Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
    "Oman",
    "Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
    "Romania","Russia","Rwanda",
    "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
    "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
    "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
    "Vanuatu","Vatican City","Venezuela","Vietnam",
    "Yemen",
    "Zambia","Zimbabwe"
  ];

  const sports = [
    "Soccer","Basketball","American Football","Baseball","Tennis","Cricket","Rugby","Hockey","Volleyball","Boxing","MMA","Golf","Swimming","Running","Cycling","Wrestling","Formula 1",
  ];

  const interestOptions = ["Tech","Fashion","Fitness","Gaming","Food","Travel","Beauty","Cars"];

  // ✅ Industries list + dependent categories
  const [industries, setIndustries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [industryLoading, setIndustryLoading] = useState(false);
  const [industryError, setIndustryError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",

    phoneNumber: "", // ✅ REQUIRED
    country: "", // ✅ REQUIRED
    gender: "", // ✅ REQUIRED
    dateOfBirth: "", // ✅ REQUIRED

    favoriteSport: "", // ✅ REQUIRED
    interests: [], // ✅ REQUIRED (at least 1)

    // ✅ NEW: Industry + Category (dropdown)
    industryId: "",
    categoryId: "",

    invitedByCode: inviterFromUrl || "",
  });

  const age = useMemo(() => calcAgeFromDob(form.dateOfBirth), [form.dateOfBirth]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    // ✅ If user lands with a referral URL, force it into state (locked)
    if (inviterFromUrl) {
      setForm((prev) => ({ ...prev, invitedByCode: inviterFromUrl }));
    }
  }, [inviterFromUrl]);

  // ✅ Load industries from backend
  useEffect(() => {
    (async () => {
      setIndustryError("");
      setIndustryLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/public/industries`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || "Failed to load industries");
        }

        const list = Array.isArray(data?.industries) ? data.industries : [];
        setIndustries(list);
      } catch (e) {
        console.error("Load industries failed:", e);
        setIndustryError(e?.message || "Failed to load industries");
        setIndustries([]);
      } finally {
        setIndustryLoading(false);
      }
    })();
  }, []);

  // ✅ When industry changes, update categories list + reset category if invalid
  useEffect(() => {
    const ind = industries.find((x) => x?.industryId === form.industryId);
    const cats = Array.isArray(ind?.categories) ? ind.categories : [];
    setCategories(cats);

    setForm((prev) => {
      // if selected category is not part of this industry, reset it
      const stillValid = cats.some((c) => c?.categoryId === prev.categoryId);
      return stillValid ? prev : { ...prev, categoryId: "" };
    });
  }, [form.industryId, industries]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest) => {
    setForm((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((x) => x !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ clear any previous sessions (prevents “take over” feeling)
      clearUserSession();

      // ✅ clear shop session (avoid cross-role conflicts)
      localStorage.removeItem("shopToken");
      localStorage.removeItem("shopOwner");
      localStorage.removeItem("storeToken");
      localStorage.removeItem("storeToken");
      localStorage.removeItem("store");
      localStorage.removeItem("shop");
      localStorage.removeItem("shopId");
      localStorage.removeItem("shopEmail");
      localStorage.removeItem("mode");

      // ✅ clear admin session
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");

      // ✅ clear legacy token key from older builds
      localStorage.removeItem("token");

      // ✅ Validate terms agreement
      if (!agreedToTerms) {
        throw new Error("You must agree to the Terms of Service, Privacy Policy, and Referral Policy to create an account.");
      }

      // ✅ URL inviter code ALWAYS wins
      const invitedByCodeToSend = lockInviter
        ? inviterFromUrl
        : (form.invitedByCode || "").trim();

      // ✅ frontend validations
      if (!form.firstName.trim()) throw new Error("First name is required.");
      if (!form.lastName.trim()) throw new Error("Last name is required.");
      if (!form.email.trim()) throw new Error("Email is required.");
      if (!form.password) throw new Error("Password is required.");

      if (!form.phoneNumber.trim()) throw new Error("Phone number is required.");
      if (!form.country) throw new Error("Country is required.");
      if (!form.gender) throw new Error("Gender is required.");
      if (!form.dateOfBirth) throw new Error("Date of birth is required.");

      if (age === null) throw new Error("Invalid date of birth.");
      if (age < 10) throw new Error("You must be at least 10 years old.");

      if (!form.favoriteSport) throw new Error("Favorite sport is required.");
      if (!Array.isArray(form.interests) || form.interests.length < 1) {
        throw new Error("Please select at least 1 interest.");
      }

      // ✅ Industry required, Category OPTIONAL ✅
      if (!form.industryId) throw new Error("Please select an industry.");

      // ✅ Get labels (optional, but nice for UI)
      const ind = industries.find((x) => x?.industryId === form.industryId);
      const industryLabel = ind?.name || "";
      const cat = (ind?.categories || []).find(
        (c) => c?.categoryId === form.categoryId
      );
      const categoryLabel = cat?.label || "";

      // ✅ Use unified API helper (stores token+user in the same place)
      const data = await userRegister({
        email: form.email.trim().toLowerCase(),
        password: form.password,

        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),

        phoneNumber: form.phoneNumber.trim(),
        country: form.country,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth, // YYYY-MM-DD

        favoriteSport: form.favoriteSport,
        interests: form.interests,

        // ✅ NEW: store preferences
        industryId: form.industryId || undefined,
        categoryId: form.categoryId || undefined, // can be empty
        industryLabel: industryLabel || undefined,
        categoryLabel: categoryLabel || undefined,

        // ✅ IMPORTANT: send invitedByCode (backend will save real inviter.referralCode)
        invitedByCode: invitedByCodeToSend || undefined,
      });

      // ✅ store referralCode for dashboard display (optional)
      const myCode = data?.user?.referralCode || data?.referralCode || "";
      if (myCode) {
        localStorage.setItem("referralCode", myCode);
        localStorage.setItem("myReferralCode", myCode);
        localStorage.setItem("userReferralCode", myCode);
      }

      // ✅ store role
      localStorage.setItem("role", "user");

      // ✅ Go to feed
      navigate("/feed", { replace: true });
    } catch (err) {
      console.error(err);

      const msg =
        err?.data?.message ||
        err?.data?.error ||
        err?.message ||
        `Network error. Check backend (${API_BASE}) is running.`;

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 20 }}>
      <h2 style={{ marginBottom: 6 }}>Create Account</h2>

      {/* ✅ Show inviter code if present (LOCKED) */}
      {lockInviter ? (
        <div
          style={{
            marginBottom: 14,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#eef9ff",
            border: "1px solid #cbe9ff",
            fontSize: 14,
          }}
        >
          You were invited with code: <b>{inviterFromUrl}</b>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
            This code is attached to your invite link and cannot be changed.
          </div>
        </div>
      ) : null}

      {industryError ? (
        <div
          style={{
            marginBottom: 14,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#fff7e6",
            border: "1px solid #ffd59e",
            color: "#7a4b00",
            fontSize: 14,
          }}
        >
          {industryError}
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
            (Industries endpoint: {API_BASE}/api/public/industries)
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            marginBottom: 14,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#ffecec",
            border: "1px solid #ffbaba",
            color: "#b00020",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          required
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          required
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input
            name="firstName"
            placeholder="First name"
            value={form.firstName}
            onChange={onChange}
            required
            style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <input
            name="lastName"
            placeholder="Last name"
            value={form.lastName}
            onChange={onChange}
            required
            style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </div>

        {/* ✅ REQUIRED phone */}
        <input
          name="phoneNumber"
          placeholder="Phone number"
          value={form.phoneNumber}
          onChange={onChange}
          required
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <select
            name="gender"
            value={form.gender}
            onChange={onChange}
            required
            style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={onChange}
            required
            style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Age: {age === null ? "—" : age}
        </div>

        {/* ✅ Country dropdown */}
        <select
          name="country"
          value={form.country}
          onChange={onChange}
          required
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
        >
          <option value="">Select country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* ✅ REQUIRED sport */}
        <select
          name="favoriteSport"
          value={form.favoriteSport}
          onChange={onChange}
          required
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
        >
          <option value="">Favorite sport</option>
          {sports.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* ✅ Industry dropdown */}
        <select
          name="industryId"
          value={form.industryId}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              industryId: e.target.value,
              categoryId: "",
            }))
          }
          required
          disabled={industryLoading}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
        >
          <option value="">
            {industryLoading ? "Loading industries..." : "Select industry"}
          </option>
          {industries.map((i) => (
            <option key={i.industryId} value={i.industryId}>
              {i.name}
            </option>
          ))}
        </select>

        {/* ✅ Category dropdown (OPTIONAL now) */}
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={onChange}
          disabled={!form.industryId} // ✅ only disabled until industry chosen
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
        >
          {!form.industryId ? (
            <option value="">Pick industry first</option>
          ) : categories.length === 0 ? (
            <option value="">No categories (optional)</option>
          ) : (
            <option value="">Select category (optional)</option>
          )}

          {categories.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>
              {c.label}
            </option>
          ))}
        </select>

        {/* ✅ REQUIRED interests */}
        <div style={{ marginTop: 6 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Interests (required)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {interestOptions.map((opt) => {
              const active = form.interests.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleInterest(opt)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 999,
                    border: active ? "1px solid #1f6feb" : "1px solid #ddd",
                    background: active ? "#eaf2ff" : "white",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* ✅ Who invited you (referral code) */}
        <div>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>
            Who invited you? (Referral Code)
          </label>
          <input
            name="invitedByCode"
            placeholder="Enter referral code (optional)"
            value={form.invitedByCode}
            onChange={onChange}
            disabled={lockInviter} // Lock if from URL
            style={{
              padding: 12,
              borderRadius: 8,
              border: lockInviter ? "1px solid #cbe9ff" : "1px solid #ddd",
              background: lockInviter ? "#f8f9fa" : "white",
              width: "100%",
              fontStyle: lockInviter ? "italic" : "normal",
            }}
          />
          {lockInviter && (
            <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
              This referral code was attached to your invite link and cannot be changed.
            </div>
          )}
        </div>

        {/* ✅ Terms of Service Agreement */}
        <div style={{ 
          marginTop: 16, 
          padding: "16px", 
          borderRadius: 8, 
          border: "1px solid #ddd",
          background: "#f8f9fa",
          position: "relative",
          zIndex: 10
        }}>
          <label style={{ 
            display: "flex", 
            alignItems: "flex-start", 
            cursor: "pointer",
            gap: 10,
            position: "relative",
            zIndex: 10
          }}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ 
                marginTop: 4,
                width: 18,
                height: 18,
                cursor: "pointer",
                position: "relative",
                zIndex: 10,
                flexShrink: 0
              }}
            />
            <span style={{ fontSize: 14, lineHeight: 1.5, position: "relative", zIndex: 10 }}>
              I AGREE TO MOONDALA'S{" "}
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "#7c3aed", textDecoration: "underline", position: "relative", zIndex: 10 }}
              >
                TERMS OF SERVICE
              </a>
              ,{" "}
              <a 
                href="/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "#7c3aed", textDecoration: "underline", position: "relative", zIndex: 10 }}
              >
                PRIVACY POLICY
              </a>
              , AND{" "}
              <a 
                href="/referral-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "#7c3aed", textDecoration: "underline", position: "relative", zIndex: 10 }}
              >
                REFERRAL POLICY
              </a>
              .
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !agreedToTerms}
          style={{
            marginTop: 10,
            padding: "12px 14px",
            borderRadius: 10,
            border: "none",
            background: (loading || !agreedToTerms) ? "#999" : "#7c3aed",
            color: "white",
            fontWeight: 800,
            cursor: (loading || !agreedToTerms) ? "not-allowed" : "pointer",
            opacity: (loading || !agreedToTerms) ? 0.6 : 1,
            position: "relative",
            zIndex: 10,
            width: "100%"
          }}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <div style={{ marginTop: 8, fontSize: 14, position: "relative", zIndex: 10 }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}

// user-frontend-vite/src/pages/SplitAuthPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User as UserIcon,
  Store as StoreIcon,
  ShoppingBag,
  Users,
  Shield,
  Target,
  BarChart3,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";

// ✅ USER helpers
import { API_BASE, userLogin, userRegister, setUserSession } from "../api.jsx";

import "../styles/splitAuthPage.css";

// ✅ IMPORTANT: Vite-safe import (works when file is in src/assets)
import logoImage from "../assets/moondala-logo.png";

/* =========================
   Helpers
   ========================= */
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

/* =========================
   ✅ SHOP helpers (robust, local)
   - uses /api/shop/auth/* (and aliases)
   ========================= */
function safePickShopToken(data) {
  return (
    data?.token ||
    data?.shopToken ||
    data?.accessToken ||
    data?.jwt ||
    data?.data?.token ||
    data?.data?.shopToken ||
    data?.data?.accessToken ||
    ""
  );
}
function safePickShop(data) {
  return data?.shop || data?.me || data?.data?.shop || data?.data?.me || null;
}
async function safeJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function normalizeBase(u) {
  const s = String(u || "").trim();
  if (!s) return "http://localhost:5000";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}
function dedupeApi(url) {
  return String(url || "").replace(/\/api\/api(\/|$)/, "/api$1");
}

async function shopRequest(path, opts = {}) {
  const base = normalizeBase(API_BASE);
  const p = String(path || "");
  const url = dedupeApi(`${base}${p.startsWith("/") ? "" : "/"}${p}`);

  const res = await fetch(url, {
    ...opts,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const err = new Error(data?.message || data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    err.url = url;
    throw err;
  }

  return data;
}

async function tryMany(calls) {
  let lastErr = null;
  for (const fn of calls) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      // continue ONLY when route not found
      if (e?.status && e.status !== 404) throw e;
    }
  }
  throw lastErr || new Error("All endpoints failed");
}

/* =========================
   ✅ Clear sessions to avoid collisions
   ========================= */
function clearAllSessions() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("shopToken");
  localStorage.removeItem("shop");
  localStorage.removeItem("shopId");
  localStorage.removeItem("shopEmail");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("admin");
  localStorage.removeItem("mode");
  localStorage.removeItem("role");
}

/* =========================
   ✅ Benefits for each side
   ========================= */
const userBenefits = [
  { Icon: ShoppingBag, title: "Shop Smart", desc: "Curated products from trusted sellers" },
  { Icon: Users, title: "Earn Together", desc: "Rewards when your friends shop" },
  { Icon: Shield, title: "Community Trust", desc: "Built on transparency" },
];

const shopBenefits = [
  { Icon: Target, title: "Reach Targeted Buyers", desc: "Connect with ideal customers" },
  { Icon: BarChart3, title: "Track Orders & Earnings", desc: "Real-time business insights" },
  { Icon: TrendingUp, title: "Grow With Referrals", desc: "Community-driven expansion" },
];

export default function SplitAuthPage() {
  const navigate = useNavigate();
  const loc = useLocation();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const isRegister = mode === "register";

  const [activeSide, setActiveSide] = useState("user"); // "user" | "shop"

  // USER fields
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uFirstName, setUFirstName] = useState("");
  const [uLastName, setULastName] = useState("");
  const [uPhoneNumber, setUPhoneNumber] = useState("");
  const [uCountry, setUCountry] = useState("");
  const [uGender, setUGender] = useState("");
  const [uDateOfBirth, setUDateOfBirth] = useState("");
  const [uFavoriteSport, setUFavoriteSport] = useState("");
  const [uInterests, setUInterests] = useState([]);
  const [uInvitedByCode, setUInvitedByCode] = useState("");

  // SHOP fields
  const [sEmail, setSEmail] = useState("");
  const [sPassword, setSPassword] = useState("");
  const [sName, setSName] = useState("");

  const [uLoading, setULoading] = useState(false);
  const [sLoading, setSLoading] = useState(false);

  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  // Password visibility toggles
  const [showUPassword, setShowUPassword] = useState(false);
  const [showSPassword, setShowSPassword] = useState(false);

  const userAge = useMemo(() => calcAgeFromDob(uDateOfBirth), [uDateOfBirth]);

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
    "South Africa",
    "India",
    "Pakistan",
    "Bangladesh",
    "China",
    "Japan",
    "South Korea",
    "Australia",
    "Brazil",
    "Argentina",
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

  function clearMessages() {
    setErr("");
    setOkMsg("");
  }

  function toggleInterest(interest) {
    setUInterests((prev) => {
      const has = prev.includes(interest);
      return has ? prev.filter((x) => x !== interest) : [...prev, interest];
    });
  }

  const anyLoading = uLoading || sLoading;

  /* =========================
     ✅ URL -> state sync
     /?mode=login|register&side=user|shop
     ========================= */
  useEffect(() => {
    const sp = new URLSearchParams(loc.search);
    const m = sp.get("mode");
    const side = sp.get("side");

    if (m === "login" || m === "register") setMode(m);
    if (side === "user" || side === "shop") setActiveSide(side);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.search]);

  function setModeAndUrl(nextMode) {
    clearMessages();
    setMode(nextMode);

    const sp = new URLSearchParams(loc.search);
    sp.set("mode", nextMode);
    sp.set("side", activeSide);
    navigate({ pathname: "/", search: `?${sp.toString()}` }, { replace: true });
  }

  function setSideAndUrl(nextSide) {
    setActiveSide(nextSide);

    const sp = new URLSearchParams(loc.search);
    sp.set("mode", mode);
    sp.set("side", nextSide);
    navigate({ pathname: "/", search: `?${sp.toString()}` }, { replace: true });
  }

  // USER submit
  async function userSubmit(e) {
    e.preventDefault();
    clearMessages();
    setULoading(true);

    try {
      clearAllSessions();

      if (!isRegister) {
        const data = await userLogin({
          email: uEmail.trim(),
          password: uPassword,
        });

        const token = data?.token || data?.userToken || data?.accessToken || "";
        const user = data?.user || data?.data?.user || null;
        if (token && user) setUserSession({ token, user });

        setOkMsg("User logged in");
        navigate("/dashboard", { replace: true });
        return;
      }

      if (!uFirstName.trim() || !uLastName.trim())
        throw new Error("First name and last name are required.");
      if (!uEmail.trim() || !uPassword)
        throw new Error("Email and password are required.");
      // Phone number is now optional
      // if (!uPhoneNumber.trim()) throw new Error("Phone number is required.");
      // Country, gender, and date of birth are now optional
      // if (!uCountry) throw new Error("Country is required.");
      // if (!uGender) throw new Error("Gender is required.");
      // if (!uDateOfBirth) throw new Error("Date of birth is required.");

      // const a = userAge;
      // if (a === null) throw new Error("Invalid date of birth.");
      // if (a < 10) throw new Error("You must be at least 10 years old.");

      // Favorite sport is now optional
      // if (!uFavoriteSport) throw new Error("Favorite sport is required.");
      // Interests are now optional
      // if (!Array.isArray(uInterests) || uInterests.length < 1)
      //   throw new Error("Pick at least 1 interest.");

      const data = await userRegister({
        firstName: uFirstName.trim(),
        lastName: uLastName.trim(),
        email: uEmail.trim(),
        password: uPassword,
        ...(uPhoneNumber.trim() && { phoneNumber: uPhoneNumber.trim() }),
        ...(uCountry && { country: uCountry }),
        ...(uGender && { gender: uGender }),
        ...(uDateOfBirth && { dateOfBirth: uDateOfBirth }),
        ...(uFavoriteSport && { favoriteSport: uFavoriteSport }),
        ...(uInterests.length > 0 && { interests: uInterests }),
        ...(uInvitedByCode.trim() && { invitedByCode: uInvitedByCode.trim() }),
      });

      const token = data?.token || data?.userToken || data?.accessToken || "";
      const user = data?.user || data?.data?.user || null;
      if (token && user) setUserSession({ token, user });

      setOkMsg("User registered");
      navigate("/dashboard", { replace: true });
    } catch (e2) {
      setErr(String(e2?.message || e2));
    } finally {
      setULoading(false);
    }
  }

  // SHOP submit
  async function shopSubmit(e) {
    e.preventDefault();
    clearMessages();
    setSLoading(true);

    try {
      clearAllSessions();

      const email = String(sEmail || "").trim().toLowerCase();
      const password = String(sPassword || "").trim();
      if (!email || !password) throw new Error("Email and password are required.");

      const payload = { shopEmail: email, password };
      let data;

      if (isRegister) {
        if (!String(sName || "").trim()) throw new Error("Shop name is required.");

        const body = {
          ...payload,
          shopName: String(sName || "").trim(),
          name: String(sName || "").trim(),
        };

        data = await tryMany([
          () => shopRequest("/api/shop/auth/register", { method: "POST", body: JSON.stringify(body) }),
          () => shopRequest("/api/shops/auth/register", { method: "POST", body: JSON.stringify(body) }),
          () => shopRequest("/api/shop/register", { method: "POST", body: JSON.stringify(body) }),
          () => shopRequest("/api/shops/register", { method: "POST", body: JSON.stringify(body) }),
        ]);
      } else {
        data = await tryMany([
          () => shopRequest("/api/shop/auth/login", { method: "POST", body: JSON.stringify(payload) }),
          () => shopRequest("/api/shops/auth/login", { method: "POST", body: JSON.stringify(payload) }),
          () => shopRequest("/api/shop/login", { method: "POST", body: JSON.stringify(payload) }),
          () => shopRequest("/api/shops/login", { method: "POST", body: JSON.stringify(payload) }),
        ]);
      }

      const token = safePickShopToken(data);
      const shop = safePickShop(data);
      if (!token) throw new Error("Shop login ok but token missing.");

      localStorage.setItem("shopToken", token);
      if (shop) {
        localStorage.setItem("shop", JSON.stringify(shop));
        localStorage.setItem("shopId", shop._id || shop.id || "");
        localStorage.setItem("shopEmail", shop.shopEmail || shop.email || email);
      } else {
        localStorage.setItem("shopEmail", email);
      }

      const SHOP_APP =
        import.meta?.env?.VITE_SHOP_APP_URL ||
        import.meta?.env?.VITE_SHOP_FRONTEND_URL ||
        "http://localhost:3001";

      setOkMsg(isRegister ? "Shop registered" : "Shop logged in");
      window.location.href = `${SHOP_APP}/dashboard`;
    } catch (e2) {
      setErr(String(e2?.message || e2));
    } finally {
      setSLoading(false);
    }
  }

  // Render benefits
  const renderBenefits = (benefits, isActive) => (
    <div className="sa-benefits">
      {benefits.map((b, idx) => (
        <div
          key={b.title}
          className={`sa-benefit ${isActive ? "active" : ""}`}
          style={{ transitionDelay: `${idx * 50}ms` }}
        >
          <div className={`sa-benefitIcon ${isActive ? "active" : ""}`}>
            <b.Icon size={16} />
          </div>
          <div>
            <div className={`sa-benefitTitle ${isActive ? "active" : ""}`}>{b.title}</div>
            <div className={`sa-benefitDesc ${isActive ? "active" : ""}`}>{b.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="sa-page">
      <div className="sa-bg" />

      <div className="sa-watermark">
        <img src={logoImage} alt="" />
      </div>

      <div className="sa-wrap">
        <header className="sa-header">
          <h1 className="sa-brandTitle">MOONDALA INC.</h1>
          <p className="sa-brandSub">Social Commerce. Shared Earnings.</p>

          <div className="sa-mode">
            <button
              type="button"
              className={`sa-modeBtn ${mode === "login" ? "active" : ""}`}
              onClick={() => setModeAndUrl("login")}
              disabled={anyLoading}
            >
              Login
            </button>
            <button
              type="button"
              className={`sa-modeBtn ${mode === "register" ? "active" : ""}`}
              onClick={() => setModeAndUrl("register")}
              disabled={anyLoading}
            >
              Create Account
            </button>
          </div>
        </header>

        {(err || okMsg) && (
          <div className={`sa-alert ${err ? "err" : "ok"}`}>
            <div className="sa-alertTitle">{err ? "Error" : "Success"}</div>
            <div className="sa-alertText">{err || okMsg}</div>
          </div>
        )}

        <div className="sa-split">
          {/* USER SIDE */}
          <section
            className={`sa-panel ${activeSide === "user" ? "active" : "inactive"}`}
            onClick={() => setSideAndUrl("user")}
          >
            <div className="sa-panelHead">
              <div className={`sa-panelIcon ${activeSide === "user" ? "active" : ""}`}>
                <UserIcon size={20} />
              </div>
              <div>
                <div className={`sa-panelTitle ${activeSide === "user" ? "active" : ""}`}>
                  {isRegister ? "User Sign Up" : "User Login"}
                </div>
                <div className={`sa-panelHint ${activeSide === "user" ? "active" : ""}`}>
                  {isRegister
                    ? "Join Moondala and start earning together."
                    : "Welcome back. Sign in to continue."}
                </div>
              </div>
            </div>

            {renderBenefits(userBenefits, activeSide === "user")}

            <form onSubmit={userSubmit} className="sa-form">
              {isRegister && (
                <div className="sa-row2">
                  <div className="sa-field">
                    <label className="sa-label">First name</label>
                    <input
                      className="sa-input"
                      value={uFirstName}
                      onChange={(e) => setUFirstName(e.target.value)}
                      disabled={activeSide !== "user"}
                    />
                  </div>
                  <div className="sa-field">
                    <label className="sa-label">Last name</label>
                    <input
                      className="sa-input"
                      value={uLastName}
                      onChange={(e) => setULastName(e.target.value)}
                      disabled={activeSide !== "user"}
                    />
                  </div>
                </div>
              )}

              <div className="sa-field">
                <label className="sa-label">Email address</label>
                <input
                  className="sa-input"
                  type="email"
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  placeholder="you@moondala.com"
                  required
                  disabled={activeSide !== "user"}
                />
              </div>

              <div className="sa-field">
                <label className="sa-label">Password</label>
                <div className="sa-input-container">
                  <input
                    className="sa-input"
                    type={showUPassword ? "text" : "password"}
                    value={uPassword}
                    onChange={(e) => setUPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={activeSide !== "user"}
                  />
                  <button
                    type="button"
                    className="sa-password-toggle"
                    onClick={() => setShowUPassword(!showUPassword)}
                    disabled={activeSide !== "user"}
                  >
                    {showUPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <>
                  <div className="sa-field">
                    <label className="sa-label">Phone number (optional)</label>
                    <input
                      className="sa-input"
                      value={uPhoneNumber}
                      onChange={(e) => setUPhoneNumber(e.target.value)}
                      placeholder="+1..."
                      disabled={activeSide !== "user"}
                    />
                  </div>

                  <div className="sa-row2">
                    <div className="sa-field">
                      <label className="sa-label">Country (optional)</label>
                      <select
                        className="sa-select"
                        value={uCountry}
                        onChange={(e) => setUCountry(e.target.value)}
                        disabled={activeSide !== "user"}
                      >
                        <option value="">Select...</option>
                        {countryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sa-field">
                      <label className="sa-label">Gender (optional)</label>
                      <select
                        className="sa-select"
                        value={uGender}
                        onChange={(e) => setUGender(e.target.value)}
                        disabled={activeSide !== "user"}
                      >
                        <option value="">Select...</option>
                        {genderOptions.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sa-field">
                    <label className="sa-label">Date of birth (optional)</label>
                    <input
                      className="sa-input"
                      type="date"
                      value={uDateOfBirth}
                      onChange={(e) => setUDateOfBirth(e.target.value)}
                      disabled={activeSide !== "user"}
                    />
                    {userAge !== null && <div className="sa-small">Age: {userAge}</div>}
                  </div>

                  <div className="sa-field">
                    <label className="sa-label">Favorite sport (optional)</label>
                    <select
                      className="sa-select"
                      value={uFavoriteSport}
                      onChange={(e) => setUFavoriteSport(e.target.value)}
                      disabled={activeSide !== "user"}
                    >
                      <option value="">Select...</option>
                      {sportOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sa-field">
                    <label className="sa-label">Interests (optional)</label>
                    <div className={`sa-chips ${activeSide !== "user" ? "disabled" : ""}`}>
                      {interestOptions.map((it) => (
                        <button
                          key={it}
                          type="button"
                          className={`sa-chip ${uInterests.includes(it) ? "on" : ""}`}
                          onClick={() => toggleInterest(it)}
                          disabled={activeSide !== "user"}
                        >
                          {it}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sa-field">
                    <label className="sa-label">Referral code (optional)</label>
                    <input
                      className="sa-input"
                      value={uInvitedByCode}
                      onChange={(e) => setUInvitedByCode(e.target.value)}
                      placeholder="invitedByCode"
                      disabled={activeSide !== "user"}
                    />
                  </div>
                </>
              )}

              <button
                className={`sa-btn ${activeSide === "user" ? "active" : ""}`}
                type="submit"
                disabled={uLoading || activeSide !== "user"}
              >
                {uLoading ? "Please wait..." : isRegister ? "Create User" : "Sign In"}
              </button>

              <div className="sa-note">
                {activeSide === "user" ? "Secure & encrypted" : "Click to select User"}
              </div>
            </form>
          </section>

          <div className="sa-divider" />

          {/* SHOP SIDE */}
          <section
            className={`sa-panel ${activeSide === "shop" ? "active" : "inactive"}`}
            onClick={() => setSideAndUrl("shop")}
          >
            <div className="sa-panelHead">
              <div className={`sa-panelIcon ${activeSide === "shop" ? "active" : ""}`}>
                <StoreIcon size={20} />
              </div>
              <div>
                <div className={`sa-panelTitle ${activeSide === "shop" ? "active" : ""}`}>
                  {isRegister ? "Shop Register" : "Shop Login"}
                </div>
                <div className={`sa-panelHint ${activeSide === "shop" ? "active" : ""}`}>
                  {isRegister
                    ? "Scale your business with Moondala."
                    : "Manage your store from the dashboard."}
                </div>
              </div>
            </div>

            {renderBenefits(shopBenefits, activeSide === "shop")}

            <form onSubmit={shopSubmit} className="sa-form">
              {isRegister && (
                <div className="sa-field">
                  <label className="sa-label">Shop name</label>
                  <input
                    className="sa-input"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                    placeholder="Your shop name"
                    disabled={activeSide !== "shop"}
                  />
                </div>
              )}

              <div className="sa-field">
                <label className="sa-label">{isRegister ? "Store email" : "Email"}</label>
                <input
                  className="sa-input"
                  type="email"
                  value={sEmail}
                  onChange={(e) => setSEmail(e.target.value)}
                  placeholder="admin@store.com"
                  required
                  disabled={activeSide !== "shop"}
                />
              </div>

              <div className="sa-field">
                <label className="sa-label">{isRegister ? "Access key" : "Password"}</label>
                <div className="sa-input-container">
                  <input
                    className="sa-input"
                    type={showSPassword ? "text" : "password"}
                    value={sPassword}
                    onChange={(e) => setSPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={activeSide !== "shop"}
                  />
                  <button
                    type="button"
                    className="sa-password-toggle"
                    onClick={() => setShowSPassword(!showSPassword)}
                    disabled={activeSide !== "shop"}
                  >
                    {showSPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                className={`sa-btn ${activeSide === "shop" ? "active" : ""}`}
                type="submit"
                disabled={sLoading || activeSide !== "shop"}
              >
                {sLoading ? "Please wait..." : isRegister ? "Register Shop" : "Enter Dashboard"}
              </button>

              <div className="sa-note">
                {activeSide === "shop" ? "Redirects to Shop Dashboard" : "Click to select Shop"}
              </div>
            </form>
          </section>
        </div>

        <footer className="sa-footer">
          <p>Trusted by thousands of users and sellers</p>
          {/* Keep Home but preserve your current mode */}
          <Link
            to={`/?mode=${encodeURIComponent(mode)}&side=${encodeURIComponent(activeSide)}`}
            className="sa-bottomLink"
          >
            Home
          </Link>
        </footer>
      </div>
    </div>
  );
}

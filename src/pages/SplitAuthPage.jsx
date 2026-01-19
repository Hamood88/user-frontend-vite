import { useState } from "react";
import UserAuthForm from "./UserAuthForm";
import ShopAuthForm from "./ShopAuthForm";
import "../styles/splitAuthPage.css";

export default function SplitAuthPage() {
  const [activeRole, setActiveRole] = useState("user");
  const [activeMode, setActiveMode] = useState("login");

  return (
    <div className={`auth-page ${activeRole}-theme`}>
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="auth-gradient" />
        <div className="auth-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="auth-grid" />
      </div>

      {/* Main Content */}
      <div className="auth-card">
        {/* Logo Section */}
        <div className="auth-header">
          <h1 className="auth-title">Moondala</h1>
          <p className="auth-subtitle">
            {activeRole === "user" ? "Your marketplace universe awaits" : "Grow your business with us"}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="role-toggle">
          <button
            className={`role-option ${activeRole === "user" ? "active" : ""}`}
            onClick={() => { setActiveRole("user"); setActiveMode("login"); }}
          >
            <svg className="role-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>User</span>
          </button>
          <button
            className={`role-option ${activeRole === "shop" ? "active" : ""}`}
            onClick={() => { setActiveRole("shop"); setActiveMode("login"); }}
          >
            <svg className="role-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Shop</span>
          </button>
          <div className={`role-slider ${activeRole}`} />
        </div>

        {/* Auth Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeMode === "login" ? "active" : ""}`}
            onClick={() => setActiveMode("login")}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${activeMode === "signup" ? "active" : ""}`}
            onClick={() => setActiveMode("signup")}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <div className="auth-form-wrapper">
          {activeRole === "user" && <UserAuthForm mode={activeMode} />}
          {activeRole === "shop" && <ShopAuthForm mode={activeMode} />}
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>© 2026 Moondala Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

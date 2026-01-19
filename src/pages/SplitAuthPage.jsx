import { useState } from "react";
import UserAuthForm from "./UserAuthForm";
import ShopAuthForm from "./ShopAuthForm";
import "../styles/splitAuthPage.css";

export default function SplitAuthPage() {
  const [activeRole, setActiveRole] = useState("user"); // "user" or "shop"
  const [activeMode, setActiveMode] = useState("login"); // "login" or "signup"

  return (
    <div className="auth-page">
      {/* Background Effects */}
      <div className="auth-bg">
        <div className="auth-gradient"></div>
        <div className="auth-circles">
          <div className="circle c1"></div>
          <div className="circle c2"></div>
          <div className="circle c3"></div>
        </div>
      </div>

      <div className="auth-content">
        {/* Logo */}
        <div className="auth-logo">
          <span className="logo-icon">🌙</span>
          <h1 className="logo-text">Moondala</h1>
        </div>

        {/* Role Switcher */}
        <div className="role-switcher">
          <button
            className={`role-btn ${activeRole === "user" ? "active user-active" : ""}`}
            onClick={() => {
              setActiveRole("user");
              setActiveMode("login");
            }}
          >
            <span className="role-icon">👤</span>
            <span>User</span>
          </button>
          <button
            className={`role-btn ${activeRole === "shop" ? "active shop-active" : ""}`}
            onClick={() => {
              setActiveRole("shop");
              setActiveMode("login");
            }}
          >
            <span className="role-icon">🏪</span>
            <span>Shop</span>
          </button>
        </div>

        {/* Login/Register Tabs */}
        <div className="auth-tabs">
          <button
            className={`tab-btn ${activeMode === "login" ? "active" : ""}`}
            onClick={() => setActiveMode("login")}
          >
            Log In
          </button>
          <button
            className={`tab-btn ${activeMode === "signup" ? "active" : ""}`}
            onClick={() => setActiveMode("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Forms */}
        <div className="auth-form-container">
          {activeRole === "user" && <UserAuthForm mode={activeMode} />}
          {activeRole === "shop" && <ShopAuthForm mode={activeMode} />}
        </div>
      </div>
    </div>
  );
}

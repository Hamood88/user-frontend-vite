import { useState } from "react";
import UserAuthForm from "./UserAuthForm";
import ShopAuthForm from "./ShopAuthForm";

export default function SplitAuthPage() {
  const [activeRole, setActiveRole] = useState("user"); // "user" or "shop"
  const [activeMode, setActiveMode] = useState("login"); // "login" or "signup"

  return (
    <div style={styles.container}>
      {/* Role Switcher */}
      <div style={styles.switcher}>
        <button
          onClick={() => {
            setActiveRole("user");
            setActiveMode("login");
          }}
          style={{
            ...styles.modeBtn,
            ...(activeRole === "user" ? styles.modeBtnActive : styles.modeBtnInactive),
          }}
        >
           User
        </button>
        <button
          onClick={() => {
            setActiveRole("shop");
            setActiveMode("login");
          }}
          style={{
            ...styles.modeBtn,
            ...(activeRole === "shop" ? styles.modeBtnActiveShop : styles.modeBtnInactive),
          }}
        >
           Shop
        </button>
      </div>

      {/* Login/Register Tabs */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveMode("login")}
          style={{
            ...styles.tabBtn,
            ...(activeMode === "login" ? styles.tabBtnActive : styles.tabBtnInactive),
          }}
        >
          Log In
        </button>
        <button
          onClick={() => setActiveMode("signup")}
          style={{
            ...styles.tabBtn,
            ...(activeMode === "signup" ? styles.tabBtnActive : styles.tabBtnInactive),
          }}
        >
          Sign Up
        </button>
      </div>

      {/* Auth Forms */}
      <div style={styles.section}>
        {activeRole === "user" && <UserAuthForm mode={activeMode} />}
        {activeRole === "shop" && <ShopAuthForm mode={activeMode} />}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a14 0%, #1a1a2e 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: \'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif\',
  },
  switcher: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    padding: 8,
    backdropFilter: "blur(10px)",
  },
  modeBtn: {
    border: "none",
    padding: "12px 28px",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  modeBtnActive: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  modeBtnActiveShop: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "white",
    boxShadow: "0 4px 15px rgba(245, 87, 108, 0.4)",
  },
  modeBtnInactive: {
    background: "rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  tabContainer: {
    display: "flex",
    gap: 4,
    marginBottom: 24,
    borderRadius: 10,
    background: "rgba(255,255,255,0.05)",
    padding: 4,
  },
  tabBtn: {
    border: "none",
    padding: "10px 32px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabBtnActive: {
    background: "rgba(255,255,255,0.15)",
    color: "white",
  },
  tabBtnInactive: {
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
  },
  section: {
    width: "100%",
    maxWidth: 480,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 32,
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
};

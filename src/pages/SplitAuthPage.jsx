import { useState } from "react";
import UserAuthForm from "./UserAuthForm";
import ShopAuthForm from "./ShopAuthForm";

export default function SplitAuthPage() {
  const [mode, setMode] = useState("user"); // "user" or "shop"

  return (
    <div style={styles.container}>
      {/* Mode Switcher */}
      <div style={styles.switcher}>
        <button
          onClick={() => setMode("user")}
          style={{
            ...styles.modeBtn,
            ...(mode === "user" ? styles.modeBtnActive : styles.modeBtnInactive),
          }}
        >
          👤 User
        </button>
        <button
          onClick={() => setMode("shop")}
          style={{
            ...styles.modeBtn,
            ...(mode === "shop" ? styles.modeBtnActive : styles.modeBtnInactive),
          }}
        >
          🛍️ Shop
        </button>
      </div>

      {/* User Auth Section */}
      {mode === "user" && (
        <div style={styles.section}>
          <UserAuthForm />
        </div>
      )}

      {/* Shop Auth Section */}
      {mode === "shop" && (
        <div style={styles.section}>
          <ShopAuthForm />
        </div>
      )}
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
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  switcher: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    padding: 8,
    backdropFilter: "blur(10px)",
  },
  modeBtn: {
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  modeBtnActive: {
    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
    color: "#000",
    boxShadow: "0 4px 15px rgba(255, 215, 0, 0.4)",
  },
  modeBtnInactive: {
    background: "rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.5)",
  },
  section: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
};

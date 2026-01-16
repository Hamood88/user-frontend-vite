// user-frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userLogin, setUserSession, clearUserSession } from "../api";

export default function Login({ embedded = false }) {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      // ✅ Clean any old/broken user session first (prevents weird carry-over)
      clearUserSession();

      // ✅ CLEAR SHOP SESSION COMPLETELY (avoid cross-role conflicts)
      localStorage.removeItem("shopToken");
      localStorage.removeItem("shopOwner");
      localStorage.removeItem("storeToken");
      localStorage.removeItem("store");
      localStorage.removeItem("shop");
      localStorage.removeItem("shopId");
      localStorage.removeItem("shopEmail");
      localStorage.removeItem("mode");

      // ✅ CLEAR ADMIN SESSION (optional but helps prevent weird role collisions)
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");

      // ✅ Also clear legacy token key from old versions (IMPORTANT)
      localStorage.removeItem("token");

      // ✅ Login via API helper
      const data = await userLogin({
        email: email.trim().toLowerCase(),
        password,
      });

      // Support different backend shapes
      const token = data?.token || data?.userToken || data?.accessToken || "";
      const user = data?.user || data?.data?.user || null;

      if (!token || !user) {
        throw new Error("Login response missing token/user");
      }

      // ✅ Save user session (api.js stores ONLY userToken now)
      setUserSession({ token, user });
      localStorage.setItem("role", "user");

      // ✅ Go to feed (no full page reload)
      nav("/feed", { replace: true });
    } catch (err) {
      setMsg(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={embedded ? undefined : styles.pageWrap}>
      {!embedded && <h2 style={{ marginBottom: 14 }}>Login</h2>}

      <form onSubmit={onSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {msg ? <div style={{ color: "red", fontSize: 14 }}>{msg}</div> : null}

        <button disabled={loading} style={styles.submit} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>

        {!embedded && (
          <div style={{ marginTop: 12, fontSize: 14 }}>
            Don’t have an account? <Link to="/register">Register</Link>
          </div>
        )}
      </form>
    </div>
  );
}

const styles = {
  pageWrap: { maxWidth: 520, margin: "40px auto" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: 12, borderRadius: 10, border: "1px solid #ddd" },
  submit: {
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },
};

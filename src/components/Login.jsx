// user-frontend-vite/src/components/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// ✅ Use Vite env if exists, fallback to localhost
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  import.meta?.env?.VITE_API_URL ||
  import.meta?.env?.VITE_BACKEND_URL ||
  "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function tryLogin(url, payload) {
    return axios.post(`${API_BASE}${url}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = { email, password };

      // ✅ Some projects use /api/auth/login, others use /api/users/login
      let res;
      try {
        res = await tryLogin("/api/auth/login", payload);
      } catch (e1) {
        const status = e1?.response?.status;
        // If endpoint not found, try the other common endpoint
        if (status === 404) {
          res = await tryLogin("/api/users/login", payload);
        } else {
          throw e1;
        }
      }

      const token = res?.data?.token || "";
      const user = res?.data?.user || null;

      if (!token) {
        setError("Login failed: missing token from server");
        return;
      }

      // ✅ Store token under the key your app expects
      localStorage.setItem("userToken", token);

      // ✅ Keep legacy keys if other parts still read them
      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (user?._id) localStorage.setItem("userId", String(user._id));
      }

      navigate("/feed");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "50px auto", padding: 20 }}>
      <h2>Login</h2>

      {error && (
        <div style={{ background: "#ffd6d6", padding: 10, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            style={{ width: "100%", padding: 10 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            style={{ width: "100%", padding: 10 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        <button style={{ width: "100%", padding: 10 }} type="submit">
          Login
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const StoreLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/store/login", { email, password });
      localStorage.setItem("storeToken", res.data.token);
      localStorage.setItem("storeOwnerId", res.data.storeOwner._id);
      navigate("/store/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Store Owner Email"
        required
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <button
        type="submit"
        style={{
          width: "100%",
          padding: 10,
          background: "#0c6efd",
          color: "white",
          border: "none",
          borderRadius: 4,
          fontWeight: "bold"
        }}
      >
        Login
      </button>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        Don&apos;t have a store?{" "}
        <Link to="/store/register" style={{ color: "#0c6efd", textDecoration: "underline" }}>
          Register your store
        </Link>
      </div>
    </form>
  );
};

export default StoreLogin;

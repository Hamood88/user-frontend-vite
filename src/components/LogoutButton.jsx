// src/components/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        width: "100%",
        padding: 10,
        background: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: 4,
        fontWeight: "bold",
        cursor: "pointer"
      }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;

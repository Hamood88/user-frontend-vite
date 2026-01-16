import React from "react";
import axios from "axios";

const TestApiButton = () => {
  const handleTest = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("User loaded: " + JSON.stringify(res.data));
    } catch (err) {
      alert(
        "ERROR: " +
          (err.response?.status || "") +
          " " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <button
      onClick={handleTest}
      style={{
        padding: "10px 22px",
        background: "#1976d2",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        margin: 20,
        fontWeight: "bold",
        fontSize: 16,
        cursor: "pointer",
      }}
    >
      Test /api/users/me
    </button>
  );
};

export default TestApiButton;

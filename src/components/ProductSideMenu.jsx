import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductSideMenu({ shopId, onMessage, onSeeMore }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: 240,
        minWidth: 240,
        borderRadius: 16,
        padding: 14,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        position: "sticky",
        top: 18,
        height: "fit-content",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Shop Menu</div>

      <button
        onClick={() => navigate(`/shop/${shopId}`)}
        style={btnStyle}
      >
        🏪 Shop Feed
      </button>

      <button
        onClick={onMessage}
        style={btnStyle}
      >
        💬 Message
      </button>

      <button
        onClick={onSeeMore}
        style={btnStyle}
      >
        🧺 See More
      </button>
    </div>
  );
}

const btnStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 10,
  textAlign: "left",
};

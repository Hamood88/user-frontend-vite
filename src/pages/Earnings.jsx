import React, { useEffect, useState } from "react";

const API_BASE = import.meta?.env?.VITE_API_BASE || "https://moondala-backend.onrender.com";

export default function Earnings() {
  const [data, setData] = useState({ total: 0, earnings: [], count: 0 });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/earnings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Earnings</h2>
        <button onClick={load} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd" }}>
          Refresh
        </button>
      </div>

      {loading ? <div>Loading...</div> : null}

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #e6e6e6", borderRadius: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>${Number(data.total || 0).toFixed(2)}</div>
        <div style={{ color: "#666" }}>{data.count || 0} records</div>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {(data.earnings || []).map((e) => (
          <div key={e._id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontWeight: 700 }}>
              +${Number(e.amount).toFixed(2)} (Level {e.level})
            </div>
            <div style={{ color: "#666", fontSize: 13 }}>
              Status: {e.status} • {new Date(e.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

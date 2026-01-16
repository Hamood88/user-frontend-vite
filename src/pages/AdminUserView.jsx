// user-frontend/src/pages/AdminUserView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:5000";

export default function AdminUserView() {
  const { id } = useParams();
  const [sp] = useSearchParams();

  const token = sp.get("t") || ""; // admin token from URL

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [user, setUser] = useState(null);

  const headers = useMemo(() => {
    const h = { Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setErr("");
      setUser(null);

      if (!id) {
        setErr("Missing user id");
        setLoading(false);
        return;
      }
      if (!token) {
        setErr("Missing admin token in URL. Please open this page from Admin Dashboard.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
          method: "GET",
          headers,
        });

        const text = await res.text();
        let data = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (e) {
          data = { raw: text };
        }

        if (!res.ok) {
          throw new Error(data?.message || `Request failed (${res.status})`);
        }

        setUser(data?.user || null);
      } catch (e) {
        setErr(e.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [id, headers, token]);

  if (loading) {
    return <div style={{ padding: 24, fontFamily: "Arial" }}>Loading user…</div>;
  }

  if (err) {
    return (
      <div style={{ padding: 24, fontFamily: "Arial" }}>
        <h2 style={{ marginTop: 0 }}>Admin User View</h2>
        <div style={{ color: "crimson", fontWeight: 800 }}>{err}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 24, fontFamily: "Arial" }}>
        <h2 style={{ marginTop: 0 }}>Admin User View</h2>
        <div>No user found.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial", maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Admin User View</h2>

      <div style={{ marginBottom: 10 }}>
        <b>Name:</b> {(user.firstName || "") + " " + (user.lastName || "")}
      </div>
      <div style={{ marginBottom: 10 }}>
        <b>Email:</b> {user.email}
      </div>
      <div style={{ marginBottom: 10 }}>
        <b>User ID:</b> {user._id}
      </div>
      <div style={{ marginBottom: 10 }}>
        <b>ReferralCode:</b> {user.referralCode || "-"}
      </div>
      <div style={{ marginBottom: 10 }}>
        <b>InvitedBy:</b> {user.invitedBy || "-"}
      </div>
      <div style={{ marginBottom: 10 }}>
        <b>Referral chain length:</b> {(user.referralTree || []).length}
      </div>

      <div style={{ marginTop: 16, fontWeight: 900 }}>Referral Tree (JSON)</div>
      <pre
        style={{
          marginTop: 8,
          padding: 12,
          borderRadius: 10,
          background: "#111",
          color: "#0f0",
          maxHeight: 420,
          overflow: "auto",
          fontSize: 12,
        }}
      >
        {JSON.stringify(user.referralTree || [], null, 2)}
      </pre>
    </div>
  );
}

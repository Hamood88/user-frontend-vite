import React, { useEffect, useMemo, useState } from "react";
import { sendFriendRequest, getOutgoingFriendRequests } from "../api.jsx";

function idStr(v) {
  return String(v?._id || v?.id || v || "").trim();
}

export default function AddFriendButton({ targetUserId }) {
  const [meId, setMeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const cleanTargetId = useMemo(() => idStr(targetUserId), [targetUserId]);

  useEffect(() => {
    // Try to detect current user id from localStorage (common patterns)
    try {
      const raw =
        localStorage.getItem("user") ||
        localStorage.getItem("userObj") ||
        localStorage.getItem("userData") ||
        "";
      if (raw) {
        const u = JSON.parse(raw);
        const uid = idStr(u?._id || u?.id);
        if (uid) setMeId(uid);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Check if there is already an outgoing pending request TO this user
    async function checkPending() {
      if (!cleanTargetId) return;
      try {
        const data = await getOutgoingFriendRequests();
        const outgoing = Array.isArray(data?.outgoing) ? data.outgoing : [];
        const exists = outgoing.some(
          (r) => idStr(r?.toUser?._id || r?.toUser?.id || r?.toUser) === cleanTargetId
        );
        if (exists) setSent(true);
      } catch {
        // ignore (button still works)
      }
    }
    checkPending();
  }, [cleanTargetId]);

  if (!cleanTargetId) return null;

  // Hide if target is me
  if (meId && cleanTargetId === meId) return null;

  async function onAdd() {
    try {
      setErr("");
      setLoading(true);

      const msg =
        window.prompt("Add a message with your friend request (optional):", "") ||
        "";

      await sendFriendRequest(cleanTargetId, msg);
      setSent(true);
      alert("✅ Friend request sent!");
    } catch (e) {
      setErr(e?.message || "Failed to send friend request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <button
        type="button"
        onClick={onAdd}
        disabled={loading || sent}
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: sent ? "#0b1220" : "#111",
          color: "#fff",
          cursor: sent ? "not-allowed" : "pointer",
          fontWeight: 900,
          letterSpacing: 0.2,
        }}
      >
        {sent ? "REQUEST SENT" : loading ? "SENDING..." : "ADD AS FRIEND"}
      </button>

      {err ? (
        <div style={{ color: "crimson", fontWeight: 900, fontSize: 12 }}>{err}</div>
      ) : null}
    </div>
  );
}

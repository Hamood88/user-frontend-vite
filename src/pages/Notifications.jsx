import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getFriendRequests,
  respondFriendRequest,
} from "../api.jsx";

/* =========================
   Helpers
   ========================= */
function timeAgo(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  return `${days}d`;
}

function fullName(u) {
  if (!u) return "User";
  const n = `${u.firstName || ""} ${u.lastName || ""}`.trim();
  return n || u.displayName || u.username || u.email || "User";
}

function actorName(n) {
  const a = n?.actor || n?.fromUser;
  return fullName(a);
}

function pickId(v) {
  if (!v) return "";
  return String(v?._id || v?.id || v?.postId || v?.commentId || v).trim();
}

function getType(n) {
  return String(n?.type || "").trim().toLowerCase();
}

function isMessageType(t) {
  return t === "message_user" || t === "message_shop" || t === "message_unified";
}

function getConversationIdFromNotification(n) {
  // ✅ IMPORTANT: backend stores it in meta.conversationId
  const cid = n?.meta?.conversationId || n?.meta?.threadId || n?.conversationId || n?.threadId;
  return pickId(cid);
}

function buildMessage(n) {
  const a = actorName(n);
  const t = getType(n);

  // ✅ your model uses title + message
  const title = String(n?.title || "").trim();
  const msg = String(n?.message || "").trim();

  // If backend provided message, use it
  if (title && msg) return `${title} — ${a} ${msg}`;
  if (msg) return `${a} ${msg}`;
  if (title) return title;

  // Fallback messages by type
  if (t === "friend_request") return `${a} sent you a friend request`;
  if (t === "friend_accepted") return `${a} accepted your friend request`;

  if (t === "like_post") return `${a} liked your post`;
  if (t === "comment_post") return `${a} commented on your post`;
  if (t === "reply_comment") return `${a} replied to your comment`;

  if (t === "message_user") return `${a} sent you a message`;
  if (t === "message_shop") return `${a} sent a message to your shop`;
  if (t === "message_unified") return `${a} asked about a product`;

  return `${a} did something`;
}

/* =========================
   Page
   ========================= */
export default function Notifications() {
  const nav = useNavigate();

  // Friend requests
  const [frLoading, setFrLoading] = useState(true);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [busyRequestId, setBusyRequestId] = useState("");

  // Notifications
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const incomingCount = useMemo(() => incoming.length, [incoming]);

  const cardStyle = {
    background: "#ffffff",
    color: "#0f172a",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  };

  async function loadNotifications() {
    try {
      setLoading(true);
      setErr("");
      const data = await getMyNotifications(80, 0);
      const list = Array.isArray(data?.notifications) ? data.notifications : [];
      setItems(list);
      setUnread(Number(data?.unreadCount || 0));
    } catch (e) {
      setErr(e?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function loadFriendRequests() {
    try {
      setFrLoading(true);
      const data = await getFriendRequests();
      setIncoming(Array.isArray(data?.incoming) ? data.incoming : []);
      setOutgoing(Array.isArray(data?.outgoing) ? data.outgoing : []);
    } catch (e) {
      setErr((prev) => prev || e?.message || "Failed to load friend requests");
    } finally {
      setFrLoading(false);
    }
  }

  async function loadAll() {
    await Promise.all([loadNotifications(), loadFriendRequests()]);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildTargetUrl(n) {
    const t = getType(n);

    // ✅ post/comment notifications -> go to feed with postId/commentId
    const postId = pickId(n?.postId);
    const commentId = pickId(n?.commentId);

    if (postId) {
      return commentId
        ? `/feed?postId=${encodeURIComponent(postId)}&commentId=${encodeURIComponent(commentId)}`
        : `/feed?postId=${encodeURIComponent(postId)}`;
    }

    // ✅ messages -> open Messages.jsx using conversationId query param
    if (isMessageType(t)) {
      const convoId = getConversationIdFromNotification(n);
      if (convoId) return `/messages?conversationId=${encodeURIComponent(convoId)}`;
      return "/messages";
    }

    // ✅ friend requests
    if (t === "friend_request") return "/notifications";

    return "/feed";
  }

  async function openNotification(n) {
    try {
      setErr("");

      // mark read in backend
      if (n && n._id && !n.read) {
        await markNotificationRead(n._id);
      }

      // optimistic update
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, Number(u || 0) - (n?.read ? 0 : 1)));

      return nav(buildTargetUrl(n));
    } catch (e) {
      setErr(e?.message || "Failed");
    }
  }

  async function markAll() {
    try {
      setErr("");
      await markAllNotificationsRead();
      await loadNotifications();
    } catch (e) {
      setErr(e?.message || "Failed");
    }
  }

  async function actOnRequest(requestId, action) {
    if (!requestId) return;
    try {
      setErr("");
      setBusyRequestId(requestId);
      await respondFriendRequest(requestId, action);
      await loadFriendRequests();
      await loadNotifications(); // accept can create "friend_accepted"
    } catch (e) {
      setErr(e?.message || "Failed to respond");
    } finally {
      setBusyRequestId("");
    }
  }

  return (
    <div>
      {/* title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <h2 style={{ marginTop: 0, color: "#ffffff" }}>Notifications</h2>

        <button
          type="button"
          onClick={markAll}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          Mark all read
        </button>
      </div>

      {err && (
        <div style={{ marginBottom: 12, color: "crimson", fontWeight: 900 }}>
          {err}
        </div>
      )}

      {/* Friend Requests */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <h3 style={{ margin: "0 0 8px 0", color: "#ffffff" }}>
            Friend Requests{" "}
            <span style={{ color: "#cbd5e1", fontSize: 13 }}>
              (Incoming: <b>{incomingCount}</b>)
            </span>
          </h3>

          <button
            type="button"
            onClick={loadFriendRequests}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#0b1220",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Refresh
          </button>
        </div>

        {frLoading ? (
          <div style={{ color: "#ffffff" }}>Loading friend requests...</div>
        ) : incoming.length === 0 ? (
          <div style={{ color: "#cbd5e1" }}>No incoming friend requests.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {incoming.map((r) => {
              const id = r?._id;
              const sender = r?.from;
              const name = fullName(sender);
              const msg = String(r?.message || "").trim();

              return (
                <div key={id} style={{ ...cardStyle, background: "#ffffff" }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>👤 {name}</div>

                  {msg ? (
                    <div style={{ marginTop: 6, color: "#334155" }}>
                      <b>Message:</b> {msg}
                    </div>
                  ) : (
                    <div style={{ marginTop: 6, color: "#64748b" }}>
                      No message attached.
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => actOnRequest(id, "accept")}
                      disabled={busyRequestId === id}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #0a7",
                        background: "#e9fff6",
                        cursor: "pointer",
                        fontWeight: 900,
                      }}
                    >
                      {busyRequestId === id ? "Working..." : "Accept"}
                    </button>

                    <button
                      type="button"
                      onClick={() => actOnRequest(id, "decline")}
                      disabled={busyRequestId === id}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #c33",
                        background: "#fff0f0",
                        cursor: "pointer",
                        fontWeight: 900,
                      }}
                    >
                      {busyRequestId === id ? "Working..." : "Decline"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!frLoading && outgoing.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ color: "#cbd5e1", fontSize: 13, marginBottom: 8 }}>
              Sent requests: <b>{outgoing.length}</b>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {outgoing.map((r) => {
                const id = r?._id;
                const to = r?.to;
                const name = fullName(to);
                const msg = String(r?.message || "").trim();
                return (
                  <div
                    key={id}
                    style={{
                      ...cardStyle,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>
                      📤 Sent to: {name}{" "}
                      <span style={{ fontWeight: 700, color: "#64748b" }}>(Pending)</span>
                    </div>
                    {msg && (
                      <div style={{ marginTop: 6, color: "#334155" }}>
                        <b>Your message:</b> {msg}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div style={{ marginBottom: 10, fontSize: 13, color: "#cbd5e1" }}>
        Unread: <b>{unread}</b>
      </div>

      {loading ? (
        <p style={{ color: "#ffffff" }}>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ color: "#ffffff" }}>No notifications yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((n) => {
            const t = getType(n);
            const isMsg = isMessageType(t);
            const isPosty = !!(n?.postId || n?.commentId);

            return (
              <div
                key={n._id}
                onClick={() => openNotification(n)}
                style={{
                  ...cardStyle,
                  cursor: "pointer",
                  opacity: n.read ? 0.75 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 900, color: "#0f172a" }}>
                    {!n.read ? "🔔 " : "✅ "}
                    {buildMessage(n)}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{timeAgo(n.createdAt)}</div>
                </div>

                {isPosty ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                    Tap to open the post
                  </div>
                ) : null}

                {isMsg ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                    Tap to open messages
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

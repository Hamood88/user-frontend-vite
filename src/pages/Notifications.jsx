import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// Removed headlessui to avoid dependency issues
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

  console.log(`[DEBUG] buildMessage id=${n._id} type="${t}" rawType="${n.type}"`);

  // ✅ System messages: display directly without actor
  if (t === 'system' || t === 'system_message' || t.includes('system')) {
    const title = String(n?.title || "").trim();
    const msg = String(n?.message || "").trim();
    if (title && msg) return `${title}: ${msg}`;
    return title || msg || "System Notification";
  }

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
  if (t === "like_comment") return `${a} liked your comment`;
  if (t === "comment_post") return `${a} commented on your post`;
  if (t === "reply_comment") return `${a} replied to your comment`;

  if (t === "message_user") return `${a} sent you a message`;
  if (t === "message_shop") return `${a} sent a message to your shop`;
  if (t === "message_unified") return `${a} asked about a product`;

  if (t === "bill_payment") return `Your invoice is ready`;
  if (t === "order_status_updated") return `Your order status was updated`;
  if (t === "return_status_updated") return `Your return request was updated`;

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

  // System Message Modal
  const [systemMsgOpen, setSystemMsgOpen] = useState(false);
  const [selectedSystemMsg, setSelectedSystemMsg] = useState(null);

  const incomingCount = useMemo(() => incoming.length, [incoming]);

  const token = {
    bg: "hsl(var(--background))",
    text: "hsl(var(--foreground))",
    card: "hsl(var(--card))",
    cardText: "hsl(var(--card-foreground))",
    border: "hsl(var(--border))",
    muted: "hsl(var(--muted-foreground))",
    primary: "hsl(var(--primary))",
    primaryText: "hsl(var(--primary-foreground))",
    secondary: "hsl(var(--secondary))",
    secondaryText: "hsl(var(--secondary-foreground))",
    accent: "hsl(var(--accent))",
    accentText: "hsl(var(--accent-foreground))",
    danger: "hsl(var(--destructive))",
  };

  const cardStyle = {
    background: token.card,
    color: token.cardText,
    border: `1px solid ${token.border}`,
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
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
    const source = String(n?.meta?.source || "").trim().toLowerCase();
    const sourceShopId = pickId(n?.meta?.shopId);
    const postId = pickId(n?.postId || n?.meta?.postId);
    const commentId = pickId(n?.commentId || n?.meta?.commentId);

    if (source === "shop_feed" && sourceShopId) {
      if (postId && commentId) {
        return `/shop/${encodeURIComponent(sourceShopId)}/feed?postId=${encodeURIComponent(postId)}&commentId=${encodeURIComponent(commentId)}`;
      }
      if (postId) {
        return `/shop/${encodeURIComponent(sourceShopId)}/feed?postId=${encodeURIComponent(postId)}`;
      }
      return `/shop/${encodeURIComponent(sourceShopId)}/feed`;
    }

    // ✅ post/comment notifications -> go to feed with postId/commentId
    if (postId) {
      return commentId
        ? `/feed/post/${encodeURIComponent(postId)}?commentId=${encodeURIComponent(commentId)}`
        : `/feed/post/${encodeURIComponent(postId)}`;
    }

    // ✅ messages -> open Messages.jsx using conversationId query param
    if (isMessageType(t)) {
      const convoId = getConversationIdFromNotification(n);
      const messageId = pickId(n?.meta?.messageId || n?.messageId);
      if (convoId && messageId) {
        return `/messages?conversationId=${encodeURIComponent(convoId)}&messageId=${encodeURIComponent(messageId)}`;
      }
      if (convoId) return `/messages?conversationId=${encodeURIComponent(convoId)}`;
      return "/messages";
    }

    // ✅ friend requests
    if (t === "friend_request") return "/friends";

    // ✅ orders & returns
    if (
      t === "bill_payment" ||
      t === "order_status_updated" ||
      t === "order_cancelled" ||
      t === "return_status_updated"
    ) {
      return "/orders";
    }

    // ✅ system messages (Admin DMs)
    if (t === 'system' || t === 'system_message' || t.includes('system')) {
      return n?.meta?.link || "/messages";
    }

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

      const t = getType(n);
      console.log(`[DEBUG] openNotification type="${t}"`);

      // ✅ Handle System Messages (Admin DMs) - Force navigation to Messages
      if (t === 'system' || t === 'system_message' || t.includes('system')) {
        const target = n?.meta?.link || "/messages";
        return nav(target);
      }
      
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
        <h2 style={{ marginTop: 0, color: token.text }}>Notifications</h2>

        <button
          type="button"
          onClick={markAll}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${token.border}`,
            background: token.primary,
            color: token.primaryText,
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          Mark all read
        </button>
      </div>

      {err && (
        <div style={{ marginBottom: 12, color: token.danger, fontWeight: 900 }}>
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
          <h3 style={{ margin: "0 0 8px 0", color: token.text }}>
            Friend Requests{" "}
            <span style={{ color: token.muted, fontSize: 13 }}>
              (Incoming: <b>{incomingCount}</b>)
            </span>
          </h3>

          <button
            type="button"
            onClick={loadFriendRequests}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: `1px solid ${token.border}`,
              background: token.secondary,
              color: token.secondaryText,
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Refresh
          </button>
        </div>

        {frLoading ? (
          <div style={{ color: token.text }}>Loading friend requests...</div>
        ) : incoming.length === 0 ? (
          <div style={{ color: token.muted }}>No incoming friend requests.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {incoming.map((r) => {
              const id = r?._id;
              const sender = r?.from;
              const name = fullName(sender);
              const msg = String(r?.message || "").trim();

              return (
                <div key={id} style={cardStyle}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>👤 {name}</div>

                  {msg ? (
                    <div style={{ marginTop: 6, color: token.cardText }}>
                      <b>Message:</b> {msg}
                    </div>
                  ) : (
                    <div style={{ marginTop: 6, color: token.muted }}>
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
                        border: `1px solid ${token.border}`,
                        background: token.accent,
                        color: token.accentText,
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
                        border: `1px solid ${token.border}`,
                        background: "rgba(239,68,68,0.12)",
                        color: token.cardText,
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
            <div style={{ color: token.muted, fontSize: 13, marginBottom: 8 }}>
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
                      background: token.card,
                      border: `1px solid ${token.border}`,
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>
                      📤 Sent to: {name}{" "}
                      <span style={{ fontWeight: 700, color: token.muted }}>(Pending)</span>
                    </div>
                    {msg && (
                      <div style={{ marginTop: 6, color: token.cardText }}>
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
      <div style={{ marginBottom: 10, fontSize: 13, color: token.muted }}>
        Unread: <b>{unread}</b>
      </div>

      {loading ? (
        <p style={{ color: token.text }}>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ color: token.text }}>No notifications yet.</p>
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
                  <div style={{ fontWeight: 900, color: token.cardText }}>
                    {!n.read ? "🔔 " : "✅ "}
                    {buildMessage(n)}
                  </div>
                  <div style={{ fontSize: 12, color: token.muted }}>{timeAgo(n.createdAt)}</div>
                </div>

                {isPosty ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: token.muted }}>
                    Tap to open the post
                  </div>
                ) : null}

                {isMsg ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: token.muted }}>
                    Tap to open messages
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
      {/* System Message Modal (Custom CSS) */}
      {systemMsgOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }} onClick={() => setSystemMsgOpen(false)}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 'bold', color: '#111' }}>
              {selectedSystemMsg?.title || "System Message"}
            </h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#444', marginBottom: '20px' }}>
              {selectedSystemMsg?.message}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSystemMsgOpen(false)}
                style={{
                  background: '#0f172a',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Check, X, Bell, MoreHorizontal, CheckCheck } from "lucide-react";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
  deleteNotifications,
  deleteAllNotifications,
  safeImageUrl,
} from "../api";
import "../styles/friendsModern.css";

/* Helpers duplicated from Notifications.jsx to ensure consistency */
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

function getType(n) {
  return String(n?.type || "").trim().toLowerCase();
}

function buildMessage(n) {
  const a = actorName(n);
  const t = getType(n);
  const title = String(n?.title || "").trim();
  const msg = String(n?.message || "").trim();

  if (title && msg) return `${title} — ${a} ${msg}`;
  if (msg) return `${a} ${msg}`;
  if (title) return title;

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

export default function NotificationDropdown({ onClose, onUnreadChange }) {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getMyNotifications(20, 0); // specific limit for dropdown
      setList(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
      if (typeof onUnreadChange === "function") onUnreadChange(Number(res.unreadCount || 0));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  /* Actions */
  async function handleMarkRead(n) {
    if (n.read) return;
    try {
      await markNotificationRead(n._id);
      setList((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      );
      setUnreadCount((c) => {
        const next = Math.max(0, c - 1);
        if (typeof onUnreadChange === "function") onUnreadChange(next);
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setList((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
      if (typeof onUnreadChange === "function") onUnreadChange(0);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this notification?")) return;
    try {
      await deleteNotification(id);
      setList((prev) => prev.filter((x) => x._id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} notifications?`)) return;
    try {
      await deleteNotifications(Array.from(selected));
      setList((prev) => prev.filter((x) => !selected.has(x._id)));
      setSelected(new Set());
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm("Delete ALL notifications? This cannot be undone.")) return;
    try {
      await deleteAllNotifications();
      setList([]);
      setSelected(new Set());
      setUnreadCount(0);
      if (typeof onUnreadChange === "function") onUnreadChange(0);
    } catch (e) {
      console.error(e);
    }
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleNavigate(n) {
    handleMarkRead(n);
    onClose();
    
    const t = String(n?.type || "").trim().toLowerCase();
    const source = String(n?.meta?.source || "").trim().toLowerCase();
    const sourceShopId = String(n?.meta?.shopId || "").trim();
    const postId = n?.postId?._id || n?.postId || n?.meta?.postId;
    const commentId = n?.commentId?._id || n?.commentId || n?.meta?.commentId;

    if (source === "shop_feed" && sourceShopId) {
      if (postId && commentId) {
        return nav(`/shop/${encodeURIComponent(sourceShopId)}/feed?postId=${encodeURIComponent(postId)}&commentId=${encodeURIComponent(commentId)}`);
      }
      if (postId) {
        return nav(`/shop/${encodeURIComponent(sourceShopId)}/feed?postId=${encodeURIComponent(postId)}`);
      }
      return nav(`/shop/${encodeURIComponent(sourceShopId)}/feed`);
    }
    
    // System messages (Admin DMs) -> Messages
    if (t === 'system' || t === 'system_message' || t.includes('system')) {
      const target = n?.meta?.link || "/messages";
      return nav(target);
    }
    
    // Message notifications -> Messages with conversationId
    const isMessage = t === "message_user" || t === "message_shop" || t === "message_unified";
    if (isMessage) {
      const convoId = n?.meta?.conversationId || n?.meta?.threadId || n?.conversationId;
      const messageId = n?.meta?.messageId || n?.messageId;
      if (convoId && messageId) return nav(`/messages?conversationId=${encodeURIComponent(convoId)}&messageId=${encodeURIComponent(messageId)}`);
      if (convoId) return nav(`/messages?conversationId=${encodeURIComponent(convoId)}`);
      return nav("/messages");
    }
    
    // Friend requests -> Friends page
    if (t === "friend_request") return nav("/friends");

    // Orders/returns
    if (
      t === "bill_payment" ||
      t === "order_status_updated" ||
      t === "order_cancelled" ||
      t === "return_status_updated"
    ) {
      return nav("/orders");
    }
    
    // Post/Comment notifications -> Feed
    if (postId) {
      return commentId 
        ? nav(`/feed/post/${postId}?commentId=${commentId}`)
        : nav(`/feed/post/${postId}`);
    }
    
    // Default fallback
    nav("/notifications");
  }

  return (
    <div className="absolute right-0 top-14 w-80 md:w-96 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md rounded-t-xl">
        <h3 className="font-bold text-white text-sm">Notifications</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Mark all as read"
          >
            Mark all read
          </button>
          {list.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
              title="Clear all"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/20 flex justify-between items-center animate-in slide-in-from-top-2">
          <span className="text-xs text-red-200 font-medium">
            {selected.size} selected
          </span>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px] custom-scrollbar">
        {loading && list.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
            <Bell className="w-8 h-8 opacity-20" />
            <span>No notifications</span>
          </div>
        ) : (
          list.map((n) => {
            const isRead = n.read;
            const isSelected = selected.has(n._id);
            const avatar = safeImageUrl(n.actor?.avatarUrl || n.actor?.avatar, 'avatar');

            return (
              <div
                key={n._id}
                onClick={() => handleNavigate(n)}
                className={`
                  relative group flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer
                  ${
                    isSelected
                      ? "bg-blue-500/10 border-blue-500/30"
                      : isRead
                      ? "bg-transparent border-transparent hover:bg-white/5"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }
                `}
              >
                {/* Checkbox (visible on hover or selected) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(n._id);
                  }}
                  className={`
                    mt-1 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                    ${
                      isSelected
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-white/30 text-transparent hover:border-white/60"
                    }
                  `}
                >
                  <Check className="w-3 h-3" />
                </div>

                {/* Avatar */}
                <div className="shrink-0 relative">
                  <img 
                    src={avatar} 
                    className="w-8 h-8 rounded-full bg-black/20 object-cover border border-white/10" 
                    alt=""
                  />
                  {!isRead && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#0f172a]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-tight mb-1 ${isRead ? "text-slate-300" : "text-white font-medium"}`}>
                    {buildMessage(n)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>

                {/* Individual Delete (Hover only) */}
                <button
                  onClick={(e) => handleDelete(n._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-white/10 bg-white/5 rounded-b-xl">
        <button
          onClick={() => {
            onClose();
            nav("/notifications");
          }}
          className="w-full py-2 text-xs font-bold text-center text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
        >
          View Full History
        </button>
      </div>
    </div>
  );
}

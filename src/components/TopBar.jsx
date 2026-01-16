import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/notifications/mine?limit=1&skip=0", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data?.unreadCount || 0);
      }
    } catch (e) {
      console.warn("Failed to fetch notification count:", e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = () => {
    navigate("/notifications");
  };

  const isNotificationsPage = location.pathname === "/notifications";
  const pathname = String(location?.pathname || "").toLowerCase();
  const isFeedRoute = pathname === "/feed" || pathname.startsWith("/feed/");

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "var(--mdSidebarW, 260px)",
        right: 0,
        height: "var(--topbar-h, 60px)",
        background: isFeedRoute ? "transparent" : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderBottom: isFeedRoute ? "none" : "1px solid #334155",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        zIndex: 99,
        boxShadow: isFeedRoute ? "none" : "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          <img src="/moondala-logo.png" alt="logo" style={{ width: 28, height: 28, borderRadius: 6 }} />
          <span style={{ opacity: 0.95 }}>Moondala</span>
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={handleNotificationClick}
          aria-pressed={isNotificationsPage}
          title="Notifications"
          style={{
            position: "relative",
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
          </svg>

          {unreadCount ? (
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                background: "#ff375f",
                color: "white",
                fontSize: 11,
                padding: "2px 6px",
                borderRadius: 999,
                fontWeight: 700,
                boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}

export default TopBar;

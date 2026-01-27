import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ShoppingCart,
  ShoppingBag,
  MessageSquare,
  Zap,
  Package,
  Briefcase,
} from "lucide-react";

import { clearUserSession, getUserSession, safeImageUrl, getMyNotifications } from "../api.jsx";
import NotificationDropdown from "./NotificationDropdown";
import "../styles/appLayoutModern.css";

/* =========================
   Helpers
   ========================= */
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function safeName(u) {
  const displayName = String(u?.displayName || "").trim();
  const fn = String(u?.firstName || "").trim();
  const ln = String(u?.lastName || "").trim();
  return displayName || `${fn} ${ln}`.trim() || "User";
}

function safeHandle(u) {
  const h = String(u?.handle || u?.username || "").trim();
  return h ? (h.startsWith("@") ? h : `@${h}`) : "@moondala";
}

function safeAvatar(u) {
  return safeImageUrl(u?.avatarUrl || u?.avatar || u?.photoUrl || "", 'avatar', u);
}

export default function AppLayout() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const me = getUserSession(); // Get fresh session data each time
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Notification state
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved === "true";
    } catch {
      return false;
    }
  });

  // Poll notifications for unread count
  useEffect(() => {
    let mounted = true;
    const fetchNotifs = async () => {
      try {
        // Fetch 1 notification just to get the unreadCount from metadata
        const res = await getMyNotifications(1, 0);
        if (mounted) setUnreadCount(res.unreadCount || 0);
      } catch (e) {
        // quiet error
      }
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // 30s poll
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    }
    if (showNotifs) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifs]);

  function toggleSidebar() {
    setSidebarCollapsed(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem("sidebarCollapsed", String(newValue));
      } catch {}
      return newValue;
    });
  }

  function handleNotificationClick() {
    setShowNotifs((prev) => !prev);
  }

  function handleSearch(e) {
    if (e.key === "Enter") {
      const query = searchQuery.trim();
      if (query) {
        nav(`/search?q=${encodeURIComponent(query)}`);
        setSearchQuery("");
      }
    }
  }

  const navItems = [
    { label: "Feed", icon: Home, to: "/feed" },
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "💰 Earn More", icon: Zap, to: "/earn-more" },
    { label: "Search", icon: Search, to: "/search" },
    { label: "Friends", icon: Users, to: "/friends" },
    { label: "Messages", icon: MessageSquare, to: "/messages" },
    { label: "Mall", icon: ShoppingBag, to: "/mall" },
    { label: "My Orders", icon: Package, to: "/orders" },
    { label: "Cart", icon: ShoppingCart, to: "/cart" },
    { label: "Careers", icon: Briefcase, to: "/careers" },
    { label: "Settings", icon: Settings, to: "/settings" },
  ];

  function logout() {
    clearUserSession();
    nav("/", { replace: true });
  }

  return (
    <div className="md-shell">
      {/* Desktop Sidebar */}
      <aside className={cx("md-side", sidebarCollapsed ? "md-sideCollapsed" : "")}>
        <div className="md-sideHeader">
          {!sidebarCollapsed && (
            <div className="md-brand">
              <img src="/moondala-logo.png" alt="Moondala" className="h-8 w-auto object-contain" />
            </div>
          )}
          <button
            type="button"
            className="md-toggleBtn"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? "»" : "«"}
          </button>
        </div>

        <nav className="md-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx("md-navItem", isActive ? "md-navItemActive" : "")
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="md-navIcon" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

      </aside>

      {/* Mobile Header */}
      <div className="md-mHeader">
        <button
          type="button"
          className="md-iconBtn"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="md-mBrand">
          <img src="/moondala-logo.png" alt="Moondala" className="h-8 w-auto object-contain" />
        </div>
        <div className="md-iconBtn" style={{ opacity: 0, pointerEvents: 'none' }}>
          {/* Spacer for center alignment */}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md-mMenu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cx("md-mMenuItem", isActive ? "md-mMenuItemActive" : "")
              }
            >
              <item.icon className="w-6 h-6" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}

      {/* Main */}
      <main className={cx("md-main", sidebarCollapsed ? "md-mainExpanded" : "")}>
        {/* Desktop Top Bar */}
        <header className="md-topbar">
          <div className="md-searchWrap">
            <Search className="md-searchIcon" />
            <input 
              className="md-searchInput" 
              placeholder="Search Moondala..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <div className="relative" ref={notifRef}>
            <button 
              type="button" 
              className="md-iconBtn" 
              onClick={handleNotificationClick}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="md-dot" />}
            </button>
            {showNotifs && (
              <NotificationDropdown 
                onClose={() => setShowNotifs(false)} 
              />
            )}
          </div>
        </header>

        <div className="md-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

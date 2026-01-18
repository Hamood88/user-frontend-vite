import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
} from "lucide-react";

import { clearUserSession, getUserSession, absUrl, safeImageUrl } from "../api.jsx";
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
  const me = getUserSession(); // Get fresh session data each time
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function handleNotificationClick() {
    nav("/notifications");
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
    { label: "Friends", icon: Users, to: "/friends" },
    { label: "Messages", icon: MessageSquare, to: "/messages" },
    { label: "Mall", icon: ShoppingBag, to: "/mall" },
    { label: "Orders", icon: ShoppingCart, to: "/orders" },
    { label: "Cart", icon: ShoppingCart, to: "/cart" },
    { label: "Settings", icon: Settings, to: "/settings" },
  ];

  function logout() {
    clearUserSession();
    nav("/", { replace: true });
  }

  return (
    <div className="md-shell">
      {/* Desktop Sidebar */}
      <aside className="md-side">
        <div className="md-brand">
          <div className="md-logoText">Moondala</div>
        </div>

        <nav className="md-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx("md-navItem", isActive ? "md-navItemActive" : "")
              }
            >
              <item.icon className="md-navIcon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

      </aside>

      {/* Mobile Header */}
      <div className="md-mHeader">
        <div className="md-mBrand">Moondala</div>
        <button
          type="button"
          className="md-iconBtn"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
          <button type="button" className="md-mLogout" onClick={logout}>
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      )}

      {/* Main */}
      <main className="md-main">
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

          <button 
            type="button" 
            className="md-iconBtn" 
            onClick={handleNotificationClick}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="md-dot" />
          </button>
        </header>

        <div className="md-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

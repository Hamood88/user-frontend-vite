import React, { useMemo, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import { apiGet, API_BASE, toAbsUrl } from "../api.jsx";

// ✅ Fix your Vite import issue (AppLayout.jsx can import these)
export const SIDEBAR_WIDTH = 260;
export const COLLAPSED_WIDTH = 84;

function safeStr(v) {
  return String(v || "").trim();
}


function getMe() {
  try {
    const raw = localStorage.getItem("me") || localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Sidebar({ collapsed = false, onToggle }) {
  const nav = useNavigate();

  const [me, setMe] = useState(() => getMe());

  useEffect(() => {
    let mounted = true;

    // Listen for custom user update event from other components
    function handleUserUpdate() {
      console.log("userUpdated event fired, reloading sidebar user");
      const updated = getMe();
      if (mounted && updated) {
        console.log("Sidebar updating user data:", updated);
        setMe(updated);
      }
    }

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      mounted = false;
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (me) return; // already have from localStorage

      try {
        let data = null;
        try {
          data = await apiGet("/api/user-profile/me");
        } catch (_) {
          // ignore
        }

        if (!data) {
          try {
            data = await apiGet("/api/users/me");
          } catch (_) {
            data = null;
          }
        }

        const user = data?.user || data?.me || data?.profile || data || null;
        if (mounted && user) {
          setMe(user);
          try {
            localStorage.setItem("me", JSON.stringify(user));
          } catch {}
        }
      } catch (e) {
        // ignore
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [me]);

  const name = safeStr(me?.firstName) || safeStr(me?.name) || safeStr(me?.username) || "User";
  const country = safeStr(me?.country) || safeStr(me?.location) || "";
  const avatar = toAbsUrl(me?.avatar || me?.profilePic || me?.photo || me?.avatarUrl);

  function logout() {
    try {
      localStorage.removeItem("userToken");
      localStorage.removeItem("token");
      localStorage.removeItem("me");
      localStorage.removeItem("user");
    } catch {}
    nav("/", { replace: true });
  }

  return (
    <aside className={`md-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="md-sidebar__top">
<button
  type="button"
  className="md-sidebar__toggle"
  onClick={(e) => {
    e.stopPropagation(); // ✅ prevents wrapper click
    onToggle?.(!collapsed);
  }}
  aria-label="Toggle sidebar"
  title="Toggle sidebar"
>
  {collapsed ? "»" : "«"}
</button>


        <div
          className="md-profile"
          title={name}
          onClick={() => nav("/profile")}
          style={{ cursor: "pointer" }}
        >
          <div className="md-profile__avatar">
            {avatar ? (
              <img src={avatar} alt={name} />
            ) : (
              <div className="md-profile__avatarFallback">{name.slice(0, 1).toUpperCase()}</div>
            )}
          </div>

          {!collapsed && (
            <div className="md-profile__meta">
              <div className="md-profile__name">{name}</div>
              {country ? <div className="md-profile__country">{country}</div> : null}
            </div>
          )}
        </div>
      </div>

      <nav className="md-nav">
        <NavItem to="/dashboard" label="Dashboard" collapsed={collapsed} />
        <NavItem to="/feed" label="Feed" collapsed={collapsed} />
        <NavItem to="/search" label="Search" collapsed={collapsed} />
        <NavItem to="/friends" label="Friends" collapsed={collapsed} />
        <NavItem to="/messages" label="Messages" collapsed={collapsed} />
        <NavItem to="/notifications" label="🔔 Notifications" collapsed={collapsed} />
        <NavItem to="/orders" label="Orders" collapsed={collapsed} />
        <NavItem to="/mall" label="Mall" collapsed={collapsed} />
        <NavItem to="/cart" label="🛒 Cart" collapsed={collapsed} />
        <NavItem to="/earn-more" label="💰 Earn More" collapsed={collapsed} />
        <NavItem to="/profile" label="Profile" collapsed={collapsed} />
        <NavItem to="/settings" label="Settings" collapsed={collapsed} />
      </nav>

      
    </aside>
  );
}

function NavItem({ to, label, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `md-nav__item ${isActive ? "is-active" : ""}`}
      title={collapsed ? label : undefined}
    >
      <span className="md-nav__dot" />
      {!collapsed ? <span className="md-nav__label">{label}</span> : null}
    </NavLink>
  );
}

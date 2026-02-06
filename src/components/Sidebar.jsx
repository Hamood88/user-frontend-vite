import React, { useMemo, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Home, 
  LayoutDashboard, 
  Search, 
  Users, 
  MessageCircle, 
  Bell, 
  ShoppingBag, 
  Store, 
  ShoppingCart, 
  DollarSign, 
  User, 
  Settings,
  Briefcase,
  Heart
} from "lucide-react";
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
        <NavItem to="/dashboard" label="Dashboard" collapsed={collapsed} icon={LayoutDashboard} theme="violet" />
        <NavItem to="/feed" label="Feed" collapsed={collapsed} icon={Home} theme="pink" />
        <NavItem to="/search" label="Search" collapsed={collapsed} icon={Search} theme="sky" />
        <NavItem to="/friends" label="Friends" collapsed={collapsed} icon={Users} theme="emerald" />
        <NavItem to="/messages" label="Messages" collapsed={collapsed} icon={MessageCircle} theme="blue" />
        <NavItem to="/notifications" label="Notifications" collapsed={collapsed} icon={Bell} theme="amber" />
        <NavItem to="/orders" label="Orders" collapsed={collapsed} icon={ShoppingBag} theme="orange" />
        <NavItem to="/mall" label="Mall" collapsed={collapsed} icon={Store} theme="purple" />
        <NavItem to="/cart" label="Cart" collapsed={collapsed} icon={ShoppingCart} theme="teal" />
        <NavItem to="/earn-more" label="Earn More" collapsed={collapsed} icon={DollarSign} theme="green" />
        <NavItem to="/careers" label="Careers" collapsed={collapsed} icon={Briefcase} theme="rose" />
        <NavItem to="/profile" label="Profile" collapsed={collapsed} icon={User} theme="indigo" />
        <NavItem to="/settings" label="Settings" collapsed={collapsed} icon={Settings} theme="gray" />
      </nav>

      
    </aside>
  );
}

const THEMES = {
  violet: { active: "bg-violet-500/10 text-violet-500 border-violet-500/20 shadow-[0_0_15px_-3px_rgba(139,92,246,0.2)]", icon: "text-violet-500" },
  pink: { active: "bg-pink-500/10 text-pink-500 border-pink-500/20 shadow-[0_0_15px_-3px_rgba(236,72,153,0.2)]", icon: "text-pink-500" },
  sky: { active: "bg-sky-500/10 text-sky-500 border-sky-500/20 shadow-[0_0_15px_-3px_rgba(14,165,233,0.2)]", icon: "text-sky-500" },
  emerald: { active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]", icon: "text-emerald-500" },
  blue: { active: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]", icon: "text-blue-500" },
  amber: { active: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]", icon: "text-amber-500" },
  orange: { active: "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_15px_-3px_rgba(249,115,22,0.2)]", icon: "text-orange-500" },
  purple: { active: "bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]", icon: "text-purple-500" },
  teal: { active: "bg-teal-500/10 text-teal-500 border-teal-500/20 shadow-[0_0_15px_-3px_rgba(20,184,166,0.2)]", icon: "text-teal-500" },
  green: { active: "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_-3px_rgba(34,197,94,0.2)]", icon: "text-green-500" },
  indigo: { active: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]", icon: "text-indigo-500" },
  gray: { active: "bg-gray-500/10 text-gray-500 border-gray-500/20 shadow-[0_0_15px_-3px_rgba(107,114,128,0.2)]", icon: "text-gray-500" },
  rose: { active: "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_-3px_rgba(244,63,94,0.2)]", icon: "text-rose-500" },
  red: { active: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]", icon: "text-red-500" },
};

function NavItem({ to, label, collapsed, icon: Icon, theme = "violet" }) {
  const themeStyles = THEMES[theme] || THEMES.violet;

  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 border border-transparent group overflow-hidden ${
          isActive 
            ? themeStyles.active + " font-bold" 
            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        }`
      }
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
           {/* Active Side Bar Line */}
           {isActive && !collapsed && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-current opacity-50" />
          )}

          {Icon ? (
            <span className={`flex items-center justify-center transition-colors duration-300 ${isActive ? "text-current" : themeStyles.icon}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-current" />
          )}
          {!collapsed && <span className="text-[14px]">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

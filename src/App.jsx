// user-frontend-vite/src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";

/* ✅ AUTH (single page) */
import SplitAuthPage from "./pages/SplitAuthPage";

/* ✅ PAGES */
import UserDashboard from "./pages/UserDashboard";
import Feed from "./pages/Feed";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";

import Mall from "./pages/Mall";
import MallFeed from "./pages/MallFeed";
import MallProduct from "./pages/MallProduct";

import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Search from "./pages/Search";

import MyOrders from "./pages/MyOrders";
import CheckoutPage from "./pages/CheckoutPage";
import Cart from "./pages/Cart";
import ProductDetailsUnified from "./pages/ProductDetailsUnified";
import PublicShareRedirect from "./pages/PublicShareRedirect";

/* ✅ PUBLIC SHOP PAGES */
import ShopFeedPublic from "./pages/ShopFeedPublic";
import ShopMallPublic from "./pages/ShopMallPublic";

/* ✅ LAYOUT / GUARDS */
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";

/* =========================
   helpers
   ========================= */
function getUserTokenOnly() {
  try {
    return localStorage.getItem("userToken") || localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

function cleanParam(v) {
  return String(v || "").replace(/[<>]/g, "").replace(/^:/, "").trim();
}

/* =========================
   ✅ Error Boundary (prevents blank screen)
   ========================= */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "", stack: "" };
  }


  static getDerivedStateFromError(err) {
    return {
      hasError: true,
      message: String(err?.message || err || "Unknown error"),
      stack: String(err?.stack || ""),
    };
  }

  componentDidCatch(err, info) {
    // Enhanced error logging
    console.error("[App ErrorBoundary]", err);
    if (info) {
      console.error("[App ErrorBoundary] componentStack:", info.componentStack);
    }
    if (err && err.stack) {
      console.error("[App ErrorBoundary] stack:", err.stack);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ padding: 20, fontFamily: "system-ui", color: "#111" }}>
        <h2 style={{ marginTop: 0 }}>❌ User Frontend crashed</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>
          <b>Error:</b> {this.state.message}
        </p>
        <details style={{ marginTop: 12 }}>
          <summary>Stack</summary>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.stack}</pre>
        </details>
        <p style={{ marginTop: 16 }}>
          Go to <b>/_probe</b> to confirm routing works.
        </p>
      </div>
    );
  }
}

/* =========================
   ✅ PROBE (always visible)
   ========================= */
function Probe() {
  return (
    <div style={{ padding: 20, fontFamily: "system-ui", color: "#111" }}>
      <h1 style={{ margin: 0 }}>✅ /_probe is working</h1>
      <p style={{ marginTop: 8 }}>
        If other pages are blank, one of your imported components is crashing.
      </p>
      <p>
        Try:
        <br />• <code>/</code> (SplitAuthPage)
        <br />• <code>/mall</code> (Protected area)
        <br />• Open DevTools Console to see the red error.
      </p>
    </div>
  );
}

/* =========================
   404
   ========================= */
function NotFound() {
  return (
    <div style={{ padding: 30, color: "#111", fontFamily: "system-ui" }}>
      <h2>404 - Page Not Found</h2>
      <p>
        Go back to{" "}
        <a href="/" style={{ color: "#111", textDecoration: "underline" }}>
          home
        </a>
        .
      </p>
    </div>
  );
}

/* =========================
   Home Router (SplitAuthPage)
   ========================= */
function HomeRouter() {
  const token = getUserTokenOnly();
  if (token) return <Navigate to="/dashboard" replace />;
  return <SplitAuthPage />;
}

/* =========================
   ✅ redirect /login and /register into SplitAuthPage
   ========================= */
function AuthRedirect({ mode = "login", side = "user" }) {
  return (
    <Navigate
      to={`/?mode=${encodeURIComponent(mode)}&side=${encodeURIComponent(side)}`}
      replace
    />
  );
}

/* =========================
   ✅ SHORT LINK /s/<shopId> -> /shop/<shopId>
   ========================= */
function ShopShortRedirect() {
  const { shopId } = useParams();
  const safe = cleanParam(shopId);
  if (!safe) return <Navigate to="/mall" replace />;
  return <Navigate to={`/shop/${encodeURIComponent(safe)}`} replace />;
}

/* =========================
   ✅ /u/:userId -> Direct to user feed (no intermediate profile page)
   ========================= */
function UserFeedRedirect() {
  const { userId } = useParams();
  const safe = cleanParam(userId);
  if (!safe) return <Navigate to="/search" replace />;
  return <Navigate to={`/feed/user/${encodeURIComponent(safe)}`} replace />;
}

/* =========================
   ✅ /shop/:shopId default -> Shop Feed (public landing)
   ========================= */
function ShopDefaultToMallPreview() {
  const { shopId } = useParams();
  const safe = cleanParam(shopId);
  if (!safe) return <Navigate to="/mall" replace />;
  // Redirect users to the shop's public feed by default
  return <Navigate to={`/shop/${encodeURIComponent(safe)}/feed`} replace />;
}

export default function App() {
  // Apply saved theme on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") || "dark";
      const html = document.documentElement;
      html.setAttribute("data-theme", savedTheme);
      html.style.colorScheme = savedTheme;
    } catch {}
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        {/* ✅ DEBUG route */}
        <Route path="/_probe" element={<Probe />} />

        {/* Home */}
        <Route path="/" element={<HomeRouter />} />

        {/* ✅ These now go to SplitAuthPage */}
        <Route path="/login" element={<AuthRedirect mode="login" side="user" />} />
        <Route path="/register" element={<AuthRedirect mode="register" side="user" />} />

        {/* Optional: shop auth shortcuts */}
        <Route path="/shop/login" element={<AuthRedirect mode="login" side="shop" />} />
        <Route path="/shop/register" element={<AuthRedirect mode="register" side="shop" />} />

        {/* Public product share */}
        <Route path="/p/:shareId" element={<PublicShareRedirect />} />

        {/* Public user redirect - go directly to their feed */}
        <Route path="/u/:userId" element={<UserFeedRedirect />} />

        {/* Short shop link */}
        <Route path="/s/:shopId" element={<ShopShortRedirect />} />

        {/* ✅ PUBLIC SHOP (user view) */}
        <Route path="/shop/:shopId" element={<ShopDefaultToMallPreview />} />
        <Route path="/shop/:shopId/feed" element={<ShopFeedPublic />} />
        <Route path="/shop/:shopId/mall" element={<ShopMallPublic />} />

        {/* ✅ Unified product page (public) */}
        <Route path="/product/:id" element={<ProductDetailsUnified appName="user" />} />

        {/* ✅ PRIVATE APP (logged-in) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />

            <Route path="/feed" element={<Feed />} />
            <Route path="/feed/user/:userId" element={<Feed />} />
            <Route path="/feed/:userId" element={<Feed />} />

            <Route path="/friends" element={<Friends />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/search" element={<Search />} />

            {/* ✅ Mall must be inside layout so sidebar works */}
            <Route path="/mall" element={<Mall />} />
            <Route path="/mall/feed" element={<MallFeed />} />
            <Route path="/mall/product/:productId" element={<MallProduct />} />

            <Route path="/orders" element={<MyOrders />} />
            <Route path="/my-orders" element={<Navigate to="/orders" replace />} />

            <Route path="/cart" element={<Cart />} />

            <Route path="/settings" element={<Settings />} />

            <Route path="/messages/user/:userId" element={<Messages />} />
            <Route path="/messages/:conversationId" element={<Messages />} />
            <Route path="/messages" element={<Messages />} />

            <Route path="/checkout/:productId" element={<CheckoutPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

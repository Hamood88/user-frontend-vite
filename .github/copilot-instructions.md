# Copilot Instructions: User Frontend (Vite)

**Status**: ACTIVE. (Legacy `user-frontend` is DEPRECATED).  
**Port**: 5173 (dev), Vercel (production, `moondala.com`)

**Monorepo Quick Start**: See [../backend/COPILOT_QUICKSTART.md](../backend/COPILOT_QUICKSTART.md) for 60-second setup

## 🏗️ Architecture & Tech Stack
- **Framework**: React 18, Vite 7 (ES modules, not CRA).
- **Styling**: Tailwind CSS v4, Framer Motion v12, lucide-react icons.
- **Routing**: React Router v6 (SPA with ProtectedRoute guard).
- **Auth**: `userToken` in LocalStorage (Bearer token format).
- **i18n**: i18next with automatic English/Arabic RTL detection.
- **PWA**: vite-plugin-pwa (service worker for offline).
- **Build**: `npm run dev` (dev), `npm run build` (production).

## 🔐 Critical Developer Rules

### 1. **API Wrapper ALWAYS** (`src/api.jsx`, 1200+ lines)
- **NEVER use `fetch` directly** - use `apiGet`, `apiPost`, `apiPut`, `apiDelete` exported from `src/api.jsx`.
- **Why**: Centralized token management, error handling, and `/api` path normalization.
- **Auth**: Automatically reads `userToken` from localStorage; sets `Authorization: Bearer <token>` header.
- **Paths**: ONLY `/api/users/*` or `/api/public/*`. NEVER `/api/shop/*` or `/api/admin/*`.
- **401 Handling**: Auto-triggers logout/redirect to login page.
- **Examples**:
  ```jsx
  const user = await apiGet("/users/me");
  const orders = await apiGet(`/users/${userId}/orders`);
  const result = await apiPost("/cart", { productId, qty });
  ```

### 2. **Internationalization (i18n) - MANDATORY**
- **CRITICAL**: ALL visible user-facing text must use `t("key")` from i18next.
- **Setup**: `src/i18n.js` initializes i18n; loads translations from `/public/locales/{lang}/translation.json`.
- **Usage**: 
  ```jsx
  import { useTranslation } from 'react-i18next';
  const { t } = useTranslation();
  return <h1>{t("dashboard.welcome")}</h1>;
  ```
- **Language Detection**: Auto-detects browser language (English/Arabic). RTL applied automatically.
- **Fallback**: Defaults to English if key missing.
- **Update Guide**: See `TRANSLATION_UPDATE_GUIDE.md` for bulk key additions.

### 3. **Image URLs - `toAbsUrl()` MANDATORY**
- **Pattern**: `<img src={toAbsUrl(product.image)} />`
- **What it handles**:
  - Localhost fixes: `localhost:5000/uploads/...` → Production backend URL
  - Cloudinary URLs: Already absolute, pass through
  - Relative paths: `/uploads/avatars/...` → Absolute backend URL
  - Mixed content: Forces HTTPS in production (prevents browser blocking)
- **Why**: Backend returns relative paths; toAbsUrl() resolves them based on environment.
- **Always imported**: `import { toAbsUrl } from "../api.jsx";`

### 4. **Authentication & Session Management**
- **Token Storage Key**: `userToken` (always this, no variations).
- **Also stored**: `userObj` = user object (for cart calculations, display names).
- **Load from Storage**:
  ```jsx
  const token = localStorage.getItem("userToken");
  const user = JSON.parse(localStorage.getItem("userObj") || "{}");
  ```
- **Cart Isolation**: `cart_items_${userId}` (prevents cart conflicts between users).
- **Session Loss**: 401 response → auto-logout, redirect to `/` (landing/login).

### 5. **Routing & Protected Pages**
- **Entry**: `src/App.jsx` (329 lines, all routes defined here).
- **Guard Component**: `ProtectedRoute.jsx` - wraps pages that need token.
- **Pattern**:
  ```jsx
  <Route element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} path="/dashboard" />
  ```
- **Public Pages**: `/`, `/refer/:code`, `/products/:id`, Shop pages (`/shop/...`).
- **Protected Pages**: `/dashboard`, `/cart`, `/messages`, `/profile`, `/settings`.

### 6. **Special Features & Patterns**

#### **A) Earn More / Referral System** (`src/pages/EarnMore.jsx`)
- QR code generation (client-side with `qrcode` library).
- Social sharing buttons (Facebook, Twitter, email).
- Stats: Total referrals, earnings from backend `/api/users/earnings`.
- Referral link: `/refer/user/{code}` or `/refer/shop/{code}`.
- See `EARN_MORE_FEATURE.md` for full details.

#### **B) Product Details Unified** (`src/pages/ProductDetailsUnified.jsx`, 700+ lines)
- Multi-source product fetching (mall, public shops, backend products).
- "Ask Previous Buyer" feature (start chat with buyers who reviewed).
- Cart + order flow built-in.
- Review section integrated (`ProductReviews.jsx`).
- Handles missing product gracefully.

#### **C) Notifications & Friend Requests**
- In-app notification feed (users.notifications array).
- Friend request notifications (type: `friend_request`, `friend_accepted`).
- Notifications endpoint: `/api/notifications` (see friend request fix in backend docs).

#### **D) Cart Persistence**
- Stored in localStorage with user-specific key.
- Functions: `readCart()`, `writeCart(items)`, `getUserCartKey()`.
- Pattern: Pre-filled on checkout, cleared after order success.

## 🚀 Development & Build

### **Start Dev Server**
```bash
cd user-frontend-vite-temp
npm install
npm run dev  # http://localhost:5173
```

### **Build for Production**
```bash
npm run build  # Creates dist/
npm run preview  # Test build locally
```

### **Environment Variables** (`.env` or `.env.local`)
```
VITE_API_BASE=http://localhost:5000  # Dev
VITE_API_BASE=https://moondala-backend.onrender.com  # Prod
```
- **Vite-specific**: Use `import.meta.env.VITE_*` (NOT `process.env`).
- **Fallback**: `api.jsx` defaults to Render backend if env not set.

### **Vercel Deployment**
- Auto-deploy on git push to `main`.
- Ensure `VITE_API_BASE` set in Vercel environment (Settings → Environment Variables).
- SPA rewrite: `vercel.json` redirects all routes to `/index.html`.

## 🗂️ File Structure & Key Components

| Path | Purpose |
|------|---------|
| `src/api.jsx` | **CRITICAL**: All API calls routed here (1200 lines) |
| `src/App.jsx` | Route definitions, theme init, ProtectedRoute logic |
| `src/pages/*.jsx` | 20+ page components (Dashboard, Cart, Messages, etc.) |
| `src/components/AppLayout.jsx` | Main wrapper (TopBar, Sidebar, content area) |
| `src/components/ProtectedRoute.jsx` | Auth guard (checks `userToken`) |
| `src/i18n.js` | i18next config (auto-loads translations) |
| `src/lib/utils.js` | `cn()` helper (clsx + twMerge for Tailwind) |
| `public/locales/{en,ar}/translation.json` | Translation strings (EN source) |
| `vite.config.js` | PWA + React plugin config |

## 📋 Common Workflows

### **Add a New Page**
1. Create component in `src/pages/MyNewPage.jsx`.
2. Import in `src/App.jsx`.
3. Add route (protected if needed):
   ```jsx
   <Route element={<ProtectedRoute><MyNewPage /></ProtectedRoute>} path="/mynewpage" />
   ```
4. Add sidebar link (if sidebar-accessible): Edit `src/components/Sidebar.jsx`.

### **Add API Endpoint Call**
1. Go to `src/api.jsx` and add export function:
   ```jsx
   export async function getMyData() {
     return apiGet("/users/me/data");
   }
   ```
2. Import in component: `import { getMyData } from "../api.jsx";`
3. Call in useEffect: `const data = await getMyData();`

### **Add Translation Keys**
1. Edit `public/locales/en/translation.json` (add nested key).
2. Update Arabic version if needed (`public/locales/ar/translation.json`).
3. Use in JSX: `const { t } = useTranslation(); <span>{t("mykey.subkey")}</span>`.

### **Debug API Issues**
1. Check DevTools → Network tab for request/response.
2. Verify `Authorization: Bearer <token>` header present.
3. If 401: Token expired → clear localStorage → re-login.
4. If CORS error: Check allowlist in `backend/app.js` includes your origin.
5. If `/api/api` in URL: Bug in path normalization → check `src/api.jsx` API_ROOT logic.

## 🔗 Cross-Project Dependencies

| Project | Port | Token Key | Purpose |
|---------|------|-----------|---------|
| **Backend** | 5000 | - | API server (Express) |
| **Shop Frontend** | 3001 | `shopToken` | Vendor dashboard |
| **Admin Frontend** | 3002 | `adminToken` | Admin panel |

**Token Isolation**: User frontend ONLY uses `userToken`. Never read `shopToken` or `adminToken` in this codebase.

## 📚 Key Documentation
- **Earn More**: `EARN_MORE_FEATURE.md`, `EARN_MORE_QUICK_START.md`
- **Monorepo Overview**: `../MONOREPO_GUIDE.md`
- **Backend API**: `../backend/.github/copilot-instructions.md`
- **Translations**: `TRANSLATION_UPDATE_GUIDE.md`

## ⚡ Performance Patterns

### **useMemo for Expensive Computations**
Used throughout for filtering, mapping, and UI state calculations:
```jsx
// ProductDetailsUnified.jsx - avoid re-extracting images on every render
const images = useMemo(() => pickImages(product), [product]);

// Calculate cart count only when cart changes
const cartCount = useMemo(() => {
  const c = readCart();
  return c.reduce((a, x) => a + Math.max(1, safeNum(x.qty, 1)), 0);
}, [product, qty]);
```
- **When to use**: DOM calculations, derived data, filter/map operations
- **When NOT to use**: Simple state values, event handlers (use `useCallback` instead)

### **useCallback for Event Handlers & Async Loaders**
Used in pages that fetch data and pass handlers to child components:
```jsx
// ShopReturns.jsx - prevent unnecessary rerenders of callback-dependent children
const loadReturns = useCallback(async () => {
  setLoading(true);
  try {
    const res = await apiGet("/api/shop/returns");
    setReturns(res);
  } catch (err) {
    setError(err.message);
  }
}, []);
```
- **When to use**: Async data loaders, handlers passed to children
- **When NOT to use**: Inline event handlers (React optimizes simple cases)

### **Browser Cache Clearing for Real-Time Updates**
ShopMallPreview uses PWA cache busting:
```jsx
useEffect(() => {
  // Clear browser cache for mall endpoints on mount
  if (typeof window !== 'undefined' && window.caches) {
    window.caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        if (cacheName.includes('mall') || cacheName.includes('shop')) {
          window.caches.delete(cacheName);
        }
      });
    });
  }
}, [shopId]);
```
- **Why**: PWA service worker caches responses; need explicit cache busting for live updates
- **Usage**: Pages that display frequently-updated data (mall, products, orders)

### **Data Fetching Patterns**
All data fetching uses `useEffect` with cleanup:
```jsx
useEffect(() => {
  let live = true;  // Prevents state updates after unmount
  
  const loadData = async () => {
    try {
      const data = await apiGet("/api/...");
      if (live) setData(data);  // Only update if component still mounted
    } catch (err) {
      if (live) setError(err);
    }
  };
  
  loadData();
  
  return () => { live = false; };  // Cleanup: mark component as unmounted
}, [dependency]);
```
- **Why**: Prevents memory leaks when component unmounts during async operation
- **Pattern**: Used in ProductDetailsUnified, Feed, MyOrders, and most data-loading pages

### **Image Optimization**
- **toAbsUrl()** intelligently routes images:
  - Localhost → production backend URL (prevents dev/prod mismatch)
  - Cloudinary → pass-through (already optimized)
  - Relative → resolve against API_BASE
- **No image lazy-loading library**: Rely on browser `loading="lazy"` attribute

### **LocalStorage Cart Caching**
Cart stored locally per user to avoid API calls on every page:
```jsx
function getUserCartKey() {
  const user = JSON.parse(localStorage.getItem("userObj") || "{}");
  return `cart_items_${user._id}`;  // User-specific key prevents collisions
}
```
- **Why**: Cart persists across page navigation without server calls
- **Pattern**: Read on page load, write after mutations

## ⚠️ Common Pitfalls
1. **Using `fetch` directly** → Use `apiGet/Post` instead.
2. **Not wrapping image URLs in `toAbsUrl()`** → Images fail in prod.
3. **Storing text without `t("key")`** → Breaks i18n (Arabic RTL fails).
4. **Mixing token types** → Admin/shop tokens never work in user frontend.
5. **Not handling 401 errors** → Sessions don't auto-logout.
6. **Using `process.env` instead of `import.meta.env`** → Vite won't substitute values (build issue).
7. **Not memoizing expensive computations** → Causes unnecessary rerenders on every parent update.
8. **Not cleaning up async in useEffect** → Memory leaks when component unmounts during fetch.
9. **Forgetting cache cleanup in PWA** → Stale data persists after updates.
10. **Storing sensitive data in localStorage** → Use `userToken` only; never store personal details unencrypted.


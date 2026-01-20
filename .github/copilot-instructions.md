# Copilot Instructions: User Frontend (Vite)

**See `backend/.github/copilot-instructions.md` for system architecture, models, backend auth flow, and shared patterns.**

## Multi-Frontend Architecture Overview

This project has **three separate frontend applications** sharing one backend:

| Frontend | Purpose | Token | Port (Dev) | Auth Routes |
|----------|---------|-------|------------|-------------|
| **User Frontend** (this) | Customer marketplace, shopping, social feed | `userToken` | 5173 | `/api/auth/*`, `/api/users/*` |
| **Shop Frontend** | Vendor dashboard, product/order management | `shopToken` | 3001 | `/api/shop/*` |
| **Admin Frontend** | Moderation, approvals, analytics | `adminToken` | 3002 | `/api/admin/*` |

### Critical Token Isolation Rules
- **NEVER access `shopToken` or `adminToken` in user frontend** — localStorage keys are isolated per frontend
- **NEVER call `/api/shop/*` or `/api/admin/*` endpoints** from user frontend — backend will reject with 401/403
- **Public endpoints** (`/api/public/*`) are accessible without tokens from all frontends
- **Shop viewing**: Users view shops via public routes (`/shop/:shopId`) using `/api/public/shops/:id` endpoint

### Cross-Frontend Interactions
1. **User → Shop** (viewing only): User frontend displays shop pages using public API endpoints
2. **User → Product** (viewing/purchasing): Uses public product endpoints + authenticated cart/order endpoints
3. **Shop → User** (messaging): Shop owners message customers via shared `/api/messages/*` endpoint (auth determines role)
4. **No direct frontend-to-frontend communication**: All data flows through backend API

### When Working in User Frontend
- ✅ Use only `getUserToken()`, `setUserSession()`, `clearUserSession()` from `api.jsx`
- ✅ Call endpoints: `/api/auth/*`, `/api/users/*`, `/api/public/*`, `/api/cart/*`, `/api/orders/*`, `/api/messages/*`
- ❌ Never import or reference shop/admin frontend code
- ❌ Never use `shopToken`, `adminToken`, or shop/admin API functions

## User Frontend Quick Facts

- **Stack**: React 18+ (Vite), React Router v6+, Tailwind CSS v4, Framer Motion, Lucide React, Fetch API
- **Purpose**: Customer marketplace UI for product browsing, shopping, orders, reviews, messaging, user profile, referral system
- **API Integration**: Centralized in `src/api.jsx` (1055+ lines, 48+ API functions)
- **Auth**: `userToken` stored in localStorage, validated via `ProtectedRoute` guard
- **Ports**: Dev runs on `http://localhost:5173` (Vite dev server)
- **Entry**: `src/main.jsx` → `src/App.jsx` (all routing, error boundary)
- **Relative imports**: All imports use `../` (no absolute path aliases)
- **Deployment**: Vercel with SPA routing (`vercel.json` rewrites all to `/index.html`)
- **Error Handling**: Global `ErrorBoundary` in `App.jsx` prevents blank screens

## Development Setup

```bash
cd user-frontend/user-frontend-vite
npm install
npm run dev                      # Opens http://localhost:5173
# Also set backend URL in .env
```

**.env file**:
```env
VITE_API_BASE=http://localhost:5000
# OR production: https://moondala-backend.onrender.com
```

## Vite-Specific Patterns

- **Environment variables**: Use `import.meta.env.VITE_*` (not `process.env`)
- **API base detection**: `src/api.jsx` auto-detects production domain (moondala.one → uses Render backend)
- **HMR**: Vite hot module reload is automatic in dev mode
- **Build**: `npm run build` outputs to `dist/`, includes optimization/minification

## Authentication Flow

1. **First visit** → `/` or `/login` redirects to `SplitAuthPage.jsx`
2. Choose user/shop login or register
3. **User login**: `loginUser(email, password)` POSTs to `/api/auth/login`
4. Backend returns `{token, user}` object
5. `setUserSession({token, user})` stores both to localStorage (`userToken` for token, `user` for JSON)
6. Redirect to `/` (dashboard/feed)
7. `ProtectedRoute` checks `localStorage.getItem('userToken')` — if valid, renders page; else redirects to login
8. **Logout**: `clearUserSession()` atomically clears both

**Key token helpers** (all in `src/api.jsx`):
- `getToken()` or `getUserToken()` — get current token
- `setToken(token)` — store token
- `clearToken()` — remove token
- `setUserSession({token, user})` — atomic store both
- `clearUserSession()` — atomic clear both

## API Layer Pattern (`src/api.jsx`)

Centralized fetch wrapper functions with automatic token injection:
```javascript
export async function apiGet(endpoint) {
  const token = getToken();
  const res = await fetch(joinUrl(API_BASE, endpoint), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw makeHttpError(res, await parseJsonSafe(res));
  return res.json();
}

export async function apiPost(endpoint, body) {
  const token = getToken();
  const res = await fetch(joinUrl(API_BASE, endpoint), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw makeHttpError(res, await parseJsonSafe(res));
  return res.json();
}
```

**48+ API functions** for:
- Auth: `loginUser()`, `registerUser()`, `logoutUser()`
- Feed: `fetchFeed()`, `getPost()`, `likePost()`, `commentOnPost()`
- Products: `searchProducts()`, `getProduct()`, `getProductReviews()`
- Shop: `getShop()`, `followShop()`, `unfollowShop()`
- Cart: `getCart()`, `addToCart()`, `removeFromCart()`, `checkout()`
- Orders: `getMyOrders()`, `getOrderDetails()`, `cancelOrder()`, `submitReturn()`
- Messages: `getConversations()`, `getMessage()`, `sendMessage()`
- User: `getProfile()`, `updateProfile()`, `uploadAvatar()`

## Route Structure

```
/                               ProtectedRoute → AppLayout (sidebar, topbar, mobile nav)
  ├── /                         UserDashboard (feed/home)
  ├── /mall                     Mall (product browsing/search)
  ├── /shop/:shopId             ShopDetails (shop page)
  ├── /product/:productId       ProductDetailsUnified (product detail)
  ├── /cart                     Cart (shopping cart)
  ├── /checkout                 CheckoutPage
  ├── /orders                   MyOrders (order history)
  ├── /earn-more                EarnMore (referral system - NEW)
  ├── /profile                  Profile (user profile)
  ├── /messages                 Messages (inbox)
  ├── /notifications            Notifications
  ├── /settings                 Settings
  ├── /friends                  Friends
  ├── /search                   Search (global search)
  ├── /refer/user/:code         UserReferralSignup (redirect handler)
  ├── /refer/shop/:code         ShopReferralSignup (redirect handler)
  └── /login (+ /register)      SplitAuthPage (unprotected)
  └── /_probe                   Health check (always available)
```

All routes except `/login`, `/register`, `/refer/*`, and `/_probe` are protected.

## Component & File Structure

- **Entry**: `src/main.jsx` (mounts App), `src/App.jsx` (all routes, error boundary)
- **Layout**: `src/components/AppLayout.jsx` (sidebar, topbar, mobile nav, nested routes)
- **Pages** (`src/pages/`): Full views like `UserDashboard.jsx`, `Mall.jsx`, `MyOrders.jsx`, `EarnMore.jsx`
- **Components** (`src/components/`): Reusable UI (ProductCard, Comment, Post, StarRating, etc.)
- **Hooks** (`src/hooks/`): Custom React hooks for shared logic (if exists)
- **Utils** (`src/utils/`): Helper functions (formatters, validators, etc.)
- **Styling**: Tailwind CSS v4 + custom CSS in `src/styles/` (theme.css, app.css, component-specific CSS)
- **Error Boundary**: `App.jsx` has global `ErrorBoundary` class component to catch rendering errors

### Key Components
- **ProtectedRoute.jsx**: Checks `userToken` in localStorage, redirects to `/login` if missing
- **AppLayout.jsx**: Main layout with sidebar navigation (Sidebar.jsx) and top bar (TopBar.jsx/UserTopBar.jsx)
- **Sidebar.jsx**: Navigation menu with links (Home, Mall, Cart, Earn More, Messages, Profile, Settings, etc.)
- **ProductDetailsUnified.jsx**: Unified product detail page with reviews, cart integration, shop info
- **EarnMore.jsx**: Referral system page with QR codes, social sharing, dual tabs (user/shop invitations)

## Common User Workflows

### Fetch user's orders
```javascript
import { apiGet } from '../api';

useEffect(() => {
  async function loadOrders() {
    try {
      setLoading(true);
      const orders = await apiGet('/orders/mine');
      setOrders(orders.items || orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  loadOrders();
}, []);
```

### Add item to cart
```javascript
import { apiPost } from '../api';

const handleAddToCart = async (productId, quantity) => {
  try {
    const result = await apiPost('/cart/add', { productId, quantity });
    setSuccess('Added to cart!');
  } catch (err) {
    setError(err.message);
  }
};
```

### Search products
```javascript
import { apiGet } from '../api';

const handleSearch = async (query) => {
  try {
    const results = await apiGet(`/public/search?q=${query}&type=products`);
    setProducts(results.data || results);
  } catch (err) {
    setError(err.message);
  }
};
```

### Upload user avatar
```javascript
import { apiPostFormData } from '../api';

const handleAvatarUpload = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    const result = await apiPostFormData('/user-profile/upload-avatar', formData);
    setAvatarUrl(result.avatarUrl);
  } catch (err) {
    setError(err.message);
  }
};
```

## Critical Development Patterns

### Image URL Handling
**ALWAYS use `toAbsUrl()` for all backend image paths**:
```javascript
import { toAbsUrl } from '../api.jsx';

// Convert relative paths to absolute URLs
const avatarUrl = toAbsUrl(user?.avatarUrl);  // /uploads/avatar.jpg → https://backend.com/uploads/avatar.jpg
const productImage = toAbsUrl(product?.image); // handles localhost:5000 conversions too
```

**Image extraction helper** (see `ProductDetailsUnified.jsx` lines 66-79):
```javascript
function pickImages(product) {
  const arr = [];
  if (product?.image) arr.push(product.image);
  if (product?.imageUrl) arr.push(product.imageUrl);
  if (Array.isArray(product?.images)) arr.push(...product.images);
  // ... checks all possible image field variations
  return Array.from(new Set(arr.filter(Boolean).map(toAbsUrl).filter(Boolean)));
}
```

### Token Management - CRITICAL
**Never mix user/shop/admin tokens**:
```javascript
// ✅ CORRECT - User frontend only
function getUserTokenOnly() {
  try {
    return localStorage.getItem("userToken") || localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

// ❌ WRONG - Don't access shopToken or adminToken in user frontend
const token = localStorage.getItem("shopToken"); // NO!
```

### Cart Handling with User-Specific Keys
```javascript
function getUserCartKey() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?._id || user?.id || "guest";
    return `cart_items_${userId}`;  // Prevents cart conflicts between users
  } catch {
    return "cart_items_guest";
  }
}

function readCart() {
  const key = getUserCartKey();
  return JSON.parse(localStorage.getItem(key) || "[]");
}
```

### Safe Data Extraction Helpers
**Pattern used throughout** (see `ProductDetailsUnified.jsx`, `AppLayout.jsx`):
```javascript
// Safe string extraction
function safeName(user) {
  const displayName = String(user?.displayName || "").trim();
  const fn = String(user?.firstName || "").trim();
  const ln = String(user?.lastName || "").trim();
  return displayName || `${fn} ${ln}`.trim() || "User";
}

// Safe number parsing
function safeNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Clean user input (XSS prevention)
function cleanId(value) {
  const s = String(value || "").replace(/[<>]/g, "").trim();
  const noColon = s.startsWith(":") ? s.slice(1) : s;
  return noColon;
}
```

### Error Boundary Pattern
**All page components** should be wrapped in `App.jsx`'s ErrorBoundary (already configured):
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false, message: "", stack: "" };
  
  static getDerivedStateFromError(err) {
    return {
      hasError: true,
      message: String(err?.message || "Unknown error"),
      stack: String(err?.stack || "")
    };
  }
  
  componentDidCatch(err, info) {
    console.error("[App ErrorBoundary]", err, info.componentStack);
  }
  
  render() {
    if (!this.state.hasError) return this.props.children;
    return <div>❌ Error: {this.state.message}</div>;
  }
}
```

### API Request Pattern - REQUIRED
**Use centralized API functions from `src/api.jsx`** (don't call fetch directly):
```javascript
import { apiGet, apiPost, apiPut, apiDelete } from '../api.jsx';

// ✅ CORRECT
const data = await apiGet('/products/123');
const result = await apiPost('/cart/add', { productId, quantity });

// ❌ WRONG - Don't bypass API layer
const res = await fetch(`${API_BASE}/api/products/123`);  // NO!
```

### Referral System Integration
**EarnMore page** demonstrates QR code generation and social sharing:
```javascript
import QRCode from 'qrcode';

// Generate QR code
const generateQR = async (url) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H'
    });
    return qrDataUrl;
  } catch (err) {
    console.error('QR generation failed:', err);
    return null;
  }
};

// Download QR code
const downloadQR = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
};
```

## Styling & CSS

- **Tailwind CSS v4** configured in `tailwind.config.js` (PostCSS pipeline)
- **Custom CSS modules** in `src/styles/` (19 CSS files for component-specific styling):
  - `theme.css` — CSS variables for colors, spacing, typography
  - `app.css` — Global app styles
  - `appLayoutModern.css`, `Sidebar.css`, `userTopBar.css` — Layout components
  - Component-specific: `productDetailsUnified.css`, `cart.css`, `Mall.css`, `messages.css`, etc.
  - `readabilityFix.css` — Accessibility and typography improvements
- **Import pattern**: Import CSS files in component files (`import "../styles/componentName.css"`)
- **Utility classes**: Tailwind classes for responsive design, spacing, colors
- **Custom colors**: Extended in `tailwind.config.js` (purple-950, slate-900/950, yellow-300/400)
- **Icons**: Lucide React (`lucide-react` package) for consistent SVG icons
- **Animations**: Framer Motion (`framer-motion`) for page transitions and interactive elements

No CSS-in-JS; use Tailwind utility classes and `.css` files.

## Error Handling & Boundaries

- **Error boundary** in `src/App.jsx` catches React errors, displays fallback UI
- **API errors**: `makeHttpError()` creates consistent error with `.message` property
- **Auth errors** (401/403): Automatically redirect to `/login`, clear session
- **Network errors**: Catch in try-catch, display user-friendly message

## Debugging Tips

- **localStorage inspection**: DevTools → Application → localStorage → check `userToken` and `user` keys
- **Network tab**: Verify `Authorization: Bearer <token>` header is sent
- **Token not saving**: Use `getToken()` in browser console to verify
- **Vite hot reload issues**: Stop dev server, delete `node_modules/.vite`, restart
- **CORS errors**: Check backend `app.js` allowed origins
- **API base not detected**: Check `.env` has `VITE_API_BASE`, or verify window.location fallback logic
- **Page won't load**: Check `ProtectedRoute` logic; verify token is present and valid

## Adding a New User Feature

1. **Create page** `src/pages/NewFeaturePage.jsx`
2. **Add API function(s)** to `src/api.jsx`: Use `apiGet()`, `apiPost()`, etc.
3. **Register route** in `src/App.jsx` (inside or outside ProtectedRoute)
4. **Add navigation** link in `src/components/AppLayout.jsx`
5. **Import components** and styling (Tailwind + custom CSS)
6. **Test**: Navigate to route, verify data loads, token is sent, errors handled

## Key Gotchas

- **Never cache token in state**: Always call `getToken()` at request time
- **Always use `setUserSession()` on login**: Sets both token and user object atomically
- **Always use `clearUserSession()` on logout**: Clears both atomically
- **Token header format**: Must be `Bearer <token>` (note capitalization and space)
- **Use `import.meta.env` not `process.env`**: Vite-specific environment access
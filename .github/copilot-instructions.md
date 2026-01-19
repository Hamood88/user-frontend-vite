# Copilot Instructions: User Frontend (Vite)

**See `backend/.github/copilot-instructions.md` for system architecture, models, backend auth flow, and shared patterns.**

## User Frontend Quick Facts

- **Stack**: React 18+ (Vite), React Router v6+, Tailwind CSS v4, Framer Motion, Lucide React, Fetch API
- **Purpose**: Customer marketplace UI for product browsing, shopping, orders, reviews, messaging, user profile
- **API Integration**: Centralized in `src/api.jsx` (999+ lines)
- **Auth**: `userToken` stored in localStorage, validated via `ProtectedRoute` guard
- **Ports**: Dev runs on `http://localhost:5173` (Vite dev server)
- **Entry**: `src/main.jsx` → `src/App.jsx` (all routing, error boundary)
- **Relative imports**: All imports use `../` (no absolute path aliases)
- **Deployment**: Vercel (GitHub repo: `Hamood88/user-frontend-vite`)

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
  ├── /shop/:shopId             ShopDetails
  ├── /product/:productId       ProductDetailsUnified
  ├── /cart                     CartPage
  ├── /checkout                 CheckoutPage
  ├── /orders                   OrdersPage
  ├── /orders/:orderId          OrderDetailsPage
  ├── /profile                  UserProfilePage
  ├── /messages                 MessagesPage
  ├── /messages/:userId         ConversationPage
  └── /login (+ /register)      SplitAuthPage (unprotected)
  └── /_probe                   Always available (health/debug)
```

All routes except `/login` and `/_probe` are protected.

## Component & File Structure

- **Entry**: `src/main.jsx` (mounts App), `src/App.jsx` (all routes, error boundary)
- **Layout**: `src/components/AppLayout.jsx` (sidebar, topbar, mobile nav, nested routes)
- **Pages** (`src/pages/`): Full views like `UserDashboard.jsx`, `Mall.jsx`, `OrdersPage.jsx`
- **Components** (`src/components/`): Reusable UI (ProductCard, OrderItem, ReviewForm, etc.)
- **Hooks** (`src/hooks/`): Custom React hooks for shared logic
- **Utils** (`src/utils/`): Helper functions (formatters, validators, etc.)
- **Styling**: Tailwind CSS v4 in `tailwind.config.js`, custom CSS in `src/styles/`

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

## Styling & CSS

- **Custom CSS** in `src/styles/` directory (theme.css, app.css, Sidebar.css, readabilityFix.css)
- **Component styles** in dedicated CSS files or inline styles
- **Theme colors**: Defined in `src/styles/theme.css` as CSS variables
- **Import CSS**: `src/index.css` imports global styles
- **Lucide Icons**: For SVG icons (`lucide-react` package)

No CSS-in-JS;Tailwind v4

- **Tailwind CSS v4** configured in `tailwind.config.js` (PostCSS pipeline)
- **Custom styles** in `src/styles/` or inline `className=""` attributes
- **Import CSS**: `src/index.css` (auto-imported by Vite)
- **Framer Motion**: For animations (`framer-motion` package)
- **Lucide Icons**: For SVG icons (`lucide-react` package)

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
# Copilot Instructions: User Frontend (Vite)

**Context**: This is the ACTIVE User Frontend (`user-frontend-vite-temp`).
**Status**: The folder `user-frontend` is LEGACY/DEPRECATED. Do not edit it.

## Architecture

- **Stack**: React 18, Vite 7, Tailwind v4.
- **Router**: React Router v6 (`react-router-dom`).
- **Port**: `5173`.
- **Auth**: `userToken` (LocalStorage).
- **Backend Reference**: See `../backend/.github/copilot-instructions.md`.

## Setup & Run
```bash
cd user-frontend-vite-temp
npm install
npm run dev       # Runs on http://localhost:5173
```

**.env configuration**:
```env
VITE_API_BASE=http://localhost:5000
# Production: https://moondala-backend.onrender.com
# User frontend uses import.meta.env.VITE_*
```

## Key Feature Patterns

### 1. Earn More (Referrals)
- **Docs**: See `EARN_MORE_FEATURE.md` in root for implementation details.
- **Components**: `EarnMore.jsx` (Dual tabs for User/Shop invites).
- **QR Codes**: Client-side generation with error correction using `qrcode` package.
- **Routes**: `/earn-more`, `/refer/user/:code` (signup), `/refer/shop/:code`.
- **API**: Uses `/api/users/me/referral-stats` for stats.

### 2. Unified Product Details
- **Page**: `ProductDetailsUnified.jsx` (`/product/:id`).
- **CSS**: `src/styles/productDetailsUnified.css` + Tailwind.
- **Features**: Chat with buyer ("Ask Previous Buyer"), Aggregated ratings, Shop auto-follow logic.

### 3. Messaging Implementation
- **Context**: `ShopNotificationsContext` creates polling for unread counts.
- **API**: `/api/messages` & `/api/conversations`.
- **Route**: `/messages` (Thread list) -> `/messages/:conversationId`.

### 4. Internationalization (i18n)
- **Library**: `i18next`, `react-i18next`
- **Languages**: English, Arabic (RTL support)
- **Files**: `public/locales/{en,ar}/translation.json`
- **Usage**: `const { t } = useTranslation();`

## Developer Workflows

### API Interaction (`src/api.jsx`)
- **No Axios**: Use `apiGet`, `apiPost`, `apiPut`, `apiDelete` wrappers (built on `fetch`).
- **Base URL**: Auto-resolved from `VITE_API_BASE`.
- **Production Fallback**: `detectProdApiBaseFallback()` logic hardcodes `moondala-backend.onrender.com` if hostname is `moondala.one`.
- **Images**: **MANDATORY**: Use `toAbsUrl(path)` for `src`.
    - Handles `localhost:5000` -> backend URL replacement.
    - Handles `cloudinary` paths (e.g. `dohetomaw/video/...`).
    - Cloud name for Moondala: `dohetomaw`.

### Styling Strategy
- **Primary**: Tailwind CSS v4 (No `tailwind.config.js` needed for v4 defaults, but check `src/index.css` for `@theme`).
- **Custom**: CSS files in `src/styles/*.css` (e.g. `appLayoutModern.css`) for complex animations/layouts.
- **Icons**: `lucide-react`.
- **Animations**: `framer-motion` v12.

### Adding a New Page
1.  Create `src/pages/NewPage.jsx`.
2.  Add route in `src/App.jsx`.
    - Protected: Inside `<ProtectedRoute>`.
    - Public: Outside wrapper.
3.  Add navigation link in `src/components/AppLayout.jsx` or specialized navs.

## Critical Rules
1.  **Directory Awareness**: Confirm you are in `user-frontend-vite-temp/`, not the legacy `user-frontend/` folder.
2.  **No Vendor/Admin Access**: Never call `/api/shop/*` or `/api/admin/*`. User frontend strictly uses `/api/users/*` and `/api/public/*`.
3.  **Token Hygiene**: Use `setUserSession({ token, user })` to update auth state atomically; use `clearUserSession()` to clear both.
4.  **Referral Logic**: QR codes are generated client-side; referral codes are tracked via `referredBy` in the `User` model on the backend.
5.  **Image Resolution**: Use `toAbsUrl()` for ALL image/video sources. It handles localhost→backend URL replacement and Cloudinary paths automatically.
6.  **Vite vs CRA**: This project uses `import.meta.env.VITE_*` (NOT `process.env`). env files: `.env`, `.env.local`.

## Deployment
- **Platform**: Vercel (https://moondala.one)
- **Build Command**: `npm run build` (outputs to `dist/`)
- **Environment Variables**: Set in `vercel.json` or Vercel dashboard.
- **Error Boundary**: `App.jsx` contains a top-level `ErrorBoundary` to catch crashes and direct users to `/_probe`.

## Common Patterns

### Authentication Flow
```javascript
// Login
const { token, user } = await loginUser(email, password);
setUserSession({ token, user });

// Logout
clearUserSession(); // Atomically removes token & user data
```

### Data Fetching
```javascript
import { apiGet } from '../api';

useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const data = await apiGet('/products'); // auto-attaches token
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  }
  fetchData();
}, []);
```

### Image Display
```javascript
import { toAbsUrl } from '../api';

// ALWAYS use wrapper
<img src={toAbsUrl(user.avatarUrl)} />
<video src={toAbsUrl(post.videoUrl)} />
```

## Advanced Patterns

### Protected Routes
- `ProtectedRoute` component checks `localStorage.getItem('userToken')` on every render
- If missing: redirects to `/login` automatically
- Use inside `<Route>`: `<Route element={<ProtectedRoute><MyPage /></ProtectedRoute>} />`

### Error Boundaries & Crash Recovery
- `App.jsx` has a top-level `ErrorBoundary` that catches React errors
- Displays error details for debugging; offers link to `/_probe` health check
- Helps developers debug crashes without blank white screens

### API Error Handling
- 401/403 responses automatically trigger `clearUserSession()` and redirect to login
- No manual logout needed in components — API layer handles it
- Catch network errors: Check browser console, verify backend running, verify CORS in `backend/app.js`

# Copilot Instructions: User Frontend (Vite)

**Context**: This is the ACTIVE User Frontend (`user-frontend-vite-temp`).
**Status**: The folder `user-frontend` is LEGACY/DEPRECATED. Do not edit it.

## Architecture

- **Stack**: React 18, Vite, Tailwind v4, Framer Motion, Lucide React.
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
- **Core Integrations**:
    - **Messaging**: "Ask Previous Buyer" feature.
    - **Reviews**: Aggregated rating display.
    - **Shop**: Auto-follow logic on purchase (optional).

### 3. Messaging Implementation
- **Context**: `ShopNotificationsContext` creates polling for unread counts.
- **API**: `/api/messages`.
- **Route**: `/messages` (Thread list) -> `/messages/:conversationId`.

### 4. Internationalization (i18n)
- **Library**: `i18next`, `react-i18next`
- **Languages**: English, Arabic (RTL support)
- **Translation Files**: `public/locales/{lang}/translation.json`
- **Usage**: `import { useTranslation } from 'react-i18next';` then `const { t } = useTranslation();`

## Developer Workflows

### API Interaction (`src/api.jsx`)
- **Base URL**: Auto-resolved from `VITE_API_BASE`.
- **Production Fallback**: Built-in logic `detectProdApiBaseFallback()` sets base to `moondala-backend.onrender.com` if hosted on `moondala.one`.
- **Wrappers**: Use `apiGet`, `apiPost`, `apiPut`, `apiDelete`.
    - Automatically attaches `Authorization: Bearer <userToken>`.
    - Throws consistent error objects.
- **Images**: **MANDATORY**: Use `toAbsUrl(path)` for `src`.
    - Automatically fixes `localhost` vs `cloudinary` vs relative paths.
    - Resolves `/uploads/cloudname/...` to Cloudinary absolute URLs.
    - Cloud name for Moondala: `dohetomaw`

### Styling
- **Tailwind**: Primary styling method (utility classes). Uses Tailwind v4.
- **Custom CSS**: `src/styles/` for specific animations or complex layouts.
- **Icons**: Import from `lucide-react`.
- **Animations**: Framer Motion for complex animations.

### Adding a New Page
1.  Create `src/pages/NewPage.jsx`.
2.  Add route in `src/App.jsx` (inside or outside `ProtectedRoute` wrapper).
3.  Add navigation link in `src/components/AppLayout.jsx` or other navigation component.

## Critical Rules
1.  **Work Directory**: Ensure you are in `user-frontend-vite-temp/`.
2.  **No Vendor/Admin Access**: Never call `/api/shop/*` or `/api/admin/*`.
3.  **Token Hygiene**: Use `setUserSession({ token, user })` to update auth state atomically. Never touch `shopToken` or `adminToken`.
4.  **Legacy Warning**: Ignore the `user-frontend/` directory completely. It uses old API patterns.
5.  **Referral Logic**: QR codes are generated client-side; referral codes are tracked via `referredBy` in the `User` model on the backend.
6.  **Image URLs**: Always use `toAbsUrl()` for all image sources to handle localhost/Cloudinary conversion.

## Deployment
- **Platform**: Vercel (https://moondala.one)
- **Build Command**: `npm run build` (outputs to `dist/`)
- **Environment Variables**: Set in `vercel.json` or Vercel dashboard
    - `VITE_API_BASE=https://moondala-backend.onrender.com`
    - `VITE_USER_APP_URL=https://moondala.one`
    - `VITE_SHOP_APP_URL=https://shop.moondala.one`
- **Routing**: SPA routing configured in `vercel.json` (all routes → `index.html`)

## Common Patterns

### Authentication Flow
```javascript
// Login
const { token, user } = await loginUser(email, password);
setUserSession({ token, user });

// Check auth status
const token = getToken();
if (!token) redirectToLogin();

// Logout
clearUserSession();
```

### Data Fetching
```javascript
import { apiGet, apiPost } from '../api';

useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const data = await apiGet('/products');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

### Image Display
```javascript
import { toAbsUrl } from '../api';

// Product images
<img src={toAbsUrl(product.image)} alt={product.name} />

// User avatars
<img src={toAbsUrl(user.avatarUrl)} alt={user.name} />

// Cloudinary videos (auto-detected)
<video src={toAbsUrl(post.videoUrl)} />
```

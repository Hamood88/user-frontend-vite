# Moondala User Frontend (Vite)

**Active customer marketplace** for the Moondala e-commerce platform.

## Quick Start

```bash
npm install
npm run dev  # Opens http://localhost:5173
```

## Environment Setup

Create a `.env` file in this directory:

```env
REACT_APP_API_BASE=http://localhost:5000
# Production: https://moondala-backend.onrender.com
```

## Architecture

- **Stack**: React 18 (Vite), React Router v6, Tailwind CSS v4
- **Auth**: `userToken` in localStorage (strict isolation from shop/admin)
- **API**: Centralized in `src/api.jsx` (1000+ lines, 50+ functions)
- **Deployment**: Vercel → https://moondala.one

## Key Features

- Product browsing & search (Mall)
- Shopping cart & checkout
- Order tracking & returns
- User-to-user messaging
- Ask previous buyers (product Q&A)
- Referral system (multi-level)
- Social feed & friends

## Important Patterns

### Always Use API Helpers
```javascript
import { apiGet, apiPost, toAbsUrl } from './api.jsx';

// ✅ Correct
const data = await apiGet('/products/123');
const imgUrl = toAbsUrl(product.image);

// ❌ Wrong
const res = await fetch(`${API_BASE}/api/products/123`); // NO!
```

### Image URLs Must Use toAbsUrl()
```javascript
// ✅ Handles /uploads/..., Cloudinary, localhost conversions
<img src={toAbsUrl(user.avatarUrl)} />

// ❌ Will break in production
<img src={user.avatarUrl} />
```

### Token Management
```javascript
// ✅ Use session helpers (never manual localStorage access)
setUserSession({ token, user });
const token = getToken();
clearUserSession();

// ❌ Never mix with shop/admin tokens
localStorage.getItem('shopToken'); // WRONG FRONTEND!
```

## Documentation

For detailed development guidance, see:
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - **Full developer guide**
- [backend/.github/copilot-instructions.md](../backend/.github/copilot-instructions.md) - Backend patterns

## Available Scripts

- `npm run dev` - Start dev server (port 5173)
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally

---

**Note**: This is the **active** user frontend. Do not use the legacy `user-frontend/` directory.

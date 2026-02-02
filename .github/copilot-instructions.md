# Copilot Instructions: User Frontend (Vite)

**Status**: ✅ ACTIVE.
**Port**: 5173 (dev), `moondala.com` (prod).

> **⚠️ CRITICAL WARNING**: The folder `../user-frontend` is DEPRECATED and MUST BE IGNORED.
> **ALWAYS** work in `../user-frontend-vite-temp` (This Directory).

## 🚀 Architecture & Tech Stack
- **Framework**: React 18 + Vite (ES Modules).
- **Styling**: Tailwind CSS v4 + Framer Motion.
- **State**: Local State + API Context.
- **Auth**: `userToken` (LocalStorage).
- **i18n**: `react-i18next` (English/Arabic RTL).

## ⚠️ 5 Non-Negotiable Rules

### 1. API Calls (`src/api.jsx`)
- **Wrapper**: ALWAYS use `apiGet`, `apiPost`, `apiPut`, `apiDelete` from `../api.jsx`.
- **Banned**: NEVER use `fetch` or `axios` directly.
- **Why**: Handles token injection, 401 auto-logout, and API base URL resolution.
- **Example**: `const user = await apiGet("/users/me");`

### 2. Image URLs (`toAbsUrl`)
- **Wrapper**: ALWAYS wrap image paths: `<img src={toAbsUrl(product.image)} />`.
- **Why**: Resolves relative paths (`/uploads/...`) from backend/Cloudinary correctly in all environments.
- **Import**: `import { toAbsUrl } from "../api.jsx";`

### 3. Internationalization (i18n)
- **Mandatory**: All visible text must use `t("key")`.
- **RTL**: Layout must succeed in both LTR (English) and RTL (Arabic).
- **Files**: `public/locales/{en,ar}/translation.json`.

### 4. Token Isolation
- **Storage**: `localStorage.getItem("userToken")`.
- **Forbidden**: NEVER access `shopToken` or `adminToken`.
- **Cart Key**: `cart_items_${userId}` (prevents cross-user cart pollution).

### 5. Environment Variables
- **Vite Pattern**: Use `import.meta.env.VITE_*`.
- **Legacy**: `process.env` does NOT work in Vite.

## 📂 Key Features & Patterns

### Earn More (`src/pages/EarnMore.jsx`)
- **QR Codes**: Client-side generation.
- **Referrals**: Dual-tab (Invite Users / Invite Shops).
- **Data**: Fetched from `/api/users/earnings` and `/api/users/downline-counts`.

### Product Details Unified (`src/pages/ProductDetailsUnified.jsx`)
- **Complex View**: Handles products from Mall, Shops, and Marketplace.
- **Chat**: "Ask Previous Buyer" feature integration.
- **Reviews**: Integrated review component with photo upload.

### Mall Fairness
- **Rotation**: Mall shops rotate based on fairness algorithm (backend).
- **Frontend**: Simply renders the list provided by `/api/mall`.

## 🛠️ Developer Workflows

### Component Creation
1. Use functional components with hooks.
2. Use `useMemo` for expensive calculations (cart totals).
3. Use `useCallback` for functions passed to children.

### Deployment
- **Platform**: Vercel.
- **Config**: `vercel.json` handles SPA rewrites.
- **Env**: Set `VITE_API_BASE` in Vercel.

## 🚨 Common Pitfalls
1. **401 Loops**: API wrapper handles this, don't implement custom 401 logic.
2. **Missing `toAbsUrl`**: Images fail in production.
3. **Hardcoded Text**: Breaks Arabic version.
4. **Memory Leaks**: Cleanup `useEffect` subscriptions or async flags.

# Copilot Instructions: User Frontend (Vite)

**Context**: This is the ACTIVE User Frontend (`user-frontend-vite-temp`).
**Status**: The folder `user-frontend` is LEGACY/DEPRECATED. Do not edit it.

## Architecture

- **Stack**: React 18, Vite, Tailwind v4, Framer Motion, Lucide React.
- **Port**: `5173`.
- **Auth**: `userToken` (LocalStorage).
- **Backend Reference**: See `../backend/.github/copilot-instructions.md`.

## Key Feature Patterns

### 1. Earn More (Referrals)
- **Docs**: See `EARN_MORE_FEATURE.md` in root for implementation details.
- **Components**: `EarnMore.jsx` (Dual tabs for User/Shop invites).
- **QR Codes**: Client-side generation with error correction.
- **Routes**: `/earn-more`, `/refer/user/:code` (signup), `/refer/shop/:code`.

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

### Styling
- **Tailwind**: Primary styling method (utility classes). Uses Tailwind v4.
- **Custom CSS**: `src/styles/` for specific animations or complex layouts.
- **Icons**: Import from `lucide-react`.

## Critical Rules
1.  **Work Directory**: Ensure you are in `user-frontend-vite-temp/`.
2.  **No Vendor/Admin Access**: Never call `/api/shop/*` or `/api/admin/*`.
3.  **Token Hygiene**: Use `setUserSession({ token, user })` to update auth state atomically. Never touch `shopToken` or `adminToken`.
4.  **Legacy Warning**: Ignore the `user-frontend/` directory completely. It uses old API patterns.
5.  **Referral Logic**: QR codes are generated client-side; referral codes are tracked via `referredBy` in the `User` model on the backend.

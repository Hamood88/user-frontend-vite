# Copilot Instructions: User Frontend (Vite)

**See `../backend/.github/copilot-instructions.md` for API/Backend details.**

## Project Overview
- **Type**: React 18+ (Vite).
- **Port**: `5173`.
- **Auth**: `userToken` (LocalStorage).
- **Purpose**: Main customer-facing marketplace.
- **Tech**: React Router v6, Tailwind v4, Framer Motion, Lucide React.
- **Location**: `user-frontend-vite-temp/` (Do NOT use `user-frontend/`).

## Setup
```bash
cd user-frontend-vite-temp
npm install
npm run dev      # http://localhost:5173
```

## Key Features & Architecture

### 1. Referral System ("Earn More")
- **Page**: `EarnMore.jsx`.
- **Logic**: Users invite others via QR/Link (`/refer/user/:code`, `/refer/shop/:code`).
- **Data**: `getReferralNetwork()`, `getTopInviters()`.
- **Structure**: MLM-style ancestors/downlines tracked in Backend `User` model.

### 2. Unified Product Details
- **Page**: `ProductDetailsUnified.jsx`.
- **Route**: `/product/:productId`.
- **Functionality**:
    - "Ask Previous Buyers" (Messaging integration, `setOrderAskConsent`).
    - Reviews (`createProductReview`, `getProductReviews`).
    - Add to Cart (`addToCart`).
    - Shop Info (`followShop`).

### 3. Messaging
- **Page**: `MessagesPage` / `ConversationPage`.
- **API**: `/api/messages`.
- **Types**: User-to-Shop, User-to-User (Ask Buyer), Support.
- **Notifications**: Real-time (polling) via `ShopNotificationsContext` or `useNotifications`.

### 4. Shop Interaction
- **Public Shop View**: `/shop/:shopId`.
- **Follow**: `followShop(shopId)` -> Adds shop to Friends list.
- **Mall View**: Shop's visual builder page is viewable/previewable here.

### 5. Returns
- **API**: `createReturnRequest`.
- **User Flow**: User selects order, reason, uploads photos.

## API Usage (`src/api.jsx`)
- **Base URL**: `VITE_API_BASE` (preferred) or `REACT_APP_API_BASE`.
- **Methods**: `apiGet`, `apiPost`, `apiPut`, `apiDelete`.
- **Authentication**: Auto-injects `Authorization: Bearer <userToken>`.
- **Images**: **ALWAYS** use `toAbsUrl(url)`.

## Critical Developer Rules
1.  **Active Directory**: Only work in `user-frontend-vite-temp`. Ignore `user-frontend` folder.
2.  **Token Safety**: Never touch `shopToken` or `adminToken`.
3.  **Route Safety**: Only call `/api/users/*`, `/api/orders/*`, `/api/public/*`, `/api/auth/*`.
    - Do NOT call `/api/admin/*` or `/api/shop/*` (private vendor routes).
4.  **Styling**: Use Tailwind utility classes. CSS modules only for complex animations/layouts (`src/styles/*.css`).

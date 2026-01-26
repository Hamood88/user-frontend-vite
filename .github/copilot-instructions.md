# Copilot Instructions: User Frontend (Vite)

**Status**: ACTIVE. (Legacy `user-frontend` is DEPRECATED).

## Architecture & Tech Stack
- **Framework**: React 18, Vite 7.
- **Styling**: Tailwind CSS v4, Framer Motion v12.
- **Routing**: React Router v6.
- **Port**: 5173 (Dev).
- **Auth**: `userToken` in LocalStorage.
- **Languages**: English (Source), Arabic (RTL). `i18next`.

## Critical Developer Rules

### 1. Internationalization (i18n)
- **MANDATORY**: ALL visible text must use `t("key")`.
- **Source**: `public/locales/en/translation.json`.
- **Usage**: `const { t } = useTranslation(); <h1>{t("welcome_msg")}</h1>`.

### 2. API Interaction (`src/api.jsx`)
- **Wrapper**: Use `apiGet`, `apiPost`, `apiPut`, `apiDelete`.
- **CORS/Env**: Uses `DEFAULT_BASE` w/ fallbacks for `moondala.one`.
- **Path**: `/api/users/*` or `/api/public/*`. NEVER Admin/Shop APIs.
- **Error Handling**: 401 triggers auto-logout/redirect.

### 3. Image Safety (`toAbsUrl`)
- **MANDATORY**: `src={toAbsUrl(user.avatarUrl)}`.
- **Why**: Handles `localhost:5000` -> Backend URL, AND Cloudinary paths.

### 4. Special Features
- **Earn More**: Referral system (`EarnMore.jsx`). Uses `qrcode` (client-side). See `EARN_MORE_FEATURE.md`.
- **Unified Product Page**: `ProductDetailsUnified.jsx`. Includes "Ask Previous Buyer".

## Cross-Project Context
- **Backend**: `../backend`. Runs on Port 5000.
- **Shop Frontend**: `../shop-frontend`.
- **Admin Frontend**: `../admin-frontend`.

## Deployment (Vercel)
- **Repo**: `user-frontend-vite-temp` folder.
- **Env**: `VITE_API_BASE`.


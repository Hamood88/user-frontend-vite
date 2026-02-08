# Copilot Instructions: User Frontend (Vite + React 18)

## Architecture
Vite React 18 + Capacitor (iOS/Android). Port 5173 (dev), `moondala.com` (prod).
Entry: `index.html` -> `src/main.jsx` -> `App.jsx` (React Router v6).
`../user-frontend` is DEPRECATED -- this is the active user frontend.

## API Calls (MANDATORY wrapper)
Always use `src/api.jsx` helpers -- never raw `fetch()`:
`import { apiGet, apiPost, apiPut, apiDelete } from '../api.jsx'`
Token: `userToken` in localStorage (never access `shopToken`/`adminToken`).
Env: `import.meta.env.VITE_API_BASE` (NOT `process.env.REACT_APP_*`).

## Image URLs (MANDATORY wrapper)
`import { toAbsUrl } from '../api.jsx'` -- wrap ALL `<img src>` tags:
`<img src={toAbsUrl(product.image)} />`
Handles Cloudinary detection, localhost->prod conversion, `/uploads/` paths.

## Internationalization (i18n)
ALL visible text must use `t("key")`:
`import { useTranslation } from 'react-i18next'`
Locale files: `public/locales/en/translation.json` + `public/locales/ar/translation.json`.
RTL auto-handled by Tailwind for Arabic.

## Cart Isolation
Cart stored as `cart_items_`$`{userId}` in localStorage to prevent cross-user pollution.

## Capacitor (Mobile)
- Platform check: `Capacitor.isNativePlatform()` / `Capacitor.getPlatform()`
- External links: use `openExternalLink(url)` from `src/capacitor-init.js`
- Deep links: `https://moondala.com/r/CODE` auto-handled by capacitor-init
- iOS: avoid native `confirm()`/`prompt()` -- use custom modal components instead
- Build: `npm run build` -> `npx cap sync ios|android` -> open in Xcode/Android Studio

## Key Files
- `src/api.jsx` -- 1400+ lines, all API helpers + `toAbsUrl()`
- `src/pages/EarnMore.jsx` -- Referral system (QR codes, dual tabs)
- `src/pages/ProductDetailsUnified.jsx` -- Unified product view
- `src/capacitor-init.js` -- Native plugin setup, deep links
- `capacitor.config.ts` -- App ID: `com.moondala.app`

## Dev Commands
`npm run dev` (port 5173) | Backend must be running on port 5000.

## Adding a Page
1. Create `src/pages/MyPage.jsx` using `apiGet`/`toAbsUrl`/`t()`
2. Add route in `App.jsx`
3. Add translations in `public/locales/{en,ar}/translation.json`

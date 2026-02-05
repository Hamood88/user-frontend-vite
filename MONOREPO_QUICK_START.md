# Moondala Monorepo - AI Agent Quick Start

> **📅 Last Updated**: February 4, 2026  
> **📍 Current Location**: `user-frontend-vite-temp/` (Active User Frontend)  
> **⚡ Context**: Multi-tenant e-commerce with mobile-first architecture

## 🎯 30-Second Orientation

**Moondala**: Social marketplace platform with role-based frontends sharing one backend API.

| Component | Stack | Port | Token | Platform |
|-----------|-------|------|-------|----------|
| **Backend** | Node 18, Express, MongoDB | 5000 | — | moondala-backend.onrender.com |
| **User** | React 18 (Vite) + **Capacitor** | 5173 | `userToken` | Web + iOS + Android |
| **Shop** | React 19 (CRA) | 3001 | `shopToken` | Web only |
| **Admin** | React 18 (Vite) | 3002 | `adminToken` | Web only |

**Critical Principle**: Token isolation prevents cross-role data leaks.

**⚠️ Warning**: Use `user-frontend-vite-temp/` (NOT deprecated `user-frontend/`)

## 🚀 Start Development (Choose Your Service)

```bash
# Backend (Required for all frontends)
cd backend && npm run dev

# User Frontend (This folder - Web + Mobile)
cd user-frontend-vite-temp && npm run dev

# Shop Frontend (Vendor dashboard)
cd shop-frontend && npm start

# Admin Frontend (Platform management)
cd admin-frontend && npm start
```

## 🚨 Non-Negotiable Rules

1. **Token Isolation**: Each frontend uses ONLY its token (`userToken`, `shopToken`, `adminToken`)
2. **Image URLs**: ALWAYS wrap in `toAbsUrl()` from API module
3. **API Calls**: NEVER use direct `fetch()` - use API wrappers (`apiGet`, `apiPost`)
4. **Environment**: Vite uses `import.meta.env.VITE_*`, CRA uses `process.env.REACT_APP_*`
5. **i18n**: ALL user-facing text in User Frontend must use `t("key")` from translations

## 📱 Mobile Development (User Frontend Only)

This folder (`user-frontend-vite-temp`) builds to:
- **Web**: https://moondala.com (PWA)
- **iOS**: App Store (via Xcode)
- **Android**: Google Play (via Gradle)

```bash
# Build web assets
npm run build

# iOS Development
npx cap sync ios      # Copy build to native project
npx cap open ios      # Opens Xcode
# Archive → App Store Connect

# Android Development
npx cap sync android  # Copy build to native project
npx cap open android  # Opens Android Studio
cd android && gradlew bundleRelease  # Creates AAB
```

**Key Files**:
- `capacitor.config.ts` - App config, deep links
- `src/capacitor-init.js` - Native plugin initialization
- `android/` - Native Android project
- `ios/` - Native iOS project

## 📚 Detailed Guides (Read Before Working)

| Working On | Read This First | Lines |
|------------|----------------|-------|
| **User Frontend** | [.github/copilot-instructions.md](.github/copilot-instructions.md) | 400+ |
| **Backend** | [../backend/.github/copilot-instructions.md](../backend/.github/copilot-instructions.md) | 625+ |
| **Shop Frontend** | [../shop-frontend/.github/copilot-instructions.md](../shop-frontend/.github/copilot-instructions.md) | 280+ |
| **Admin Frontend** | [../admin-frontend/.github/copilot-instructions.md](../admin-frontend/.github/copilot-instructions.md) | 240+ |
| **Root Architecture** | [../backend/.github/ROOT_COPILOT_INSTRUCTIONS.md](../backend/.github/ROOT_COPILOT_INSTRUCTIONS.md) | 941+ |
| **Mobile Build** | [android/ANDROID_BUILD_GUIDE.md](android/ANDROID_BUILD_GUIDE.md) | Complete |

## 🔍 Quick Debugging

### Common Issues

| Problem | Quick Fix |
|---------|-----------|
| Images 404 in production | Wrap in `toAbsUrl(path)` |
| 401 Unauthorized loops | Check correct token key in localStorage |
| CORS blocked | Add origin to `backend/app.js` allowedOrigins |
| Mobile build fails | `npx cap sync`, clean Gradle cache |
| Deep link not working | Check `capacitor.config.ts` + manifest files |

### Diagnostic Commands

```bash
# Backend diagnostics
cd backend
node checkDB.js                # DB connection
node checkLeaderboard.js       # Referral stats

# Frontend diagnostics
npm run build                  # Test build process
npx cap doctor                 # Check Capacitor setup

# Mobile-specific
adb devices                    # List Android devices
xcrun simctl list             # List iOS simulators
```

## 💡 Key Features to Know

### Referral System (User Frontend)
- **Page**: `src/pages/EarnMore.jsx`
- **QR Codes**: Client-side generation
- **Deep Links**: `https://moondala.com/r/ABC123`
- **Backend**: `backend/utils/commissions.js`

### Mall Builder (Shop Frontend)
- **Editor**: `shop-frontend/src/pages/ShopMallEdit.jsx`
- **⚠️ Uses absolute positioning** (never convert to flexbox)
- **Drag & Drop**: `@dnd-kit/sortable`

### i18n (User Frontend)
- **Languages**: English, Arabic (RTL support)
- **Files**: `public/locales/{en,ar}/translation.json`
- **Usage**: `const { t } = useTranslation();`

## 🔗 Quick Links

- **Architecture Overview**: [../backend/.github/ROOT_COPILOT_INSTRUCTIONS.md](../backend/.github/ROOT_COPILOT_INSTRUCTIONS.md)
- **Mobile Guide**: [android/ANDROID_BUILD_GUIDE.md](android/ANDROID_BUILD_GUIDE.md)
- **Earn More Feature**: [EARN_MORE_FEATURE.md](EARN_MORE_FEATURE.md)
- **Capacitor Docs**: https://capacitorjs.com/docs

---

**Working in this codebase?** Always check component-specific `.github/copilot-instructions.md` first!

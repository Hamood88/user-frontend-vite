# Copilot Instructions: User Frontend (Vite)

**Status**: ✅ ACTIVE (Port 5173, prod: `moondala.com`).
**CRITICAL**: Folder `../user-frontend` is DEPRECATED—always work here.

> **📍 See Also**: [../backend/.github/copilot-instructions.md](../backend/.github/copilot-instructions.md) for API/Backend details.

## 🚀 Architecture

```
user-frontend-vite-temp (Vite React 18 + Capacitor)
├─ Entry: index.html → src/main.jsx
├─ Router: App.jsx (React Router v6)
├─ API: src/api.jsx (apiGet, apiPost, toAbsUrl)
├─ i18n: public/locales/{en,ar}/translation.json (react-i18next)
├─ State: Local + Context (UserContext for auth)
├─ Styling: Tailwind CSS v4 + Framer Motion
├─ Mobile: Capacitor (iOS + Android native apps)
│   ├─ capacitor.config.ts - App config, deep links
│   ├─ src/capacitor-init.js - Native plugin initialization
│   ├─ android/ - Native Android project (Gradle)
│   └─ ios/ - Native iOS project (Xcode, CocoaPods)
└─ Key Pages: ProductDetailsUnified, EarnMore, Mall, Cart
```

**Token**: `userToken` (localStorage, user role only).  
**Platform**: Web (5173) + iOS App Store + Google Play Store.
**Testing**: ⚠️ No automated test suite enabled. Do not run `npm test`. Rely on manual verification.

## ⚠️ 5 Non-Negotiable Rules

### 1. **API Calls (`src/api.jsx` Wrapper)**
```javascript
// ✅ CORRECT: Use centralized wrapper
import { apiGet, apiPost, apiPut, apiDelete } from '../api.jsx';
const user = await apiGet('/users/me');
const result = await apiPost('/orders', { items: [...] });

// ❌ WRONG: Direct fetch/axios bypass error handling + 401 logic
const user = await fetch(`${API_BASE}/api/users/me`).then(r => r.json());
```

**Why**: Wrapper handles:
- Token injection (`Authorization: Bearer` + `x-auth-token`)
- 401 auto-logout (clears token, redirects to login)
- API base URL resolution (Vite env vars)
- Request/response logging

### 2. **Image URLs (`toAbsUrl` Wrapper)**
```javascript
// ✅ CORRECT: Always wrap backend paths
import { toAbsUrl } from '../api.jsx';
<img src={toAbsUrl(product.image)} />
<img src={toAbsUrl(shop.logo)} />

// ❌ WRONG: Raw paths fail in production
<img src={product.image} />  // breaks when deployed
<img src="/uploads/products/abc123.jpg" />  // localhost-only
```

**Smart Resolution**:
- Detects Cloudinary URLs (keeps as-is)
- Fixes localhost → production backend (avoids mixed content)
- Handles `/uploads/` relative paths
- Works offline (graceful fallback)

### 3. **Internationalization (i18n)**
```javascript
// ✅ CORRECT: All visible text uses t("key")
import { useTranslation } from 'react-i18next';

export function ProductCard({ product }) {
  const { t } = useTranslation();
  return <h2>{t('product.title')}</h2>;
}

// ❌ WRONG: Hardcoded English breaks Arabic version
<h2>Product Details</h2>

// File: public/locales/en/translation.json
{ "product.title": "Product Details" }
// File: public/locales/ar/translation.json
{ "product.title": "تفاصيل المنتج" }
```

**RTL Layout**: Tailwind auto-flips for Arabic (check via browser DevTools).

### 4. **Token Isolation**
```javascript
// ✅ CORRECT: User role only
const token = localStorage.getItem('userToken');

// ❌ WRONG: Never access shop/admin tokens
localStorage.getItem('shopToken');    // BLOCKED
localStorage.getItem('adminToken');   // BLOCKED
```

**Cart Key**: `cart_items_${userId}` (prevents cross-user pollution on shared device).

### 5. **Environment Variables (Vite Pattern)**
```javascript
// ✅ CORRECT: Vite-safe ES module syntax
const apiBase = import.meta.env.VITE_API_BASE;
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// ❌ WRONG: CRA pattern doesn't work in Vite
const apiBase = process.env.REACT_APP_API_BASE;  // undefined
```

**.env file**:
```
VITE_API_BASE=https://moondala-backend.onrender.com
VITE_API_BASE_URL=https://moondala-backend.onrender.com
```

## 🔐 Firebase Phone Authentication (Critical Pattern)

**Security Flow**: Client verifies OTP → Gets Firebase ID token → Backend validates token server-side → Marks user verified

### **Setup Requirements**
1. **reCAPTCHA Container**: MUST exist in DOM before calling `setupRecaptcha()`
```jsx
// In render/return JSX - both login AND signup forms
<div id="recaptcha-container"></div>
```

2. **Firebase Config**: [src/firebase.js](src/firebase.js) - Already configured with production credentials

3. **Utility Module**: [src/utils/firebasePhoneAuth.js](src/utils/firebasePhoneAuth.js) - 6 core functions

### **Authentication Flow (3-Step Pattern)**
```javascript
import { 
  setupRecaptcha, 
  sendVerificationCode, 
  verifyCode,
  getFirebaseIdToken,
  cleanupFirebaseAuth,
  formatPhoneNumber
} from "../utils/firebasePhoneAuth";

// STEP 1: Initialize reCAPTCHA (on component mount)
useEffect(() => {
  setupRecaptcha('recaptcha-container');  // Uses invisible reCAPTCHA
  return () => cleanupFirebaseAuth();     // Cleanup on unmount
}, []);

// STEP 2: Send SMS verification code
const handleRegister = async () => {
  const formattedPhone = formatPhoneNumber(phone, countryCode);  // E.164 format: +12025551234
  const confirmationResult = await sendVerificationCode(formattedPhone);
  // User receives SMS with 6-digit code
  setIsVerifying(true);
};

// STEP 3: Verify code + send to backend
const handleVerify = async (otpCode) => {
  // 3a. Verify with Firebase
  const result = await verifyCode(otpCode);
  
  // 3b. Get ID token (proof of verification)
  const firebaseToken = await getFirebaseIdToken();
  
  // 3c. Backend validates token server-side
  const res = await apiPost("/auth/verify-phone", { 
    email: userEmail, 
    firebaseToken 
  });
  
  // Backend extracts phone number from token + marks user.isPhoneVerified = true
};
```

### **Backend Verification** (`/api/auth/verify-phone`)
```javascript
// Backend receives Firebase token (NOT raw phone number)
// Uses Firebase Admin SDK to verify token authenticity
const decodedToken = await verifyFirebaseToken(firebaseToken);
const verifiedPhone = decodedToken.phone_number;  // Extracted by Firebase

// Update user
user.phoneNumber = verifiedPhone;
user.isPhoneVerified = true;
await user.save();
```

**Why This Pattern?** 
- Security: Backend never trusts client-sent phone numbers
- Firebase Admin SDK validates token signature server-side
- Phone number extraction from verified token (not user input)
- Prevents spoofing attacks

### **Common Firebase Issues**
| Problem | Cause | Fix |
|---------|---------|-----|
| "reCAPTCHA container not found" | setupRecaptcha called before DOM ready | Call in useEffect + ensure `<div id="recaptcha-container">` exists |
| "No confirmation result" | Code sent but confirmationResult lost | Check `window.confirmationResult` persists between sends |
| Invalid phone format | Missing + or country code | Use `formatPhoneNumber(phone, countryCode)` |
| SMS not received | Firebase quota exceeded OR invalid number | Check Firebase Console quota + verify E.164 format |
| "auth/invalid-verification-code" | User entered wrong code | Provide resend option via `resendVerificationCode()` |

### **Diagnostic Scripts**
```bash
node backend/checkPhoneNumbers.js   # View users with phone numbers
node backend/clearPhoneNumbers.js   # Clear phone numbers for testing (allows reuse)
```

## 📂 Key Features & Patterns

### **Product Details Unified** (`src/pages/ProductDetailsUnified.jsx`)
- Handles products from 3 sources: Mall, Shops, Marketplace
- Features: Reviews, Q&A, "Ask Previous Buyer" chat
- Upload review photos via `uploadReviews` helper
- Integrates with Earn More referral links

### **Earn More** (`src/pages/EarnMore.jsx`)
- **Referral System**: Dual tabs (Users/Shops), QR codes (Level H).
- **Routes**: `/refer/user/:code`, `/refer/shop/:code`.
- **Data**: `/api/users/earnings` + `/api/users/downline-counts`.
- **Note**: Referral codes are case-insensitive.

### **Shopping Flow**
- Mall: Fixed rotation (backend fairness)
- Shops: Browse → Add to Cart
- Cart: Stored in localStorage (`cart_items_${userId}`)
- Checkout: Creates Order → Redirects to confirmation

### **Mobile App (Capacitor)** (`src/capacitor-init.js`)
- **Platforms**: iOS (App Store) + Android (Google Play)
- **Deep Links**: `https://moondala.com/r/ABC123` → auto-navigates in app
- **Native Features**: Status bar, splash screen, back button, external browser
- **Detection**: `Capacitor.isNativePlatform()` checks if running as native app
- **External Links**: `openExternalLink(url)` opens in system browser (not in-app)

**Mobile Workflows**:
```bash
# Web development (standard)
npm run dev  # Port 5173

# Build for mobile
npm run build  # Creates dist/

# iOS
npx cap sync ios      # Copy web build to iOS project
npx cap open ios      # Opens in Xcode
# Archive → App Store Connect

# Android  
npx cap sync android  # Copy web build to Android project
npx cap open android  # Opens in Android Studio
cd android && gradlew bundleRelease  # Creates AAB for Play Store
```

**Capacitor Patterns**:
```javascript
// Check if native app
import { Capacitor } from '@capacitor/core';
const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform(); // 'web', 'ios', 'android'

// Open external links (terms, social media)
import { openExternalLink } from './capacitor-init';
await openExternalLink('https://moondala.com/terms');

// Deep links auto-handled by capacitor-init
// User clicks: https://moondala.com/r/ABC123
// App opens: navigates to /r/ABC123 (registers referral)
```

**Native Plugins Used**:
- `@capacitor/app` - Deep links, back button, app state
- `@capacitor/browser` - Open external URLs in system browser
- `@capacitor/splash-screen` - App launch screen
- `@capacitor/status-bar` - iOS/Android status bar styling

**Config**: `capacitor.config.ts`
- App ID: `com.moondala.app`
- Deep Link: `https://moondala.com/*` → app navigation
- Splash: 2s auto-hide, dark theme (`#0a0a0f`)

## 🛠️ Developer Workflows

### **Start Development**
```bash
cd user-frontend-vite-temp
npm install
npm run dev  # Port 5173
# Backend MUST be running (port 5000)
```

### **Add a New Page**
```jsx
// 1. Create src/pages/MyNewPage.jsx
import { useTranslation } from 'react-i18next';
import { apiGet } from '../api.jsx';
import { toAbsUrl } from '../api.jsx';

export function MyNewPage() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const result = await apiGet('/my-endpoint');
      setData(result);
    })();
  }, []);

  return (
    <div>
      <h1>{t('my.page.title')}</h1>
      {data && <img src={toAbsUrl(data.image)} />}
    </div>
  );
}

// 2. Register in App.jsx
import { MyNewPage } from './pages/MyNewPage';
// Add route: <Route path="/my-new-page" element={<MyNewPage />} />

// 3. Add translations
// public/locales/en/translation.json: { "my.page.title": "My Page" }
// public/locales/ar/translation.json: { "my.page.title": "صفحتي" }
```

### **Debug API Issues**
| Problem | Symptom | Fix |
|---------|---------|-----|
| 401 loops | Redirects to login repeatedly | Check token expiry + ensure `apiGet` wrapper used |
| 404 on image | Image shows broken icon | Verify `toAbsUrl()` wrapper + check Cloudinary path |
| Missing env var | Image URL `undefined` | Set `VITE_API_BASE` in `.env` file |
| RTL broken | English layout in Arabic mode | Verify `lang` attribute set + Tailwind dir config |
| Cart empty | Items disappear after reload | Check localStorage key matches `userId` format |
| Mobile build fails | Gradle/CocoaPods error | Clean: `npx cap sync`, delete `android/.gradle`, rebuild |
| Deep link not working | Config missing | Check `capacitor.config.ts` + `android/AndroidManifest.xml` |
| Status bar wrong color | Plugin not initialized | Verify `capacitor-init.js` called in `App.jsx` |
| Delete post not working (iOS) | `confirm()` blocked by iOS WebView | Use `window.confirm()` instead of `confirm()` |

### **iOS/Capacitor-Specific Issues**

**⚠️ CRITICAL: Native Dialogs on iOS**
```javascript
// ❌ WRONG: Native dialogs unreliable on iOS WebView
if (!confirm("Delete post?")) return;
const confirmed = window.confirm("Delete?");

// ✅ CORRECT: Use custom modal component for iOS compatibility
setConfirmModal({
  show: true,
  message: "Delete this post?",
  onConfirm: async () => {
    setConfirmModal({ show: false, message: "", onConfirm: null });
    // Perform delete action
    await deletePost(postId);
  }
});

// Modal component in JSX (see Feed.jsx lines 1674-1713)
{confirmModal.show && (
  <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
    {/* Custom confirmation dialog UI */}
  </div>
)}

// Why: iOS WKWebView blocks or behaves inconsistently with:
// - confirm() - May fail silently
// - window.confirm() - Blocked in some contexts
// - prompt() - Not recommended
// - alert() - Works but poor UX
// Solution: State-based custom modal works reliably across all platforms
```

**Common iOS Issues**:
- **Confirm dialogs don't show**: Use `window.confirm()` instead of `confirm()`
- **Prompt dialogs blocked**: Consider custom modal components for better UX
- **Alert dialogs truncated**: Keep messages short (<200 chars on iOS)
- **Back button behavior**: Capacitor handles via `CapApp.addListener('backButton')`

**Platform Detection**:
```javascript
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform(); // true on iOS/Android
const platform = Capacitor.getPlatform(); // 'web', 'ios', 'android'

// Use for conditional logic
if (platform === 'ios') {
  // iOS-specific handling
}
```

### **Memory Leaks**
```javascript
// ❌ WRONG: Async without cleanup
useEffect(() => {
  apiGet('/data').then(r => setData(r));  // stale closure!
}, []);

// ✅ CORRECT: Cleanup or use flag
useEffect(() => {
  let isMounted = true;
  apiGet('/data').then(r => {
    if (isMounted) setData(r);
  });
  return () => { isMounted = false; };
}, []);

// OR use useMemo for expensive calcs
const total = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);
```

## 🚨 Common Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| Images 404 prod | Missing `toAbsUrl()` | Wrap ALL `<img src>` in `toAbsUrl(path)` |
| Hardcoded text in UI | No i18n | Replace with `t("key.name")` from translation.json |
| `process.env` undefined | CRA pattern in Vite | Use `import.meta.env.VITE_*` |
| External link opens in-app | Missing openExternalLink | Use `openExternalLink(url)` not `window.open()` for native |
| Mobile features broken on web | Checking wrong platform | Use `Capacitor.isNativePlatform()` before calling native APIs |
| Deep link ignored | Event listener not setup | Verify `initializeCapacitor(navigate)` called in `App.jsx` |
| Android back button exits | No handler | Check `CapApp.addListener('backButton')` in `capacitor-init.js` |

## 📱 Mobile-Specific Notes

### PWA vs Native App
- **Web (PWA)**: Service worker, manifest.json, installable
- **Native (iOS/Android)**: Capacitor wraps web build in native container
- **Same Codebase**: `src/` folder serves both web + mobile
- **Platform Detection**: Use `Capacitor.isNativePlatform()` for conditional logic

### Deep Link Testing
```bash
# iOS Simulator
xcrun simctl openurl booted "https://moondala.com/r/ABC123"

# Android Emulator  
adb shell am start -a android.intent.action.VIEW -d "https://moondala.com/r/ABC123" com.moondala.app

# Production
# iOS: Universal Links (domain association file required)
# Android: App Links (verified domain in manifest)
```

### Build Sizes
- **Web Bundle**: ~508 KB (gzip: 151 KB)
- **Android APK**: ~15 MB (AAB smaller after Play Store optimization)
- **iOS IPA**: ~20 MB (compressed for App Store)

### Platform-Specific UI
```javascript
// Show native-only features
const isNative = Capacitor.isNativePlatform();
{isNative && <ShareButton />}

// Platform-specific styling
const platform = Capacitor.getPlatform();
className={platform === 'ios' ? 'pt-safe-area' : ''}
```

## 📚 Additional Resources

- **Mobile Build Guide**: [android/ANDROID_BUILD_GUIDE.md](../android/ANDROID_BUILD_GUIDE.md) - Full Android release workflow
- **Earn More Feature**: [EARN_MORE_FEATURE.md](../EARN_MORE_FEATURE.md) - Referral system architecture
- **Backend API**: [../backend/.github/copilot-instructions.md](../backend/.github/copilot-instructions.md) - API patterns
- **Capacitor Docs**: https://capacitorjs.com/docs - Official plugin reference
| 401 Unauthorized | Token expired | API wrapper auto-logs out; user redirected to login |
| Cart lost on navigation | Not in localStorage | Ensure using key format `cart_items_${userId}` |
| CORS blocked | Frontend not in allowedOrigins | Check `backend/app.js` allowedOrigins array |

# Copilot Instructions: User Frontend (Vite)

**Status**: ✅ ACTIVE (Port 5173, prod: `moondala.com`).
**CRITICAL**: Folder `../user-frontend` is DEPRECATED—always work here.

## 🚀 Architecture

```
user-frontend-vite-temp (Vite React 18)
├─ Entry: index.html → src/index.jsx
├─ Router: App.jsx (React Router v6)
├─ API: src/api.jsx (apiGet, apiPost, toAbsUrl)
├─ i18n: public/locales/{en,ar}/translation.json (react-i18next)
├─ State: Local + Context (UserContext for auth)
├─ Styling: Tailwind CSS v4 + Framer Motion
└─ Key Pages: ProductDetailsUnified, EarnMore, Mall, Cart
```

**Token**: `userToken` (localStorage, user role only).

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

## 📂 Key Features & Patterns

### **Product Details Unified** (`src/pages/ProductDetailsUnified.jsx`)
- Handles products from 3 sources: Mall, Shops, Marketplace
- Features: Reviews, Q&A, "Ask Previous Buyer" chat
- Upload review photos via `uploadReviews` helper
- Integrates with Earn More referral links

### **Earn More** (`src/pages/EarnMore.jsx`)
- Dual tabs: Invite Users (QR code) | Invite Shops (unique link)
- Client-side QR generation: `qrcode` package
- Data: `/api/users/earnings` + `/api/users/downline-counts`
- Displays referral tree (5 levels max)

### **Shopping Flow**
- Mall: Fixed rotation (backend fairness)
- Shops: Browse → Add to Cart
- Cart: Stored in localStorage (`cart_items_${userId}`)
- Checkout: Creates Order → Redirects to confirmation

## 🛠️ Developer Workflows

### **Start Development**
```bash
cd user-frontend-vite-temp && npm run dev  # Port 5173
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
| 401 Unauthorized | Token expired | API wrapper auto-logs out; user redirected to login |
| Cart lost on navigation | Not in localStorage | Ensure using key format `cart_items_${userId}` |
| CORS blocked | Frontend not in allowedOrigins | Check `backend/app.js` allowedOrigins array |

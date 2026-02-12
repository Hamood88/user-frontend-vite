// user-frontend-vite/src/pages/ProductDetailsUnified.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import {
  request,
  API_BASE,
  startAskBuyerConversation,
  getOrCreateShopConversation,
  recordProductView,
} from "../api.jsx";

import ProductReviews from "../components/ProductReviews.jsx";
import SaveProductButton from "../components/SaveProductButton.jsx";
import SimilarProducts from "../components/SimilarProducts.jsx";
import RecentlyViewed from "../components/RecentlyViewed.jsx";
import StockAlertButton from "../components/StockAlertButton.jsx";
import { THEMES } from "../components/ShopMallTheme.jsx";
import "../styles/productDetailsUnified.css";
import "../styles/Engagement.css";

/* =========================
   Helpers
   ========================= */
function getUserTokenOnly() {
  try {
    return (
      localStorage.getItem("userToken") ||
      localStorage.getItem("token") ||
      ""
    );
  } catch {
    return "";
  }
}

function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function cleanId(v) {
  const s = String(v || "").replace(/[<>]/g, "").trim();
  const noColon = s.startsWith(":") ? s.slice(1) : s;
  if (!noColon) return "";
  const low = noColon.toLowerCase();
  if (low === "id" || low === "productid") return "";
  return noColon;
}

function makeAbsolute(url) {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const host = String(API_BASE || "https://moondala-backend.onrender.com").trim();
  const base = host.endsWith("/") ? host.slice(0, -1) : host;
  if (s.startsWith("/")) return `${base}${s}`;
  if (s.startsWith("uploads/")) return `${base}/${s}`;
  if (!s.includes("/")) return `${base}/uploads/${s}`;
  return `${base}/${s}`;
}

function pickImages(p) {
  const arr = [];
  if (p?.image) arr.push(p.image);
  if (p?.imageUrl) arr.push(p.imageUrl);
  if (p?.thumbnail) arr.push(p.thumbnail);
  if (p?.photo) arr.push(p.photo);
  if (Array.isArray(p?.images)) arr.push(...p.images);
  if (Array.isArray(p?.displayImages)) arr.push(...p.displayImages);
  if (p?.media?.image) arr.push(p.media.image);
  if (Array.isArray(p?.media?.images)) arr.push(...p.media.images);
  if (Array.isArray(p?.media) && p.media.length) {
    for (const m of p.media) if (m?.url) arr.push(m.url);
  }
  return Array.from(new Set(arr.filter(Boolean).map(makeAbsolute).filter(Boolean)));
}

function idFromPath(pathname) {
  const p = String(pathname || "");
  const m = p.match(/\/(mall\/product|products?|item|p|product)\/([^\/?#]+)/i);
  return m && m[2] ? cleanId(m[2]) : "";
}

function getUserCartKey() {
  try {
    const user = JSON.parse(localStorage.getItem("userObj") || localStorage.getItem("user") || "{}");
    const userId = user?._id || user?.id || "guest";
    return `cart_items_${userId}`;
  } catch {
    return "cart_items_guest";
  }
}

function readCart() {
  try {
    const key = getUserCartKey();
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeCart(items) {
  try {
    const key = getUserCartKey();
    localStorage.setItem(key, JSON.stringify(items || []));
  } catch {}
}

function getShopIdFromProduct(p) {
  const candidates = [
    p?.shopId,
    p?.shop?._id,
    p?.shop?.id,
    p?.shop,
    p?.shopInfo?._id,
    p?.shopInfo?.id,
    p?.shopInfo,
    p?.shopRef?._id,
    p?.shopRef?.id,
  ];
  for (const c of candidates) {
    const s = String(c || "").trim();
    if (s && s !== "[object Object]") return s;
  }
  return "";
}

export default function ProductDetailsUnified() {
  const nav = useNavigate();
  const params = useParams();
  const loc = useLocation();

  const id =
    cleanId(params.id) ||
    cleanId(params.productId) ||
    cleanId(params.pid) ||
    idFromPath(loc.pathname);

  // ✅ Smart back navigation - detect shop mall context
  const getBackDestination = () => {
    // Priority 1: Explicit backTo from navigation state
    if (loc.state?.backTo) {
      return String(loc.state.backTo).trim();
    }
    
    // Priority 2: Check if we're in a shop mall context by URL pattern
    const currentPath = loc.pathname;
    const shopMallMatch = currentPath.match(/\/shop-mall\/([^\/]+)\/product/);
    if (shopMallMatch) {
      const shopId = shopMallMatch[1];
      const searchParams = new URLSearchParams(loc.search);
      const theme = searchParams.get('theme');
      const backUrl = `/shop-mall/${shopId}${theme ? `?theme=${theme}` : ''}`;
      return backUrl;
    }
    
    // Priority 3: Check referrer if available
    if (typeof document !== 'undefined' && document.referrer) {
      const referrerUrl = new URL(document.referrer);
      const referrerPath = referrerUrl.pathname;
      if (referrerPath.includes('/shop-mall/')) {
        return referrerPath + referrerUrl.search;
      }
    }
    
    // Priority 4: Browser history fallback
    if (typeof window !== 'undefined' && window.history.length > 1) {
      return -1; // Go back one page in history
    }
    
    // Default fallback
    return "/mall";
  };
  
  const backTo = getBackDestination();

  // ✅ Detect shop mall theme context
  const shopMallContext = useMemo(() => {
    const searchParams = new URLSearchParams(loc.search);
    const themeParam = searchParams.get('theme');
    const currentPath = loc.pathname;
    const shopMallMatch = currentPath.match(/\/shop-mall\/([^\/]+)\/product/);
    const isFromShopMall = !!shopMallMatch || 
                          !!loc.state?.from?.includes('shop-mall') ||
                          !!loc.state?.isFromShopMall;
    
    // Check theme from URL param, navigation state, or match pattern
    let detectedTheme = null;
    if (themeParam && THEMES[themeParam]) {
      detectedTheme = THEMES[themeParam];
    } else if (loc.state?.shopMallTheme && THEMES[loc.state.shopMallTheme]) {
      detectedTheme = THEMES[loc.state.shopMallTheme];
    }
    
    if (isFromShopMall && detectedTheme) {
      console.log('🎨 Product page theme detected:', {
        themeId: detectedTheme.id,
        fromShopMall: isFromShopMall,
        source: themeParam ? 'URL' : 'navigation state'
      });
      return {
        isShopMall: true,
        theme: detectedTheme,
        themeId: detectedTheme.id
      };
    }
    
    return { isShopMall: false, theme: null, themeId: null };
  }, [loc.pathname, loc.search, loc.state]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [product, setProduct] = useState(null);
  const [shopIdRef, setShopIdRef] = useState("");

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");

  // ✅ Cart count state (updates in real-time when adding to cart)
  const [cartCount, setCartCount] = useState(() => {
    const c = readCart();
    return c.reduce((a, x) => a + Math.max(1, safeNum(x.qty, 1)), 0);
  });

  // ✅ Ask previous buyers
  const [buyersOpen, setBuyersOpen] = useState(false);
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [buyersErr, setBuyersErr] = useState("");
  const [buyers, setBuyers] = useState([]);

  const images = useMemo(() => pickImages(product), [product]);

  function requireLogin(nextAction = "continue") {
    const token = getUserTokenOnly();
    if (token) return true;

    nav("/login", {
      state: {
        from: loc.pathname + loc.search,
        backTo: loc.pathname + loc.search,
        nextAction,
        productId: id,
      },
    });
    return false;
  }

  useEffect(() => {
    let live = true;

    async function load() {
      setLoading(true);
      setErr("");
      setProduct(null);

      setBuyersOpen(false);
      setBuyers([]);
      setBuyersErr("");

      try {
        if (!id) throw new Error("Missing product id (your product link is wrong)");

        const endpoints = [
          { url: `/api/mall/products/${encodeURIComponent(id)}`, auth: false },
          { url: `/api/mall/product/${encodeURIComponent(id)}`, auth: false },
          { url: `/api/products/${encodeURIComponent(id)}`, auth: false },
          { url: `/api/shop-products/${encodeURIComponent(id)}`, auth: false },
        ];

        let res = null;
        let lastErr = null;

        for (const ep of endpoints) {
          try {
            res = await request(ep.url, { auth: ep.auth });
            break;
          } catch (e) {
            lastErr = e;
          }
        }

        const found = res?.product || res?.data?.product || res?.data || res;

        // ✅ Extract shop ID even if product is incomplete
        const sid = getShopIdFromProduct(found);
        if (sid && live) setShopIdRef(sid);

        if (!found?._id && !found?.id) {
          throw new Error(lastErr?.message || "Product not found");
        }

        if (!live) return;

        setProduct(found);

        // ✅ Record product view for history
        const token = getUserTokenOnly();
        if (token && (found._id || found.id)) {
          recordProductView(found._id || found.id).catch(() => {}); // Fire and forget
        }

        const imgs = pickImages(found);
        setActiveImg(imgs[0] || "");
        setQty(1);
      } catch (e) {
        if (!live) return;
        setErr(e?.message || "Failed to load product");
      } finally {
        if (live) setLoading(false);
      }
    }

    load();
    return () => {
      live = false;
    };
  }, [id]);

  // ✅ Redirect to shop feed page if product not found
  useEffect(() => {
    if (err) {
      // Priority 1: shop ID from navigation state (passed from orders)
      const stateShopId = loc.state?.shopId;
      // Priority 2: shop ID extracted from API response
      const sid = stateShopId || shopIdRef;
      
      if (sid) {
        nav(`/shop/${sid}/feed`, { replace: true });
      }
    }
  }, [err, shopIdRef, loc.state, nav]);

  const pid = String(product?._id || product?.id || id || "").trim();
  const title = product?.title || product?.name || "Product";
  const category =
    product?.categoryLabel || product?.category || product?.categoryName || "Category";

  const currency = String(product?.currency || "USD").toUpperCase();
  const price =
    product?.localPrice ??
    product?.price ??
    product?.amount ??
    product?.salePrice ??
    product?.cost ??
    0;

  const qtySafe = Math.max(1, Math.floor(safeNum(qty, 1)));
  const total = safeNum(price, 0) * qtySafe;

  const shopId = getShopIdFromProduct(product);
  
  // Get max stock from product (use quantity or fallback to 99)
  const maxStock = Math.max(1, safeNum(product?.quantity, 99));

  function dec() {
    setQty((q) => Math.max(1, Number(q) - 1));
  }
  function inc() {
    setQty((q) => Math.min(maxStock, Number(q) + 1));
  }

  function addToCart() {
    if (!product) return;

    const pidLocal = String(product?._id || product?.id || "").trim();
    if (!pidLocal) return;

    const cart = readCart();
    const idx = cart.findIndex((x) => String(x.productId) === pidLocal);

    const item = {
      productId: pidLocal,
      title,
      price: safeNum(price, 0),
      currency,
      image: images[0] || "",
      qty: qtySafe,
      shopId: shopId,
    };

    if (idx >= 0) {
      cart[idx] = {
        ...cart[idx],
        qty: Math.min(maxStock, Math.max(1, safeNum(cart[idx]?.qty, 1)) + qtySafe),
      };
    } else {
      cart.push(item);
    }

    writeCart(cart);
    
    // ✅ Update cart count in real-time
    const newCount = cart.reduce((a, x) => a + Math.max(1, safeNum(x.qty, 1)), 0);
    setCartCount(newCount);
    
    // ✅ Dispatch event so AppLayout can update its cart count
    window.dispatchEvent(new Event("cartUpdated"));
    
    alert(`✅ Added ${qtySafe} item${qtySafe > 1 ? 's' : ''} to cart!`);
  }

  function goToCart() {
    nav("/cart");
  }

  function buyNow() {
    if (!requireLogin("checkout")) return;
    
    // ✅ Go directly to checkout with this product
    const pidLocal = String(product?._id || product?.id || id || "").trim();
    if (!pidLocal) {
      alert("Product ID is missing");
      return;
    }
    
    nav(`/checkout/${encodeURIComponent(pidLocal)}`);
  }

  async function messageShop() {
    if (!requireLogin("messageShop")) return;

    if (!shopId) {
      alert("Shop id is missing for this product.");
      return;
    }

    try {
      const convo = await getOrCreateShopConversation({
        shopId,
        topic: "product",
        productId: pid || id,
      });

      const cid = String(convo?._id || convo?.conversationId || convo?.id || "").trim();
      if (!cid) throw new Error("Conversation not created");
      nav(`/messages/${encodeURIComponent(cid)}`);
    } catch (e) {
      alert(e?.message || "Failed to open shop chat");
    }
  }

  // ✅ Go to shop -> Shop Feed (public)
  function goToShop() {
    if (!shopId) {
      alert("Shop id is missing for this product.");
      return;
    }
    nav(`/shop/${encodeURIComponent(shopId)}/feed`);
  }

  // Toggle buyers panel (click to open/close)
  function toggleBuyers() {
    if (buyersOpen) {
      setBuyersOpen(false);
    } else {
      loadBuyers();
    }
  }

  // Close buyers when clicking outside
  const buyersRef = React.useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (buyersRef.current && !buyersRef.current.contains(e.target)) {
        setBuyersOpen(false);
      }
    }
    if (buyersOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [buyersOpen]);

  // ✅ Load buyers using correct API endpoint
  async function loadBuyers() {
    if (!requireLogin("askBuyers")) return;
    if (!pid) return;

    setBuyersLoading(true);
    setBuyersErr("");
    setBuyers([]);
    setBuyersOpen(false);

    try {
      const res = await request(`/api/products/${encodeURIComponent(pid)}/previous-buyers`, { auth: true });
      const list = res?.buyers || [];
      setBuyers(list);
      setBuyersOpen(true);
    } catch (e) {
      setBuyersErr(e?.message || "Failed to load previous buyers");
      setBuyersOpen(true);
    } finally {
      setBuyersLoading(false);
    }
  }

  async function messageBuyer(buyer) {
    if (!requireLogin("messageBuyer")) return;

    const userId = String(buyer?.userId || buyer?._id || "").trim();
    const anon = !!buyer?.anonymous;

    if (!userId || !pid) return;

    if (anon) {
      alert("This buyer is anonymous and cannot be messaged.");
      return;
    }

    try {
      const res = await startAskBuyerConversation({
        toUserId: userId,
        productId: pid,
      });

      const cid = String(
        res?.conversationId || res?._id || res?.conversation?._id || ""
      ).trim();

      if (!cid) throw new Error("Conversation not created");
      nav(`/messages/${encodeURIComponent(cid)}`);
    } catch (e) {
      alert(e?.message || "Failed to start chat with buyer");
    }
  }

  if (loading) {
    return (
      <div className="pdu-wrap">
        <div className="pdu-card" style={{ padding: 20 }}>
          Loading...
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="pdu-wrap">
        <button className="pdu-back" onClick={() => backTo === -1 ? nav(-1) : nav(backTo)} type="button">
          ← Back
        </button>
        <div style={{ marginTop: 12 }} className="pdu-card">
          <div style={{ padding: 20 }}>{err}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="pdu-wrap"
      style={shopMallContext.isShopMall ? {
        background: shopMallContext.theme.bg,
        color: shopMallContext.theme.text,
        minHeight: '100vh'
      } : {}}
    >
      <div 
        className="pdu-topbar"
        style={shopMallContext.isShopMall ? {
          background: shopMallContext.theme.card,
          borderBottom: `1px solid ${shopMallContext.theme.border}`,
          color: shopMallContext.theme.text
        } : {}}
      >
        <div className="pdu-breadcrumb">
          <button 
            className="pdu-back" 
            onClick={() => backTo === -1 ? nav(-1) : nav(backTo)} 
            type="button"
            style={shopMallContext.isShopMall ? {
              background: shopMallContext.theme.primary,
              color: shopMallContext.theme.onPrimary,
              border: 'none'
            } : {}}
          >
            ← Back
          </button>
        </div>

        <div className="pdu-actions">
          <button 
            className="pdu-pill" 
            onClick={goToCart} 
            title="View shopping cart"
            type="button"
            style={shopMallContext.isShopMall ? {
              background: shopMallContext.theme.accent,
              color: shopMallContext.theme.onAccent,
              border: 'none'
            } : {}}
          >
            🛒 {cartCount}
          </button>

          <button 
            className="pdu-pill" 
            onClick={goToShop} 
            disabled={!shopId} 
            type="button"
            style={shopMallContext.isShopMall ? {
              background: shopMallContext.theme.accent,
              color: shopMallContext.theme.onAccent,
              border: 'none',
              opacity: !shopId ? 0.5 : 1
            } : {}}
          >
            Shop page
          </button>

          <button 
            className="pdu-pill" 
            onClick={messageShop} 
            disabled={!shopId} 
            type="button"
            style={shopMallContext.isShopMall ? {
              background: shopMallContext.theme.accent,
              color: shopMallContext.theme.onAccent,
              border: 'none',
              opacity: !shopId ? 0.5 : 1
            } : {}}
          >
            Message shop
          </button>
        </div>
      </div>

      <div 
        className="pdu-card"
        style={shopMallContext.isShopMall ? {
          background: shopMallContext.theme.card,
          border: `1px solid ${shopMallContext.theme.border}`,
          color: shopMallContext.theme.text
        } : {}}
      >
        <div className="pdu-left">
          <div className="pdu-imgbox">
            {activeImg ? <img src={activeImg} alt={title} /> : <div>No image</div>}
          </div>

          {images.length > 1 ? (
            <div className="pdu-thumbs">
              {images.slice(0, 8).map((src) => (
                <div
                  key={src}
                  className={`pdu-thumb ${src === activeImg ? "active" : ""}`}
                  onClick={() => setActiveImg(src)}
                  title="View image"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setActiveImg(src);
                  }}
                  style={shopMallContext.isShopMall ? {
                    border: src === activeImg 
                      ? `2px solid ${shopMallContext.theme.primary}` 
                      : `1px solid ${shopMallContext.theme.border}`,
                    borderRadius: '8px',
                    overflow: 'hidden'
                  } : {}}
                >
                  <img src={src} alt="thumb" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="pdu-right">
          <div className="pdu-title-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <h1 
              className="pdu-title" 
              style={shopMallContext.isShopMall ? { 
                flex: 1, 
                color: shopMallContext.theme.text,
                fontFamily: shopMallContext.theme.font
              } : { flex: 1 }}
            >
              {title}
            </h1>
            <SaveProductButton productId={pid || id} size="lg" />
          </div>

          {/* Store name - clickable to shop page */}
          {(product?.shopName || product?.shop?.shopName) && shopId && (
            <div 
              className="pdu-store-link"
              onClick={goToShop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && goToShop()}
              style={shopMallContext.isShopMall ? {
                color: shopMallContext.theme.primary,
                borderColor: shopMallContext.theme.border
              } : {}}
            >
              {product?.shopName || product?.shop?.shopName}
            </div>
          )}

          <div className="pdu-meta">
            <div 
              style={shopMallContext.isShopMall ? { 
                fontWeight: 900, 
                opacity: 0.85,
                color: shopMallContext.theme.muted
              } : { fontWeight: 900, opacity: 0.85 }}
            >
              Category
            </div>
            <div 
              style={shopMallContext.isShopMall ? { 
                fontWeight: 1000,
                color: shopMallContext.theme.text
              } : { fontWeight: 1000 }}
            >
              {category}
            </div>
          </div>

          <div className="pdu-row">
            <div 
              className="pdu-price"
              style={shopMallContext.isShopMall ? {
                color: shopMallContext.theme.primary,
                fontFamily: shopMallContext.theme.font
              } : {}}
            >
              {currency} {money(price)}
            </div>
            <div 
              style={shopMallContext.isShopMall ? { 
                fontWeight: 1000, 
                opacity: 0.9,
                color: shopMallContext.theme.text
              } : { fontWeight: 1000, opacity: 0.9 }}
            >
              Total: {currency} {money(total)}
            </div>
          </div>

          <div className="pdu-row" style={{ marginTop: 12 }}>
            <div 
              style={shopMallContext.isShopMall ? { 
                fontWeight: 900, 
                opacity: 0.9,
                color: shopMallContext.theme.muted
              } : { fontWeight: 900, opacity: 0.9 }}
            >
              Quantity
            </div>
            <div className="pdu-qty">
              <button 
                className="pdu-qtybtn" 
                onClick={dec} 
                type="button"
                style={shopMallContext.isShopMall ? {
                  background: shopMallContext.theme.accent,
                  color: shopMallContext.theme.onAccent,
                  border: `1px solid ${shopMallContext.theme.border}`
                } : {}}
              >
                −
              </button>
              <div 
                className="pdu-qtybox"
                style={shopMallContext.isShopMall ? {
                  background: shopMallContext.theme.bg,
                  color: shopMallContext.theme.text,
                  border: `1px solid ${shopMallContext.theme.border}`
                } : {}}
              >
                {qtySafe}
              </div>
              <button 
                className="pdu-qtybtn" 
                onClick={inc} 
                type="button"
                style={shopMallContext.isShopMall ? {
                  background: shopMallContext.theme.accent,
                  color: shopMallContext.theme.onAccent,
                  border: `1px solid ${shopMallContext.theme.border}`
                } : {}}
              >
                +
              </button>
            </div>
          </div>

          <div 
            className="pdu-desc"
            style={shopMallContext.isShopMall ? {
              color: shopMallContext.theme.text,
              background: shopMallContext.theme.bg,
              border: `1px solid ${shopMallContext.theme.border}`,
              borderRadius: '8px',
              padding: '12px'
            } : {}}
          >
            {product?.description?.trim() ? product.description : "No description."}
          </div>

          {/* ✅ Out of Stock Banner + Stock Alert */}
          {product?.inStock === false && (
            <div className="out-of-stock-banner">
              <div className="out-of-stock-text">
                ⚠️ This item is currently out of stock
              </div>
              <StockAlertButton productId={pid} inStock={false} />
            </div>
          )}

          {/* ✅ Buy/Cart buttons only show when in stock */}
          {product?.inStock !== false && (
            <div className="pdu-btns">
              <button 
                className="pdu-btn primary" 
                onClick={buyNow} 
                type="button"
                style={shopMallContext.isShopMall ? {
                  background: shopMallContext.theme.primary,
                  color: shopMallContext.theme.onPrimary,
                  border: 'none',
                  fontFamily: shopMallContext.theme.font
                } : {}}
              >
                Buy Now
              </button>
              <button 
                className="pdu-btn" 
                onClick={addToCart} 
                type="button"
                style={shopMallContext.isShopMall ? {
                  background: shopMallContext.theme.accent,
                  color: shopMallContext.theme.onAccent,
                  border: `1px solid ${shopMallContext.theme.border}`,
                  fontFamily: shopMallContext.theme.font
                } : {}}
              >
                Add to Cart
              </button>
            </div>
          )}

          {/* ✅ Ask Previous Buyers - Toggle on/off */}
          <div style={{ marginTop: 14, position: 'relative' }} ref={buyersRef}>
            <button
              className="pdu-btn"
              type="button"
              onClick={toggleBuyers}
              disabled={buyersLoading || !pid}
              style={shopMallContext.isShopMall ? {
                background: buyersOpen ? shopMallContext.theme.accent + '40' : shopMallContext.theme.accent,
                color: shopMallContext.theme.onAccent,
                border: `1px solid ${shopMallContext.theme.border}`,
                fontFamily: shopMallContext.theme.font
              } : buyersOpen ? { background: 'rgba(59,130,246,0.25)' } : {}}
            >
              {buyersLoading ? "Loading buyers..." : buyersOpen ? "Close buyers ▲" : "Ask previous buyers ▼"}
            </button>

            {buyersOpen && (
              <div
                style={shopMallContext.isShopMall ? {
                  marginTop: 10,
                  padding: 12,
                  borderRadius: 12,
                  border: `1px solid ${shopMallContext.theme.border}`,
                  background: shopMallContext.theme.card,
                  color: shopMallContext.theme.text
                } : {
                  marginTop: 10,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {buyersErr ? (
                  <div style={{ color: "#ff8080", fontWeight: 900 }}>{buyersErr}</div>
                ) : buyers.length === 0 ? (
                  <div style={{ opacity: 0.85 }}>
                    No buyers opted-in yet. (After completed orders + consent, they will appear here.)
                  </div>
                ) : (
                  buyers.map((b, idx) => {
                    const userId = String(b.userId || "").trim();
                    const anon = !!b.anonymous;

                    // Build display name from backend response
                    const firstName = String(b.firstName || "").trim();
                    const lastName = String(b.lastName || "").trim();
                    const username = String(b.username || "").trim();
                    
                    const displayName = anon 
                      ? "Anonymous buyer"
                      : firstName && lastName 
                      ? `${firstName} ${lastName}`
                      : firstName 
                      ? firstName
                      : username
                      ? username
                      : "Buyer";

                    const avatar = anon ? "" : String(b.avatar || "").trim();

                    return (
                      <div
                        key={userId || `buyer-${idx}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "8px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {avatar ? (
                            <img
                              src={makeAbsolute(avatar)}
                              alt=""
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.12)",
                              }}
                            />
                          )}
                          <div style={{ fontWeight: 900 }}>{displayName}</div>
                        </div>

                        <button
                          className="pdu-pill"
                          type="button"
                          onClick={() => messageBuyer(b)}
                          disabled={!userId || anon}
                          title={anon ? "Anonymous buyer cannot be messaged" : "Message buyer"}
                        >
                          Message
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Reviews */}
      <div style={{ marginTop: 14 }}>
        <ProductReviews productId={pid || id} canWrite={false} defaultOpen={true} />
      </div>

      {/* ✅ Similar Products (AI-powered recommendations) */}
      <div className="pdu-card" style={{ marginTop: 14 }}>
        <SimilarProducts productId={pid || id} limit={10} />
      </div>

      {/* ✅ Recently Viewed Products */}
      <div className="pdu-card" style={{ marginTop: 14 }}>
        <RecentlyViewed limit={10} showClear={false} />
      </div>
    </div>
  );
}

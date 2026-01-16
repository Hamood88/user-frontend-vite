// user-frontend-vite/src/pages/ProductDetailsUnified.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import {
  request,
  API_BASE,
  startAskBuyerConversation,
  getOrCreateShopConversation,
} from "../api.jsx";

import ProductReviews from "../components/ProductReviews.jsx";
import "../styles/productDetailsUnified.css";

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
  const host = String(API_BASE || "http://localhost:5000").trim();
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

  const backTo = String(loc.state?.backTo || "/mall").trim() || "/mall";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [product, setProduct] = useState(null);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");

  // ✅ Ask previous buyers
  const [buyersOpen, setBuyersOpen] = useState(false);
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [buyersErr, setBuyersErr] = useState("");
  const [buyers, setBuyers] = useState([]);

  const images = useMemo(() => pickImages(product), [product]);

  const cartCount = useMemo(() => {
    const c = readCart();
    return c.reduce((a, x) => a + Math.max(1, safeNum(x.qty, 1)), 0);
  }, [product, qty]);

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

        if (!found?._id && !found?.id) {
          throw new Error(lastErr?.message || "Product not found");
        }

        if (!live) return;

        setProduct(found);

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

  function dec() {
    setQty((q) => Math.max(1, Number(q) - 1));
  }
  function inc() {
    setQty((q) => Math.min(99, Number(q) + 1));
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
        qty: Math.min(99, Math.max(1, safeNum(cart[idx]?.qty, 1)) + qtySafe),
      };
    } else {
      cart.push(item);
    }

    writeCart(cart);
    alert(`✅ Added ${qtySafe} item${qtySafe > 1 ? 's' : ''} to cart!`);
  }

  function goToCart() {
    nav("/cart");
  }

  function buyNow() {
    if (!requireLogin("checkout")) return;
    addToCart();
    nav(`/checkout/${encodeURIComponent(id)}`);
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

  // ✅ Go to shop -> ShopMall preview (public)
  function goToShop() {
    if (!shopId) {
      alert("Shop id is missing for this product.");
      return;
    }
    nav(`/shop/${encodeURIComponent(shopId)}/mall`);
  }

  // ✅ FIXED: load buyers WITHOUT getAskBuyers import
  async function loadBuyers() {
    if (!requireLogin("askBuyers")) return;
    if (!pid) return;

    setBuyersLoading(true);
    setBuyersErr("");
    setBuyers([]);
    setBuyersOpen(false);

    const tries = [
      `/api/orders/ask-buyers/${encodeURIComponent(pid)}`,
      `/api/orders/${encodeURIComponent(pid)}/ask-buyers`,
      `/api/products/${encodeURIComponent(pid)}/ask-buyers`,
      `/api/ask-buyers/${encodeURIComponent(pid)}`,
    ];

    let lastErr = null;

    try {
      let res = null;
      for (const p of tries) {
        try {
          res = await request(p, { auth: true });
          break;
        } catch (e) {
          lastErr = e;
          if (e?.status === 404) continue;
          throw e;
        }
      }

      if (!res) throw new Error(lastErr?.message || "Ask buyers endpoint not found");

      const list = Array.isArray(res?.buyers)
        ? res.buyers
        : Array.isArray(res?.data?.buyers)
        ? res.data.buyers
        : Array.isArray(res)
        ? res
        : [];

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
        <button className="pdu-back" onClick={() => nav(backTo)} type="button">
          ← Back
        </button>
        <div style={{ marginTop: 12 }} className="pdu-card">
          <div style={{ padding: 20 }}>{err}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pdu-wrap">
      <div className="pdu-topbar">
        <div className="pdu-breadcrumb">
          <span style={{ opacity: 0.95 }}>
            {product?.shopName || product?.shop?.shopName || "Shop"}
          </span>
          <span style={{ opacity: 0.55 }}>•</span>
          <button className="pdu-back" onClick={() => nav(backTo)} type="button">
            Back to products
          </button>
        </div>

        <div className="pdu-actions">
          <button 
            className="pdu-pill" 
            onClick={goToCart} 
            title="View shopping cart"
            type="button"
          >
            🛒 {cartCount}
          </button>

          <button className="pdu-pill" onClick={goToShop} disabled={!shopId} type="button">
            Go to shop
          </button>

          <button className="pdu-pill" onClick={messageShop} disabled={!shopId} type="button">
            Message shop
          </button>
        </div>
      </div>

      <div className="pdu-card">
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
                >
                  <img src={src} alt="thumb" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="pdu-right">
          <h1 className="pdu-title">{title}</h1>

          <div className="pdu-meta">
            <div style={{ fontWeight: 900, opacity: 0.85 }}>Category</div>
            <div style={{ fontWeight: 1000 }}>{category}</div>
          </div>

          <div className="pdu-row">
            <div className="pdu-price">
              {currency} {money(price)}
            </div>
            <div style={{ fontWeight: 1000, opacity: 0.9 }}>
              Total: {currency} {money(total)}
            </div>
          </div>

          <div className="pdu-row" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, opacity: 0.9 }}>Quantity</div>
            <div className="pdu-qty">
              <button className="pdu-qtybtn" onClick={dec} type="button">
                −
              </button>
              <div className="pdu-qtybox">{qtySafe}</div>
              <button className="pdu-qtybtn" onClick={inc} type="button">
                +
              </button>
            </div>
          </div>

          <div className="pdu-desc">
            {product?.description?.trim() ? product.description : "No description."}
          </div>

          <div className="pdu-btns">
            <button className="pdu-btn primary" onClick={buyNow} type="button">
              Buy Now
            </button>
            <button className="pdu-btn" onClick={addToCart} type="button">
              Add to Cart
            </button>
          </div>

          <div className="pdu-small">Product ID: {pid}</div>

          {/* ✅ Ask Previous Buyers */}
          <div style={{ marginTop: 14 }}>
            <button
              className="pdu-btn"
              type="button"
              onClick={loadBuyers}
              disabled={buyersLoading || !pid}
            >
              {buyersLoading ? "Loading buyers..." : "Ask previous buyers"}
            </button>

            {buyersOpen && (
              <div
                style={{
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

                    const displayName = String(b.displayName || "").trim()
                      ? b.displayName
                      : anon
                      ? "Anonymous buyer"
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
    </div>
  );
}

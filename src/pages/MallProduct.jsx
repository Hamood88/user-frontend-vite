// user-frontend-vite/src/pages/MallProduct.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { API_BASE, apiGet, getToken } from "../api.jsx";

/* =========================
   Helpers
   ========================= */

function normalizeBase(u) {
  const s = String(u || "").trim();
  if (!s) return "http://localhost:5000";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

function absUrl(u) {
  if (!u) return "";
  const s = String(u).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const base = normalizeBase(API_BASE);
  if (s.startsWith("/")) return base + s;
  return base + "/" + s;
}

// ✅ removes < > and trims (fixes %3C..%3E style ids)
function cleanId(v) {
  return String(v || "").replace(/[<>]/g, "").trim();
}

function pickId(x) {
  if (!x) return "";
  return String(x._id || x.id || x.productId || "").trim();
}

function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function pickFirstImage(product) {
  if (!product) return "";
  const a =
    product.image ||
    product.photo ||
    product.thumbnail ||
    product.cover ||
    (Array.isArray(product.images) ? product.images[0] : "") ||
    (Array.isArray(product.photos) ? product.photos[0] : "") ||
    "";
  return a || "";
}

function safeText(v) {
  const s = String(v ?? "").trim();
  return s;
}

/* =========================
   MallProduct (PUBLIC)
   - Works for public users (no token required)
   - Also works for logged-in users
   - Shows product details + shop link + Buy button (goes to checkout)
   ========================= */

export default function MallProduct() {
  const nav = useNavigate();
  const params = useParams();
  const query = useQuery();

  // Accept id from route param OR query (?id=)
  const rawId = params.productId || query.get("id") || query.get("productId") || "";
  const productId = cleanId(rawId);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [product, setProduct] = useState(null);

  const token = getToken();

  const title = safeText(product?.title || product?.name || product?.productName || "Product");
  const description = safeText(product?.description || product?.details || product?.body || "");
  const price = product?.price ?? product?.salePrice ?? product?.amount ?? 0;

  const heroImage = absUrl(pickFirstImage(product));

  const shop = product?.shop || product?.shopId || product?.seller || null;
  const shopId = cleanId(shop?._id || shop?.id || product?.shopId || product?.sellerId || "");
  const shopName = safeText(shop?.name || shop?.shopName || product?.shopName || "Shop");

  const canCheckout = Boolean(token); // buy requires login in most flows

  const fetchProduct = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      if (!productId) {
        setProduct(null);
        setErr("Missing product id.");
        return;
      }

      // ✅ Try public endpoints first (no auth)
      const tryUrls = [
        `/products/public/${productId}`,
        `/public/products/${productId}`,
        `/mall/products/${productId}`,
        `/products/${productId}`, // fallback if your backend allows public read
      ];

      let lastError = null;
      for (const url of tryUrls) {
        try {
          const data = await apiGet(url);
          if (data) {
            // accept: {product} or direct product
            setProduct(data.product || data.data?.product || data);
            setLoading(false);
            return;
          }
        } catch (e) {
          lastError = e;
        }
      }

      // If all attempts failed, show a useful error
      setProduct(null);
      setErr(
        (lastError && (lastError.message || String(lastError))) ||
          "Failed to load product."
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const onGoShop = () => {
    if (!shopId) return;
    // You might have a route like /shop/:shopId or /shop-feed/:shopId
    // We'll try the most common:
    nav(`/shop/${shopId}`);
  };

  const onBuy = () => {
    if (!productId) return;
    if (!canCheckout) {
      // Redirect to login and come back
      nav(`/login?next=${encodeURIComponent(`/checkout/${productId}`)}`);
      return;
    }
    nav(`/checkout/${productId}`);
  };

  const onBackToMall = () => {
    nav("/mall");
  };

  /* =========================
     UI
     ========================= */
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px 14px",
        background: "#0b0b0f",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <button
            onClick={onBackToMall}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "10px 12px",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>

          <div style={{ opacity: 0.85, fontSize: 14 }}>
            {loading ? "Loading..." : err ? "Error" : "Public Mall"}
          </div>

          <button
            onClick={fetchProduct}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "10px 12px",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>

        {/* Error */}
        {err ? (
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: "rgba(255,0,0,0.08)",
              border: "1px solid rgba(255,0,0,0.25)",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Couldn’t load product</div>
            <div style={{ opacity: 0.9 }}>{err}</div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={fetchProduct}
                style={{
                  background: "#fff",
                  color: "#000",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Try again
              </button>

              <button
                onClick={onBackToMall}
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "10px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                }}
              >
                Go to Mall
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Product card */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: 16,
              }}
            >
              {/* Image */}
              <div
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                  minHeight: 340,
                }}
              >
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={title}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div style={{ padding: 18, opacity: 0.8 }}>
                    No product image
                  </div>
                )}
              </div>

              {/* Info */}
              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                  {title}
                </div>

                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
                  ${money(price)}
                </div>

                {description ? (
                  <div style={{ opacity: 0.9, lineHeight: 1.55, marginBottom: 14 }}>
                    {description}
                  </div>
                ) : (
                  <div style={{ opacity: 0.7, marginBottom: 14 }}>
                    No description.
                  </div>
                )}

                {/* Shop row */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.18)",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Sold by</div>
                    <div style={{ fontWeight: 800 }}>{shopName}</div>
                  </div>

                  <button
                    onClick={onGoShop}
                    disabled={!shopId}
                    style={{
                      background: "transparent",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "10px 12px",
                      borderRadius: 12,
                      cursor: shopId ? "pointer" : "not-allowed",
                      opacity: shopId ? 1 : 0.5,
                    }}
                  >
                    Visit shop
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={onBuy}
                    style={{
                      background: "#ffffff",
                      color: "#000",
                      border: "none",
                      padding: "12px 16px",
                      borderRadius: 14,
                      cursor: "pointer",
                      fontWeight: 900,
                      flex: "1 1 220px",
                    }}
                  >
                    {canCheckout ? "Buy now" : "Login to buy"}
                  </button>

                  <button
                    onClick={() => nav(`/product/${productId}`)}
                    style={{
                      background: "transparent",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "12px 16px",
                      borderRadius: 14,
                      cursor: "pointer",
                      fontWeight: 800,
                      flex: "1 1 220px",
                    }}
                    title="If you have a unified product page route"
                  >
                    More details
                  </button>
                </div>

                {/* Debug info (optional) */}
                <div style={{ marginTop: 14, fontSize: 12, opacity: 0.6 }}>
                  Product ID: {productId || "—"}
                </div>
              </div>
            </div>

            {/* Mobile responsive fallback */}
            <style>{`
              @media (max-width: 900px) {
                .mall-product-grid {
                  grid-template-columns: 1fr !important;
                }
              }
            `}</style>
          </>
        )}
      </div>

      {/* Make the grid responsive by attaching class */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              const els = document.querySelectorAll('div[style*="grid-template-columns: 1.2fr 1fr"]');
              els.forEach(el => el.classList.add('mall-product-grid'));
            })();
          `,
        }}
      />
    </div>
  );
}

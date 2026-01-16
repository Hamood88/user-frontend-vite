// user-frontend-vite/src/pages/ShopPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE, request } from "../api.jsx";

function normalizeBase(u) {
  const s = String(u || "").trim();
  if (!s) return "http://localhost:5000";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

const BASE = normalizeBase(API_BASE);
const API_ROOT = BASE.endsWith("/api") ? BASE : `${BASE}/api`;

function apiUrl(path) {
  const p = String(path || "");
  if (!p) return API_ROOT;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return API_ROOT + p;
  return API_ROOT + "/" + p;
}

function makeAbsolute(url) {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  // uploads usually from BASE not /api
  if (s.startsWith("/")) return BASE + s;
  return BASE + "/" + s;
}

// ✅ supports multiple product schemas
function pickProductImage(p) {
  if (!p) return "";
  const imgs = Array.isArray(p.images) ? p.images : [];
  if (imgs[0]) return makeAbsolute(imgs[0]);

  const mImgs = Array.isArray(p?.media?.images) ? p.media.images : [];
  if (mImgs[0]) return makeAbsolute(mImgs[0]);

  if (p?.media?.image) return makeAbsolute(p.media.image);

  const fallback = p.image || p.mainImage || p.photo || p.thumbnail || "";
  return makeAbsolute(fallback);
}

function pickId(x) {
  if (!x) return "";
  return String(x._id || x.id || "").trim();
}

export default function ShopPage() {
  const nav = useNavigate();
  const { shopId } = useParams();

  const safeShopId = useMemo(() => {
    return String(shopId || "").replace(/[<>]/g, "").replace(/^:/, "").trim();
  }, [shopId]);

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;

    async function load() {
      setErr("");
      setLoading(true);

      try {
        if (!safeShopId) throw new Error("Invalid shop id");

        // ✅ use the same API base logic as the rest of your app
        const res = await fetch(apiUrl(`/public/shops/${encodeURIComponent(safeShopId)}`), {
          headers: { Accept: "application/json" },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || data?.error || "Failed to load shop");
        }

        if (!live) return;

        setShop(data.shop || null);
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (e) {
        if (!live) return;
        setErr(e?.message || "Error");
        setShop(null);
        setProducts([]);
      } finally {
        if (live) setLoading(false);
      }
    }

    load();
    return () => {
      live = false;
    };
  }, [safeShopId]);

  // ✅ categories with counts
  const categories = useMemo(() => {
    const map = new Map();
    map.set("All", (products || []).length);

    (products || []).forEach((p) => {
      const c = String(p?.category || "Other").trim() || "Other";
      map.set(c, (map.get(c) || 0) + 1);
    });

    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [products]);

  const filtered = useMemo(() => {
    if (cat === "All") return products;
    return (products || []).filter((p) => (String(p?.category || "Other").trim() || "Other") === cat);
  }, [products, cat]);

  // ✅ FIXED: open unified product page (PUBLIC)
  function openProduct(productId) {
    const pid = String(productId || "").trim();
    if (!pid) return;
    nav(`/product/${encodeURIComponent(pid)}`);
  }

  if (loading) return <div style={{ color: "#fff", padding: 20 }}>Loading shop…</div>;
  if (err) return <div style={{ color: "#fff", padding: 20 }}>❌ {err}</div>;

  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            overflow: "hidden",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            flexShrink: 0,
          }}
        >
          {shop?.logo ? (
            <img
              alt="logo"
              src={makeAbsolute(shop.logo)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{shop?.shopName || "Shop"}</div>
          {shop?.about ? <div style={{ opacity: 0.85, marginTop: 4 }}>{shop.about}</div> : null}
        </div>

        <button
          onClick={() => nav(-1)}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            fontWeight: 900,
            cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        >
          Back
        </button>
      </div>

      {/* Categories */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => setCat(c.name)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              fontWeight: 900,
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.14)",
              background: c.name === cat ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.06)",
              color: "#fff",
            }}
          >
            {c.name} <span style={{ opacity: 0.8 }}>({c.count})</span>
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {filtered.map((p) => {
          const pid = pickId(p);
          const img = pickProductImage(p);
          const price = Number(p.localPrice ?? p.price ?? 0);
          const currency = String(p.currency || "USD").toUpperCase();

          return (
            <div
              key={pid || Math.random()}
              onClick={() => openProduct(pid)}
              style={{
                cursor: "pointer",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ height: 180, background: "rgba(255,255,255,0.06)" }}>
                {img ? (
                  <img
                    alt={p.title || "Product"}
                    src={img}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 900, lineHeight: 1.2 }}>{p.title || "Product"}</div>
                <div style={{ opacity: 0.85, marginTop: 6 }}>
                  {currency} {Number.isFinite(price) ? price.toFixed(2) : "0.00"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 14,
            border: "1px dashed rgba(255,255,255,0.18)",
            opacity: 0.85,
            fontWeight: 800,
          }}
        >
          No products in this category yet.
        </div>
      ) : null}
    </div>
  );
}

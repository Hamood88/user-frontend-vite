import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../api.jsx";
import "../styles/shopMallPublic.css";

/* =========================
   Helpers
   ========================= */
function cleanId(v) {
  return String(v || "").replace(/[<>]/g, "").replace(/^:/, "").trim();
}

function isObjectId24(v) {
  const s = String(v || "").trim();
  return /^[0-9a-fA-F]{24}$/.test(s);
}

function normalizeBase(u) {
  const s = String(u || "").trim();
  if (!s) return "https://moondala-backend.onrender.com";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

/**
 * ✅ BASE for uploads/images:
 * - if API_BASE is ".../api" => strip it
 */
function stripApi(base) {
  const b = normalizeBase(base);
  return b.endsWith("/api") ? b.slice(0, -4) : b;
}

/**
 * ✅ API_ROOT for endpoints:
 * - ensure it ends with "/api"
 */
function ensureApiRoot(base) {
  const b = normalizeBase(base);
  return b.endsWith("/api") ? b : `${b}/api`;
}

const BASE = stripApi(API_BASE);
const API_ROOT = ensureApiRoot(API_BASE);

function absUrl(u) {
  if (!u) return "";
  const s = String(u).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return s.startsWith("/") ? BASE + s : BASE + "/" + s;
}

/**
 * ✅ Convert new published products format into sections format
 */
function productsToSections(products) {
  if (!Array.isArray(products) || products.length === 0) return [];
  
  // Create a single "featured_products" section with all products
  return [{
    type: "featured_products",
    title: "Featured Products",
    productIds: products.map(p => p.id || p._id || ""),
    products: products, // Keep hydrated products
    layout: "grid",
    order: 0,
  }];
}

function pickId(x) {
  if (!x) return "";
  return String(x._id || x.id || x.productId || "").trim();
}

function pickProductImage(p) {
  if (!p) return "";

  if (Array.isArray(p.images) && p.images[0]) return absUrl(p.images[0]);
  if (p.image) return absUrl(p.image);

  if (Array.isArray(p.media?.images) && p.media.images[0]) return absUrl(p.media.images[0]);
  if (p.media?.image) return absUrl(p.media.image);

  if (p.filename) return absUrl(`/uploads/shop-products/${p.filename}`);
  return "";
}

/* =========================
   API
   ========================= */
async function fetchPublicMallPage(shopId) {
  // use the public shops API which returns { ok, shop, page }
  const url = `${API_ROOT}/public/shops/${encodeURIComponent(shopId)}/mall`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data?.ok === false) {
    throw new Error(data?.message || data?.error || `Failed to load shop mall page (${res.status})`);
  }

  // normalize into the shape this component expects
  const shop = data?.shop || {};
  const page = data?.page || data?.mallPage || {};
  
  // ✅ Check if new published format
  const published = page.published === true;
  const publishedProducts = Array.isArray(page.products) ? page.products : [];
  
  // Use published products if available, otherwise fall back to sections
  let sections = Array.isArray(page.sections) ? page.sections : [];
  if (published && publishedProducts.length > 0) {
    sections = productsToSections(publishedProducts);
  }

  // gather products from hydrated sections
  const gathered = [];
  sections.forEach((sec) => (sec?.products || []).forEach((p) => gathered.push(p)));

  return {
    header: {
      title: shop.shopName || shop.name || page.title || "Shop",
      coverImageUrl: page.coverUrl || page.coverImageUrl || "",
      logoUrl: shop.logoUrl || shop.logo || "",
    },
    theme: page.theme || {},
    sections,
    products: gathered,
    shop,
    mallPage: page,
  };
}

export default function ShopMallPublic() {
  const params = useParams();
  const nav = useNavigate();

  const shopId = useMemo(() => cleanId(params.shopId), [params.shopId]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        if (!shopId) {
          setErr("Invalid shop id");
          setData(null);
          return;
        }

        // ✅ STRICT: only Mongo ObjectId
        if (!isObjectId24(shopId)) {
          setErr("Invalid shopId (must be Mongo ObjectId). Use /shop/<shop._id>/mall");
          setData(null);
          return;
        }

        const pageData = await fetchPublicMallPage(shopId);
        if (!alive) return;

        setData(pageData || null);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load shop page");
        setData(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [shopId]);

  const theme = useMemo(() => {
    const t = data?.theme || {};
    return {
      primary: t.primary || "#111111",
      accent: t.accent || "#d4af37",
      background: t.background || "#0b0b0b",
    };
  }, [data]);

  const header = data?.header || {};

  const productsMap = useMemo(() => {
    const m = new Map();
    const list = Array.isArray(data?.products) ? data.products : [];
    list.forEach((p) => {
      const id = pickId(p);
      if (id) m.set(String(id), p);
    });
    return m;
  }, [data]);

  const sections = useMemo(() => {
    const arr = Array.isArray(data?.sections) ? data.sections.slice() : [];
    arr.sort((a, b) => Number(a?.order ?? a?.sort ?? 0) - Number(b?.order ?? b?.sort ?? 0));
    return arr;
  }, [data]);

  function goBackToFeed() {
    if (!shopId) return nav("/mall");
    nav(`/shop/${encodeURIComponent(shopId)}/feed`);
  }

  function openProduct(p) {
    const pid = pickId(p);
    if (!pid) return;
    nav(`/product/${encodeURIComponent(pid)}`);
  }

  function openCta(url) {
    const u = String(url || "").trim();
    if (!u) return;
    if (u.startsWith("/")) return nav(u);
    window.open(u, "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return <div className="shopMallPublicLoading">Loading shop...</div>;
  }

  if (err) {
    return (
      <div className="shopMallPublicError">
        <div className="shopMallPublicErrorMessage">{err}</div>
        <button
          onClick={goBackToFeed}
          className="shopMallPublicBackBtn"
        >
          ← Back to Shop Feed
        </button>
      </div>
    );
  }

  return (
    <div className="shopMallPublicWrap">
      {/* Top bar */}
      <div className="shopMallPublicTop">
        <button
          onClick={goBackToFeed}
          className="shopMallPublicBackBtn"
        >
          ← Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 900, color: "#ddd" }}>Shop Mall Preview</div>
        </div>
      </div>

      {/* Cover */}
      <div style={{ position: "relative" }}>
        {header.coverImageUrl ? (
          <img
            src={absUrl(header.coverImageUrl)}
            alt="cover"
            style={{ width: "100%", height: 230, objectFit: "cover", opacity: 0.88 }}
          />
        ) : (
          <div style={{ width: "100%", height: 170, background: "#111" }} />
        )}

        {/* Logo */}
        {header.logoUrl ? (
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 18,
              width: 54,
              height: 54,
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <img
              src={absUrl(header.logoUrl)}
              alt="logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        ) : null}

        <div style={{ position: "absolute", left: 18, bottom: 16, right: 18 }}>
          <div style={{ fontSize: 26, fontWeight: 1000 }}>{header.title || "Shop"}</div>
          {header.tagline ? <div style={{ color: "#ddd" }}>{header.tagline}</div> : null}
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 18 }}>
        {sections.length === 0 ? (
          <div style={{ color: "#bbb" }}>No sections yet.</div>
        ) : (
          sections.map((s, idx) => {
            const type = String(s?.type || "").trim().toLowerCase();
            const title = s?.title || "";

            // ✅ HERO
            if (type === "hero") {
              const heroImg = s?.heroImage ? absUrl(s.heroImage) : "";
              return (
                <div
                  key={`hero-${idx}`}
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  {heroImg ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={heroImg}
                        alt="hero"
                        style={{ width: "100%", height: 260, objectFit: "cover", opacity: 0.9 }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
                      <div style={{ position: "absolute", left: 18, bottom: 16, right: 18 }}>
                        {s?.heroHeadline ? (
                          <div style={{ fontSize: 22, fontWeight: 1000, marginBottom: 6 }}>
                            {s.heroHeadline}
                          </div>
                        ) : title ? (
                          <div style={{ fontSize: 22, fontWeight: 1000, marginBottom: 6 }}>{title}</div>
                        ) : null}

                        {s?.heroSubtext ? <div style={{ color: "#ddd" }}>{s.heroSubtext}</div> : null}

                        {s?.heroCtaText ? (
                          <button
                            type="button"
                            onClick={() => openCta(s?.heroCtaUrl)}
                            style={{
                              marginTop: 12,
                              padding: "10px 12px",
                              borderRadius: 12,
                              border: "1px solid rgba(212,175,55,0.40)",
                              background: "rgba(212,175,55,0.16)",
                              color: "#fff",
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            {s.heroCtaText}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 16 }}>
                      <div style={{ fontWeight: 1000, fontSize: 18 }}>
                        {s?.heroHeadline || title || "Hero"}
                      </div>
                      {s?.heroSubtext ? <div style={{ color: "#bbb", marginTop: 6 }}>{s.heroSubtext}</div> : null}
                    </div>
                  )}
                </div>
              );
            }

            // ✅ TEXT
            if (type === "text") {
              return (
                <div
                  key={`text-${idx}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  {title ? <div style={{ fontWeight: 1000, marginBottom: 6 }}>{title}</div> : null}
                  <div style={{ color: "#ddd", lineHeight: 1.5 }}>{s?.body || ""}</div>
                </div>
              );
            }

            // ✅ FEATURED PRODUCTS
            if (type === "featured_products") {
              const ids = Array.isArray(s?.productIds) ? s.productIds.map(String) : [];
              const items = ids.map((id) => productsMap.get(String(id))).filter(Boolean);

              return (
                <div key={`featured-${idx}`}>
                  <div style={{ fontSize: 18, fontWeight: 1000 }}>{title || "Featured"}</div>

                  {items.length === 0 ? (
                    <div style={{ color: "#888", marginTop: 8 }}>No products in this section.</div>
                  ) : (
                    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6, marginTop: 10 }}>
                      {items.map((p) => {
                        const pid = pickId(p);
                        const img = pickProductImage(p);
                        const name = (p?.name || p?.title || "Product").slice(0, 28);
                        const price =
                          p?.price != null ? `$${p.price}` : p?.localPrice != null ? `$${p.localPrice}` : "";

                        return (
                          <div
                            key={pid || `${idx}-${Math.random()}`}
                            onClick={() => openProduct(p)}
                            style={{
                              minWidth: 180,
                              maxWidth: 180,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.10)",
                              borderRadius: 16,
                              overflow: "hidden",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ height: 130, background: "#0b0b0b" }}>
                              {img ? (
                                <img
                                  src={img}
                                  alt=""
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  onError={(e) => (e.currentTarget.style.display = "none")}
                                />
                              ) : null}
                            </div>

                            <div style={{ padding: 10 }}>
                              <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 4 }}>{name}</div>
                              <div style={{ color: theme.accent, fontWeight: 900 }}>{price}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // ✅ CATEGORY sections (hydrated by backend as sec.products)
            if (type === "category") {
              const ids = Array.isArray(s?.productIds) ? s.productIds.map(String) : [];
              const items = Array.isArray(s?.products) && s.products.length ? s.products : ids.map((id) => productsMap.get(String(id))).filter(Boolean);

              return (
                <div key={`category-${idx}`} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 1000 }}>{title || "Category"}</div>
                    {s?.categoryId ? (
                      <button
                        type="button"
                        onClick={() => nav(`/shop/${encodeURIComponent(shopId)}/mall`)}
                        style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        Browse
                      </button>
                    ) : null}
                  </div>

                  {items.length === 0 ? (
                    <div style={{ color: "#888" }}>No products in this section.</div>
                  ) : (
                    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6, marginTop: 6 }}>
                      {items.map((p) => {
                        const pid = pickId(p);
                        const img = pickProductImage(p);
                        const name = (p?.name || p?.title || "Product").slice(0, 28);
                        const price = p?.price != null ? `$${p.price}` : p?.localPrice != null ? `$${p.localPrice}` : "";

                        return (
                          <div
                            key={pid || `${idx}-${Math.random()}`}
                            onClick={() => openProduct(p)}
                            style={{
                              minWidth: 160,
                              maxWidth: 160,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.10)",
                              borderRadius: 12,
                              overflow: "hidden",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ height: 110, background: "#0b0b0b" }}>
                              {img ? (
                                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.currentTarget.style.display = "none")} />
                              ) : null}
                            </div>

                            <div style={{ padding: 8 }}>
                              <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 6 }}>{name}</div>
                              <div style={{ color: theme.accent, fontWeight: 900 }}>{price}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // ✅ Unknown
            return (
              <div
                key={`unknown-${idx}`}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div style={{ fontWeight: 1000 }}>
                  Unsupported section type: <span style={{ opacity: 0.8 }}>{String(type || "unknown")}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

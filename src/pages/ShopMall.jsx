import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE, apiGet } from "../api.jsx";

/* =========================
   Helpers
   ========================= */
function normalizeBase(u) {
  const s = String(u || "").trim();
  if (!s) return "http://localhost:5000";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

function cleanId(v) {
  return String(v || "").replace(/[<>]/g, "").replace(/^:/, "").trim();
}

function absUrl(u) {
  if (!u) return "";
  const s = String(u).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  const base = normalizeBase(API_BASE);

  // backend returns "/uploads/...." => should be BASE + "/uploads/..."
  if (s.startsWith("/")) return base + s;
  return base + "/" + s;
}

function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}

function pickId(p) {
  return cleanId(p?._id || p?.id || p?.productId);
}

function pickName(p) {
  return String(p?.title || p?.name || "Product").trim();
}

function pickPrice(p) {
  const v = p?.price ?? p?.localPrice ?? p?.salePrice ?? p?.amount ?? null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pickImage(p) {
  // prefer what your public builder sends: image + images[]
  const first =
    p?.image ||
    p?.photo ||
    p?.thumbnail ||
    p?.cover ||
    (Array.isArray(p?.images) ? p.images[0] : "") ||
    (Array.isArray(p?.photos) ? p.photos[0] : "") ||
    "";
  return absUrl(first);
}

function safeStr(v) {
  return String(v || "").trim();
}

/* =========================
   PAGE NORMALIZER (builder)
   backend: /api/shop-mall-page/:shopId
   returns:
   {
     ok:true,
     shopId,
     header:{title,tagline,coverImageUrl,logoUrl},
     theme:{primary,accent,background},
     sections:[{type,title,imageUrl,productIds,order}],
     products:[...]
   }
   ========================= */
function normalizeShopBuiltPayload(data) {
  const root = data?.data ? data.data : data;

  // If backend returned builder shape:
  const hasBuilder =
    root &&
    (root.header || root.theme || Array.isArray(root.sections)) &&
    Array.isArray(root.products);

  if (hasBuilder) {
    return {
      ok: !!root.ok,
      shopId: root.shopId || "",
      header: root.header || {},
      theme: root.theme || {},
      sections: Array.isArray(root.sections) ? root.sections : [],
      products: Array.isArray(root.products) ? root.products : [],
    };
  }

  // Fallback shape: {shop, products} or {products}
  const shop = root?.shop || root?.store || root?.seller || null;
  const products =
    Array.isArray(root?.products) ? root.products :
    Array.isArray(root) ? root :
    Array.isArray(root?.items) ? root.items :
    [];

  return {
    ok: true,
    shopId: "",
    header: { title: shop?.shopName || shop?.name || "Shop", tagline: "", coverImageUrl: "", logoUrl: "" },
    theme: { primary: "#111111", accent: "#d4af37", background: "#0b0b0b" },
    sections: [],
    products,
  };
}

export default function ShopMall() {
  const nav = useNavigate();
  const { shopId: shopIdParam } = useParams();
  const shopId = cleanId(shopIdParam);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // builder page
  const [header, setHeader] = useState({
    title: "Shop",
    tagline: "",
    coverImageUrl: "",
    logoUrl: "",
  });
  const [theme, setTheme] = useState({
    primary: "#111111",
    accent: "#d4af37",
    background: "#0b0b0b",
  });
  const [sections, setSections] = useState([]);
  const [products, setProducts] = useState([]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const fetchShopMall = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      if (!shopId) {
        setErr("Missing shop id in URL.");
        setHeader({ title: "Shop", tagline: "", coverImageUrl: "", logoUrl: "" });
        setTheme({ primary: "#111111", accent: "#d4af37", background: "#0b0b0b" });
        setSections([]);
        setProducts([]);
        return;
      }

      // ✅ IMPORTANT: Prefer the builder route first
      const tries = [
        () => apiGet(`/api/shop-mall-page/${encodeURIComponent(shopId)}`, { auth: false }),
        // fallback old public mall
        () => apiGet(`/api/shop-mall/${encodeURIComponent(shopId)}`, { auth: false }),
        () => apiGet(`/api/shops/${encodeURIComponent(shopId)}/mall`, { auth: false }),
        () => apiGet(`/api/shop/${encodeURIComponent(shopId)}/mall`, { auth: false }),
      ];

      let lastErr = null;

      for (const fn of tries) {
        try {
          const data = await fn();
          const norm = normalizeShopBuiltPayload(data);

          setHeader({
            title: safeStr(norm.header?.title) || "Shop",
            tagline: safeStr(norm.header?.tagline),
            coverImageUrl: absUrl(norm.header?.coverImageUrl || ""),
            logoUrl: absUrl(norm.header?.logoUrl || ""),
          });

          setTheme({
            primary: safeStr(norm.theme?.primary) || "#111111",
            accent: safeStr(norm.theme?.accent) || "#d4af37",
            background: safeStr(norm.theme?.background) || "#0b0b0b",
          });

          setSections(Array.isArray(norm.sections) ? norm.sections : []);
          setProducts(Array.isArray(norm.products) ? norm.products : []);
          return;
        } catch (e) {
          lastErr = e;
          if (e?.status === 404) continue;
          continue;
        }
      }

      setErr(lastErr?.message || "Failed to load this shop page.");
      setSections([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchShopMall();
  }, [fetchShopMall]);

  const categories = useMemo(() => {
    const set = new Set();
    for (const p of products) {
      const cat =
        p?.categoryName ||
        p?.categoryLabel ||
        (typeof p?.category === "string" ? p.category : "") ||
        p?.category?.name ||
        p?.category?.title ||
        "";
      if (cat) set.add(String(cat));
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();

    return (products || []).filter((p) => {
      const title = pickName(p).toLowerCase();
      const desc = String(p?.description || "").toLowerCase();
      const cat =
        (p?.categoryName ||
          p?.categoryLabel ||
          (typeof p?.category === "string" ? p.category : "") ||
          p?.category?.name ||
          p?.category?.title ||
          "No category");
      const catLower = String(cat).toLowerCase();

      const matchesQ = !q || title.includes(q) || desc.includes(q) || catLower.includes(q);
      const matchesCat = category === "all" ? true : catLower === String(category).toLowerCase();

      return matchesQ && matchesCat;
    });
  }, [products, query, category]);

  function onOpenProduct(p) {
    const id = pickId(p);
    if (!id) return;
    nav(`/mall/product/${encodeURIComponent(id)}`);
  }

  // Map products by id (for sections)
  const productsById = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(pickId(p), p);
    return m;
  }, [products]);

  // Simple section renderer (hero/banner + product rows)
  function renderSections() {
    if (!sections?.length) return null;

    return (
      <div style={{ marginTop: 18 }}>
        {sections
          .slice()
          .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
          .map((s, idx) => {
            const type = String(s?.type || "products").toLowerCase();
            const title = safeStr(s?.title) || "Section";
            const imageUrl = absUrl(s?.imageUrl || "");

            const sectionProducts = (Array.isArray(s?.productIds) ? s.productIds : [])
              .map((id) => productsById.get(cleanId(id)))
              .filter(Boolean);

            return (
              <div
                key={s?._id || s?.id || `${type}-${idx}`}
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>

                {imageUrl ? (
                  <div
                    style={{
                      marginTop: 10,
                      borderRadius: 16,
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(0,0,0,0.25)",
                      height: 190,
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ) : null}

                {type.includes("product") && sectionProducts.length ? (
                  <div
                    style={{
                      marginTop: 12,
                      display: "grid",
                      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                      gap: 12,
                    }}
                  >
                    {sectionProducts.slice(0, 12).map((p) => {
                      const img = pickImage(p);
                      const name = pickName(p);
                      const price = pickPrice(p);

                      return (
                        <button
                          key={pickId(p) || name}
                          onClick={() => onOpenProduct(p)}
                          style={{
                            textAlign: "left",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            borderRadius: 16,
                            padding: 10,
                            cursor: "pointer",
                            color: "#fff",
                          }}
                        >
                          <div
                            style={{
                              borderRadius: 14,
                              overflow: "hidden",
                              background: "rgba(0,0,0,0.25)",
                              border: "1px solid rgba(255,255,255,0.10)",
                              height: 130,
                            }}
                          >
                            {img ? (
                              <img
                                src={img}
                                alt={name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{ padding: 10, opacity: 0.7 }}>No image</div>
                            )}
                          </div>

                          <div style={{ marginTop: 8, fontWeight: 900 }}>{name}</div>
                          <div style={{ marginTop: 6, fontWeight: 900 }}>
                            {price !== null ? `USD ${money(price)}` : "Price not set"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "22px 14px",
        color: "#fff",
        background: theme?.background || "#0b0b0b",
      }}
    >
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        {/* Top bar */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => nav(-1)}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 14,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>

          <button
            onClick={() => nav(`/shop-feed/${shopId}`)}
            style={{
              background: "transparent",
              border: "1px solid rgba(59,130,246,0.35)",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 14,
              cursor: "pointer",
              fontWeight: 900,
            }}
            title="View this shop's feed"
          >
            Shop Feed →
          </button>

          <button
            onClick={() => nav("/feed")}
            style={{
              background: "transparent",
              border: "1px solid rgba(168,85,247,0.35)",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 14,
              cursor: "pointer",
              fontWeight: 900,
            }}
            title="Back to your feed"
          >
            User Feed →
          </button>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button
              onClick={fetchShopMall}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 14,
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Cover */}
        <div
          style={{
            marginTop: 16,
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              height: 220,
              background: header.coverImageUrl
                ? `url(${header.coverImageUrl}) center/cover no-repeat`
                : `linear-gradient(135deg, ${theme.primary || "#111"}, ${theme.accent || "#d4af37"})`,
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />

            <div style={{ position: "absolute", left: 18, bottom: 18, display: "flex", gap: 14, alignItems: "center" }}>
              {header.logoUrl ? (
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(0,0,0,0.25)",
                  }}
                >
                  <img src={header.logoUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : null}

              <div>
                <div style={{ fontSize: 26, fontWeight: 900 }}>{header.title || "Shop"}</div>
                {header.tagline ? <div style={{ opacity: 0.9, marginTop: 2 }}>{header.tagline}</div> : null}
              </div>
            </div>
          </div>
        </div>

        {/* State */}
        {loading ? (
          <div style={{ marginTop: 18, opacity: 0.9 }}>Loading…</div>
        ) : err ? (
          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 14,
              background: "rgba(255,0,0,0.08)",
              border: "1px solid rgba(255,0,0,0.25)",
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Couldn’t open shop page</div>
            <div style={{ opacity: 0.9 }}>{err}</div>
            <div style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>
              URL shopId: <b>{shopId || "—"}</b>
            </div>
          </div>
        ) : (
          <>
            {/* Sections from builder */}
            {renderSections()}

            {/* Filters + Products */}
            <div style={{ marginTop: 18, fontWeight: 900, fontSize: 18 }}>
              Products
            </div>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <select
                value={category}
                onChange={(e) => setCategory(String(e.target.value))}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "#fff",
                  padding: "12px 12px",
                  borderRadius: 14,
                  outline: "none",
                  minWidth: 180,
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c} style={{ background: "#111", color: "#fff" }}>
                    {c === "all" ? "All categories" : c}
                  </option>
                ))}
              </select>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search this shop…"
                style={{
                  flex: "1 1 380px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "#fff",
                  padding: "12px 14px",
                  borderRadius: 14,
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              {filtered.map((p) => {
                const img = pickImage(p);
                const title = pickName(p);
                const price = pickPrice(p);

                const cat =
                  p?.categoryName ||
                  p?.categoryLabel ||
                  (typeof p?.category === "string" ? p.category : "") ||
                  p?.category?.name ||
                  p?.category?.title ||
                  "No category";

                return (
                  <button
                    key={pickId(p) || title}
                    onClick={() => onOpenProduct(p)}
                    style={{
                      textAlign: "left",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 18,
                      padding: 12,
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 14,
                        overflow: "hidden",
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        height: 160,
                      }}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ padding: 12, opacity: 0.75 }}>No image</div>
                      )}
                    </div>

                    <div style={{ marginTop: 10, fontWeight: 900, fontSize: 18 }}>
                      {title}
                    </div>
                    <div style={{ marginTop: 2, opacity: 0.75 }}>{String(cat)}</div>
                    <div style={{ marginTop: 8, fontWeight: 900 }}>
                      {price !== null ? `USD ${money(price)}` : "Price not set"}
                    </div>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div style={{ marginTop: 18, opacity: 0.8 }}>No products found.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Search as SearchIcon, Users, Store, Package, Loader2 } from "lucide-react";
import "../styles/Search.css";
import { API_BASE, getToken, combinedSearch, toAbsUrl } from "../api.jsx";
import SaveProductButton from "../components/SaveProductButton.jsx";

/* =========================
   Helpers
   ========================= */
function normalizeBase(u) {
  const s = String(u || "").trim();
  if (!s) return "https://moondala-backend.onrender.com";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

const BASE = normalizeBase(API_BASE);
const API_ROOT = BASE.endsWith("/api") ? BASE : `${BASE}/api`;

function apiUrl(path) {
  const p = String(path || "").trim();
  if (!p) return API_ROOT;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return API_ROOT + p;
  return API_ROOT + "/" + p;
}

function assetUrl(pathOrUrl) {
  const s = String(pathOrUrl || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // uploads are served from BASE (not /api)
  if (s.startsWith("/")) return BASE + s;
  return BASE + "/" + s;
}

function pickId(r) {
  if (!r) return "";
  // ✅ prefer _id / id ALWAYS
  const id = r._id || r.id;
  if (id) return String(id).trim();

  // fallback (only if the backend returns weird shapes)
  if (r.shopId) return String(r.shopId).trim();
  if (r.userId) return String(r.userId).trim();
  return "";
}

function pickType(r) {
  const t = String(r?.type || r?.kind || r?.entityType || "").toLowerCase().trim();
  if (t === "users") return "user";
  if (t === "shops") return "shop";
  if (t === "user" || t === "shop") return t;

  // heuristic
  if (r?.shopName || r?.shopEmail || r?.industryId || r?.industryName) return "shop";
  return "user";
}

function pickName(r) {
  const nm =
    r?.name ||
    r?.shopName ||
    r?.userName ||
    `${r?.firstName || ""} ${r?.lastName || ""}`.trim() ||
    r?.email ||
    "Unknown";
  return String(nm || "Unknown").trim() || "Unknown";
}

function pickAvatar(r) {
  // ✅ your project uses avatarUrl for users
  return r?.avatarUrl || r?.avatar || r?.photo || r?.logoUrl || "";
}

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [type, setType] = useState("all"); // all | users | shops | products
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [aiPowered, setAiPowered] = useState(false);
  const [err, setErr] = useState("");

  async function runSearch(searchText, searchType) {
    const qq = String(searchText || "").trim();
    const tt = String(searchType || "all").trim();

    setErr("");

    if (!qq) {
      setUsers([]);
      setShops([]);
      setProducts([]);
      setAiPowered(false);
      return;
    }

    setLoading(true);
    try {
      // Use combined AI search for all types
      const results = await combinedSearch(qq, { productLimit: 30, userLimit: 20 });
      
      setProducts(results?.products || []);
      setUsers(results?.users || []);
      setShops(results?.shops || []);
      setAiPowered(results?.aiPowered || false);
    } catch (e) {
      setErr(String(e?.message || e));
      setUsers([]);
      setShops([]);
      setProducts([]);
      setAiPowered(false);
    } finally {
      setLoading(false);
    }
  }

  // ✅ debounce
  useEffect(() => {
    const t = setTimeout(() => runSearch(q, type), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type]);

  const results = useMemo(() => {
    const u = users.map((x) => ({ ...x, __type: "user" }));
    const s = shops.map((x) => ({ ...x, __type: "shop" }));

    if (type === "users") return u;
    if (type === "shops") return s;
    if (type === "products") return []; // Products shown separately

    // "all"
    return [...u, ...s];
  }, [users, shops, type]);

  function openResult(r) {
    const realType = r?.__type || pickType(r);
    const id = pickId(r);
    console.log("Search openResult called:", { realType, id, user: r });
    
    if (!id) return;

    if (realType === "shop") {
      console.log("Navigating to shop:", `/shop/${encodeURIComponent(id)}/feed`);
      navigate(`/shop/${encodeURIComponent(id)}/feed`);
      return;
    }

    // ✅ Users: always try the public user page first
    // This will show basic profile info and let user decide if they want to view the feed
    const userUrl = `/u/${encodeURIComponent(id)}`;
    console.log("Navigating to public user profile:", userUrl);
    navigate(userUrl);
  }

  function openProduct(productId) {
    navigate(`/product/${encodeURIComponent(productId)}`);
  }

  const showProducts = type === "all" || type === "products";
  const showPeopleShops = type === "all" || type === "users" || type === "shops";

  return (
    <div className="search-page">
      <div className="search-card">
        <div className="search-title">
          <SearchIcon className="w-5 h-5 mr-2" />
          Search
        </div>

        <div className="search-controls">
          <input
            className="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try 'cozy winter clothes' or 'gift for dad'..."
          />

          <select
            className="search-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="products">Products</option>
            <option value="users">Users</option>
            <option value="shops">Shops</option>
          </select>
        </div>

        {/* AI Badge */}
        {aiPowered && q.trim() && !loading && (
          <div className="ai-badge">
            <Sparkles className="w-4 h-4" />
            <span>AI-powered semantic search</span>
          </div>
        )}

        {loading ? (
          <div className="search-status">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Searching…
          </div>
        ) : null}
        {err ? <div className="search-error">{err}</div> : null}

        {/* Products Section */}
        {showProducts && products.length > 0 && (
          <div className="search-section">
            <div className="search-section-header">
              <Package className="w-4 h-4" />
              <span>Products ({products.length})</span>
              {aiPowered && <span className="ai-label">AI Match</span>}
            </div>
            <div className="search-products-grid">
              {products.map((product) => {
                const pid = product._id || product.id;
                const mainImage = Array.isArray(product.images)
                  ? product.images[0]
                  : product.image;
                
                return (
                  <div
                    key={pid}
                    className="search-product-card"
                    onClick={() => openProduct(pid)}
                  >
                    {/* Match Score Badge */}
                    {product.searchScore && product.searchScore > 0.5 && (
                      <div className="match-badge">
                        {Math.round(product.searchScore * 100)}%
                      </div>
                    )}
                    
                    {/* Save Button */}
                    <div className="product-save-btn">
                      <SaveProductButton productId={pid} size="sm" />
                    </div>
                    
                    <div className="product-image">
                      <img
                        src={toAbsUrl(mainImage)}
                        alt={product.title}
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af'%3E📦%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="product-info">
                      <div className="product-title">{product.title}</div>
                      <div className="product-price">
                        ${(product.localPrice || 0).toFixed(2)}
                      </div>
                      {product.aiTags && product.aiTags.length > 0 && (
                        <div className="product-tags">
                          {product.aiTags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="product-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* People & Shops Section */}
        {showPeopleShops && results.length > 0 && (
          <div className="search-section">
            <div className="search-section-header">
              <Users className="w-4 h-4" />
              <span>People & Shops ({results.length})</span>
            </div>
            <div className="search-results">
              {results.map((r) => {
                const id = pickId(r);
                const realType = r?.__type || pickType(r);
                const name = pickName(r);
                const avatar = pickAvatar(r);

                // ✅ stable key (no Math.random())
                const key = `${realType}-${id || name}`;

                return (
                  <button
                    key={key}
                    className="search-item"
                    onClick={() => openResult(r)}
                    type="button"
                  >
                    <div className="search-avatar">
                      {avatar ? <img src={assetUrl(avatar)} alt="" /> : (
                        realType === "shop" ? <Store className="w-5 h-5" /> : <Users className="w-5 h-5" />
                      )}
                    </div>

                    <div className="search-meta">
                      <div className="search-name">{name}</div>
                      <div className="search-sub">
                        {realType === "shop" ? "Shop" : "User"}
                        {r?.email ? ` • ${r.email}` : ""}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && q.trim() && results.length === 0 && products.length === 0 ? (
          <div className="search-status">No results found. Try different keywords!</div>
        ) : null}

        {/* Search Tips */}
        {!q.trim() && !loading && (
          <div className="search-tips">
            <div className="search-tips-title">
              <Sparkles className="w-4 h-4" />
              AI Search Tips
            </div>
            <ul>
              <li>Try natural language: "comfortable shoes for running"</li>
              <li>Describe what you need: "gift for someone who loves cooking"</li>
              <li>Search by style: "minimalist home decor"</li>
              <li>Find similar items: "blue summer dress"</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

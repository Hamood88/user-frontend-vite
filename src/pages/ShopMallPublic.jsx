import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE, toAbsUrl } from "../api.jsx"; 
import "../styles/shopMallPublic.css";

/* =========================
   Helpers
   ========================= */
function s(v) {
  return String(v || "").trim();
}

function isObjectId24(v) {
  return /^[a-fA-F0-9]{24}$/.test(s(v));
}

function pickId(x) {
  if (!x) return "";
  return s(x._id || x.id || x.productId || x.shopId || "");
}

function pickTitle(p) {
  return s(p?.title || p?.name || "Untitled");
}

function pickPrice(p) {
  const n = Number(p?.localPrice ?? p?.price ?? p?.salePrice ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function pickCurrency(p) {
  return s(p?.currency || "USD") || "USD";
}

function pickImageRaw(p) {
  // Use toAbsUrl from api.jsx for cleaner conversion
  return toAbsUrl(
    s(p?.image) ||
    s(p?.imageUrl) ||
    s(p?.photo) ||
    (Array.isArray(p?.images) ? s(p.images[0]) : "") ||
    s(p?.thumbnail) ||
    ""
  );
}

function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}

/* =========================
   API Function (Local)
   ========================= */
async function fetchPublicMallPage(shopId) {
  try {
    const res = await fetch(`${API_BASE}/api/public/shops/${shopId}/mall`);
    if (!res.ok) {
       // Graceful fallback for 404/500
       return { ok: false };
    }
    return await res.json();
  } catch (err) {
    console.warn("Mall fetch error:", err);
    return { ok: false };
  }
}

/* =========================
   Normalize Data
   ========================= */
function normalizePublicMall(raw) {
  if (!raw || !raw.ok) return null;

  const shop = raw.shop || {};
  const mp = raw.mallPage || raw.page || {};
  const sections = Array.isArray(mp.sections) ? mp.sections : [];

  // gather all products from sections for the "All" view or searching
  const gathered = [];
  sections.forEach((sec) => (sec?.products || []).forEach((p) => gathered.push(p)));

  // Case 1: Gathered from sections
  // Case 2: Direct products array (from backend published mode)
  // Case 3: Legacy featuredProducts
  
  const directProducts = Array.isArray(mp.products) ? mp.products : [];
  const featuredProducts = Array.isArray(raw.featuredProducts) ? raw.featuredProducts : [];

  const allProducts = gathered.length 
    ? gathered 
    : (directProducts.length ? directProducts : featuredProducts);

  return {
    header: {
      title: s(shop.name || shop.shopName || mp.title || "Shop"),
      subtitle: s(shop.description || mp.subtitle || ""),
      coverImageUrl: toAbsUrl(s(mp.coverUrl || mp.coverImageUrl || mp.coverImage || "")),
      logoUrl: toAbsUrl(s(shop.logo || shop.logoUrl || "")),
    },
    sections,
    allProducts, // For client-side searching
    shop,
    mallPage: mp,
  };
}

/* =========================
   Components
   ========================= */
function ProductCard({ p, onClick }) {
  const title = pickTitle(p);
  const price = pickPrice(p);
  const cur = pickCurrency(p);
  const img = pickImageRaw(p);

  return (
    <div 
      className="prodCard" 
      onClick={() => onClick(pickId(p))}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(pickId(p))}
    >
      <div className="pcImgBox">
        {img ? (
          <img src={img} alt={title} className="pcImg" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-600 text-sm">
             No Image
          </div>
        )}
      </div>
      <div className="pcInfo">
        <h3 className="pcName">{title}</h3>
        <div className="pcPriceRow">
          <span className="pcPrice">{cur} {money(price)}</span>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Main Page
   ========================= */
export default function ShopMallPublic() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); 

  useEffect(() => {
    let alive = true;
    (async () => {
      // Allow non-24char if using handles in future, but for now strict
      if (!shopId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await fetchPublicMallPage(shopId);
      if (alive) {
        setData(res);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [shopId]);

  const normalized = useMemo(() => normalizePublicMall(data), [data]);

  // Derived sections based on search/tabs
  const displaySections = useMemo(() => {
    if (!normalized) return [];

    let result = [];
    const q = search.trim().toLowerCase();

    // If searching, show a single "Results" section
    if (q) {
      const filtered = normalized.allProducts.filter(p => {
        const t = pickTitle(p).toLowerCase();
        return t.includes(q);
      });
      return [{
        _id: "search",
        title: `Search Result for "${search}"`,
        products: filtered,
        type: "grid"
      }];
    }

    // If "all" tab, just show sections as defined by shop owner
    if (activeTab === "all") {
       // If shop owner defined sections, show them
       if (normalized.sections.length > 0) {
         return normalized.sections;
       }
       // Else show all products as "All Products"
       return [{
         _id: "default",
         title: "All Products",
         products: normalized.allProducts,
         type: "grid"
       }];
    }

    // Filter by specific section ID (tab)
    if (normalized.sections.find(s => s._id === activeTab)) {
       return normalized.sections.filter(s => s._id === activeTab);
    }

    return [];
  }, [normalized, search, activeTab]);

  const handleProductClick = (pid) => {
    if (pid) navigate(`/product/${pid}`);
  };

  if (loading) {
    return (
      <div className="shopMallContainer">
        <div className="loadingSpinner">Loading Mall...</div>
      </div>
    );
  }

  if (!normalized) {
    return (
      <div className="shopMallContainer">
        <div className="emptyState">
          <h2>Shop Not Found</h2>
          <p>The shop you are looking for does not exist or has not set up their mall yet.</p>
          <button 
            onClick={() => navigate("/")}
            style={{marginTop: 20, padding: "8px 16px", background: "#333", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer"}}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { header } = normalized;

  // Tabs: "All" + each section title
  const tabs = [
    { id: "all", label: "All" },
    ...normalized.sections.map(s => ({ id: s._id, label: s.title || "Untitled" }))
  ];

  return (
    <div className="shopMallContainer">
      {/* Header */}
      <div 
        className="mallHeader"
        style={{ backgroundImage: header.coverImageUrl ? `url(${header.coverImageUrl})` : undefined }}
      >
        <div className="mallHeaderOverlay"></div>
        <div className="mallHeaderContent">
          <div className="mallBrand">
            {header.logoUrl && <img src={header.logoUrl} alt="Logo" className="mallLogo" />}
            <div className="mallTitleBlock">
              <h1 className="mallTitle">{header.title}</h1>
              {header.subtitle && <p className="mallSubtitle">{header.subtitle}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mallControlsBar">
        <div className="mallControlsContent">
          {/* Search */}
          <div className="searchBox">
            <span className="searchIcon">🔍</span>
            <input 
              type="text" 
              placeholder="Search in this shop..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Categories / Tabs */}
          <div className="catChips">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`chip ${activeTab === t.id && !search ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(t.id);
                  setSearch(""); // clear search when switching tabs
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mallContent">
        {displaySections.length === 0 ? (
          <div className="emptyState">No products found.</div>
        ) : (
          displaySections.map(sec => (
            <div key={sec._id || Math.random()} className="section">
              <div className={`sectionHeader ${sec.type === 'featured_products' ? 'featuredHeader' : ''}`}>
                <h2 className="sectionTitle">{sec.title}</h2>
                <span className="sectionCount">{sec.products?.length || 0} items</span>
              </div>
              
              <div className="productGrid">
                {sec.products && sec.products.map(p => (
                  <ProductCard 
                    key={pickId(p)} 
                    p={p} 
                    onClick={handleProductClick} 
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

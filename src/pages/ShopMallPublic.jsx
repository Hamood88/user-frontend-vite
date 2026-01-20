import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE, toAbsUrl, apiPost } from "../api.jsx"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ShoppingBag, 
  MapPin, 
  Star, 
  ArrowLeft,
  Store,
  Share2
} from "lucide-react";
import "../styles/shopMallPublic.css";

/* =========================
   Helpers
   ========================= */
function s(v) { return String(v || "").trim(); }

function isObjectId24(v) { return /^[a-fA-F0-9]{24}$/.test(s(v)); }

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
    if (!res.ok) return { ok: false };
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

  const gathered = [];
  sections.forEach((sec) => (sec?.products || []).forEach((p) => gathered.push(p)));

  const directProducts = Array.isArray(mp.products) ? mp.products : [];
  const featuredProducts = Array.isArray(raw.featuredProducts) ? raw.featuredProducts : [];

  const allProducts = gathered.length 
    ? gathered 
    : (directProducts.length ? directProducts : featuredProducts);

  return {
    header: {
      title: s(shop.name || shop.shopName || mp.title || "Shop"),
      subtitle: s(shop.description || s(shop.bio) || mp.subtitle || ""),
      coverImageUrl: toAbsUrl(s(mp.coverUrl || mp.coverImageUrl || mp.coverImage || shop.coverImage || "")),
      logoUrl: toAbsUrl(s(shop.logo || shop.logoUrl || "")),
      address: s(shop.address || shop.location || ""),
      rating: Number(shop.rating || 5.0),
      reviewCount: Number(shop.reviewCount || 0)
    },
    sections,
    allProducts,
    shop,
    mallPage: mp,
  };
}

/* =========================
   Component: Product Card
   ========================= */
function ProductCard({ p, onClick, onAddToCart }) {
  const title = pickTitle(p);
  const price = pickPrice(p);
  const cur = pickCurrency(p);
  const img = pickImageRaw(p);
  const pid = pickId(p);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="prodCard"
      onClick={() => onClick(pid)}
    >
      <div className="pcImgBox">
        {img ? (
          <img src={img} alt={title} className="pcImg" loading="lazy" />
        ) : (
          <div className="pcNoImg"><span>No Image</span></div>
        )}
        
        {/* Quick actions overlay */}
        <div className="pcActions">
          <button 
            className="pcBtn"
            title="Quick Add"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(pid);
            }}
          >
            <ShoppingBag size={18} fill="currentColor" />
          </button>
        </div>
      </div>

      <div className="pcInfo">
        <h3 className="pcName">{title}</h3>
        <div className="pcMeta">
          <span className="pcPrice">{cur} {money(price)}</span>
        </div>
      </div>
    </motion.div>
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
  const [addingToCart, setAddingToCart] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
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

  // Derived sections
  const displaySections = useMemo(() => {
    if (!normalized) return [];

    const q = search.trim().toLowerCase();

    // Search Mode
    if (q) {
      const filtered = normalized.allProducts.filter(p => {
        const t = pickTitle(p).toLowerCase();
        return t.includes(q);
      });
      return [{
        _id: "search",
        title: `Results for "${search}"`,
        subtitle: `${filtered.length} items found`,
        products: filtered,
        type: "grid"
      }];
    }

    // "All" Tab
    if (activeTab === "all") {
       if (normalized.sections.length > 0) return normalized.sections;
       return [{
         _id: "default",
         title: "All Products",
         products: normalized.allProducts,
         type: "grid"
       }];
    }

    // Specific Section Tab
    const sec = normalized.sections.find(s => s._id === activeTab);
    return sec ? [sec] : [];
  }, [normalized, search, activeTab]);

  const handleProductClick = (pid) => {
    if (pid) navigate(`/product/${pid}`);
  };

  const handleAddToCart = async (pid) => {
    if (addingToCart) return; 
    try {
      setAddingToCart(pid);
      await apiPost("/cart/add", { productId: pid, quantity: 1 });
      // In a real app we'd show a toast
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(null);
    }
  };

  const tabs = useMemo(() => {
    if (!normalized) return [];
    return [
      { id: "all", label: "All" },
      ...normalized.sections.map(s => ({ id: s._id, label: s.title || "Untitled" }))
    ];
  }, [normalized]);

  if (loading) {
    return (
      <div className="shopMallContainer loadingCenter">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!normalized) {
    return (
      <div className="shopMallContainer emptyCenter">
        <Store size={48} className="text-muted mb-4" />
        <h2>Shop Not Found</h2>
        <p>The shop you are looking for is unavailable.</p>
        <button onClick={() => navigate("/")} className="btnPrimary">
          Go Home
        </button>
      </div>
    );
  }

  const { header } = normalized;

  return (
    <div className="shopMallContainer" ref={containerRef}>
      
      {/* Dynamic Header Background */}
      <div 
        className="mallHero"
        style={{ 
          backgroundImage: header.coverImageUrl ? `url(${header.coverImageUrl})` : undefined 
        }}
      >
        <div className="mallHeroOverlay" />
        
        {/* Top Safe Area / Nav */}
        <div className="mallTopNav">
           <button onClick={() => navigate(-1)} className="mallNavBtn glassBtn">
             <ArrowLeft size={20} />
           </button>
           
           <div className="mallNavTitle faded">{header.title}</div>
           
           <button 
             className="mallNavBtn glassBtn" 
             onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: header.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied!");
                }
             }}
           >
             <Share2 size={20} />
           </button>
        </div>

        <div className="mallHeroContent">
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            className="mallBrand"
          >
            {header.logoUrl && (
              <img src={header.logoUrl} alt="Logo" className="mallLogo" />
            )}
            <div className="mallMeta">
              <h1 className="mallTitle">{header.title}</h1>
              {header.subtitle && <p className="mallDesc">{header.subtitle}</p>}
              
              <div className="mallStats">
                {header.rating > 0 && (
                   <span className="mallStatTag">
                     <Star size={14} fill="#fbbf24" stroke="none" /> 
                     {header.rating.toFixed(1)}
                   </span>
                )}
                {header.address && (
                   <span className="mallStatTag">
                     <MapPin size={14} /> 
                     {header.address}
                   </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky Tab Bar */}
      <div className="mallStickyBar">
        <div className="mallStickyContent">
          <div className="searchWrap">
            <Search size={16} className="searchIcon" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="searchInput"
            />
          </div>

          <div className="tabScroll">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setSearch(""); }}
                className={`tabChip ${activeTab === t.id && !search ? "active" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mallGridArea">
        <AnimatePresence mode="wait">
          {displaySections.length === 0 ? (
            <motion.div 
              key="empty" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="sectionEmpty"
            >
              <div className="emptyBox">
                <ShoppingBag size={40} />
                <p>No products found here.</p>
                {search && <button className="clrSearchBtn" onClick={() => setSearch("")}>Clear Search</button>}
              </div>
            </motion.div>
          ) : (
            <div className="sectionsList">
              {displaySections.map(sec => (
                <div key={sec._id || "sec"} className="mallSection">
                  {(sec.title || sec.type === 'search') && (
                    <div className="secHeader">
                       <h2>{sec.title}</h2>
                       {sec.subtitle && <span className="secSub">{sec.subtitle}</span>}
                    </div>
                  )}
                  
                  <div className="gridEx">
                    {sec.products && sec.products.length > 0 ? (
                       sec.products.map(p => (
                         <ProductCard 
                           key={pickId(p)} 
                           p={p} 
                           onClick={handleProductClick} 
                           onAddToCart={handleAddToCart}
                         />
                       ))
                    ) : (
                       <div className="secEmpty">No items in this section.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

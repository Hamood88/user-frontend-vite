import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE, likeShopPost, addShopPostComment, likeShopPostComment, followShop, unfollowShop, checkShopFollowStatus, toAbsUrl } from "../api.jsx";
import { Heart } from "lucide-react";
import "../styles/shopFeedPublic.css";

/* =========================
   ✅ API URL helpers
   ========================= */
function normalizeBase(u) {
  const s = String(u || "").trim();
  if (!s) return "https://moondala-backend.onrender.com";
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

function assetUrl(pathOrUrl) {
  const s = String(pathOrUrl || "").trim();
  if (!s) return "";
  return toAbsUrl(s);
}

/* =========================
   ✅ ShopId strict check (Mongo ObjectId)
   ========================= */
function isObjectId24(v) {
  const s = String(v || "").trim();
  return /^[0-9a-fA-F]{24}$/.test(s);
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  return `${days}d`;
}

function isVideoUrl(url) {
  const u = String(url || "").toLowerCase();
  return u.endsWith(".mp4") || u.endsWith(".mov") || u.endsWith(".webm") || u.includes("video");
}

/* =========================
   ✅ Product helpers
   ========================= */
function getRealProductId(anyShape) {
  if (!anyShape) return "";
  return String(
    anyShape._id ||
      anyShape.id ||
      anyShape.productId ||
      anyShape.product?._id ||
      anyShape.product?.id ||
      ""
  ).trim();
}

function normalizeProductImage(prod) {
  if (!prod) return "";

  if (prod.image) {
    const s = String(prod.image || "").trim();
    if (s) return toAbsUrl(s);
  }

  if (Array.isArray(prod.images) && prod.images.length > 0) {
    const first = String(prod.images[0] || "").trim();
    if (first) return toAbsUrl(first);
  }

  if (Array.isArray(prod.media?.images) && prod.media.images.length > 0) {
    const first = String(prod.media.images[0] || "").trim();
    if (first) return toAbsUrl(first);
  }

  if (prod.media?.image) {
    const first = String(prod.media.image || "").trim();
    if (first) return toAbsUrl(first);
  }

  if (prod.filename) {
    const first = String(prod.filename || "").trim();
    if (first) return toAbsUrl(`/uploads/shop-products/${first}`);
  }

  return "";
}

/* =========================
   ✅ Featured products marquee
   ========================= */
function ProductsRowMarquee({ products, onOpenUserProduct }) {
  if (!products?.length) return null;

  const max = Math.min(products.length, 14);
  const list = products.slice(0, max);
  const display = [...list, ...list];

  const [isPaused, setIsPaused] = React.useState(false);
  const [longPressTimer, setLongPressTimer] = React.useState(null);

  const handleProductTouchStart = (e, pid) => {
    // Prevent context menu
    e.preventDefault();
    
    // Start long press timer
    const timer = setTimeout(() => {
      setIsPaused(true);
    }, 500); // 500ms = long press
    
    setLongPressTimer(timer);
  };

  const handleProductTouchEnd = (e, pid) => {
    e.preventDefault();
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Resume animation if it was paused
    setIsPaused(false);
  };

  const handleProductClick = (e, pid) => {
    if (!isPaused) {
      // Only open product if it wasn't a long press
      onOpenUserProduct(pid);
    }
  };

  return (
    <div className="sfp-marquee-wrap">
      <style>{`
        .sfp-marquee-viewport{ overflow:hidden; width:100%; }
        .sfp-marquee-track{
          display:flex;
          gap:14px;
          width:max-content;
          animation: sfpMoveLeft 26s linear infinite;
          -webkit-user-select: none;
          user-select: none;
        }
        .sfp-marquee-viewport:hover .sfp-marquee-track{ animation-play-state: paused; }
        .sfp-marquee-track.paused{ animation-play-state: paused; }
        .sfp-marquee-card{
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        .sfp-marquee-img{
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
          pointer-events: none;
        }
        @keyframes sfpMoveLeft{
          0%{ transform: translateX(0); }
          100%{ transform: translateX(-50%); }
        }
      `}</style>

      <div className="sfp-marquee-head">
        <div className="sfp-marquee-title">Featured Products</div>
      </div>

      <div className="sfp-marquee-viewport">
        <div className={`sfp-marquee-track ${isPaused ? 'paused' : ''}`}>
          {display.map((pr, idx) => {
            const pid = getRealProductId(pr);
            const img = pr?._image || normalizeProductImage(pr);
            const title = pr?.title || pr?.name || "Product";

            return (
              <div
                key={`${pid || "p"}-${idx}`}
                className="sfp-marquee-card"
                role="button"
                tabIndex={0}
                onClick={(e) => handleProductClick(e, pid)}
                onKeyDown={(e) => e.key === "Enter" && onOpenUserProduct(pid)}
                onTouchStart={(e) => handleProductTouchStart(e, pid)}
                onTouchEnd={(e) => handleProductTouchEnd(e, pid)}
                onTouchCancel={(e) => handleProductTouchEnd(e, pid)}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="sfp-marquee-imgwrap">
                  {img ? (
                    <img
                      className="sfp-marquee-img"
                      src={img}
                      alt={title}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="sfp-marquee-ph" />
                  )}
                </div>

                <div className="sfp-marquee-name" title={title}>
                  {title}
                </div>

                <div className="sfp-marquee-bottom">
                  <div className="sfp-price">
                    {(pr.currency || "USD") + " " + Number(pr.price || pr.localPrice || 0).toFixed(2)}
                  </div>

                  <button
                    className="sfp-miniBtn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenUserProduct(pid);
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                  >
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================
   ✅ PUBLIC shop feed (NO auth)
   Backend expected:
   GET /api/public/shops/:shopId/feed
   ========================= */
async function loadPublicShopFeed(shopId) {
  // request more items (backend may paginate); default feed sometimes returns just a few items
  const res = await fetch(apiUrl(`/public/shops/${shopId}/feed?limit=200`), {
    headers: { Accept: "application/json" },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.message || data?.error || `Failed to load shop feed (${res.status})`);
  }

  return data;
}

/* =========================
   ✅ Shop App URL (optional)
   ========================= */
const SHOP_APP_URL =
  import.meta.env.VITE_SHOP_APP_URL ||
  import.meta.env.VITE_SHOP_FRONTEND_URL ||
  "https://shop.moondala.com";

// set to true if you want the button visible
const SHOW_OPEN_SHOP_APP = false;

/* =========================
   ✅ Helper for Shop App URL
   ========================= */
function getShopAppUrl(shopId) {
  // If explicitly localhost in env, use that. Otherwise moondala.one logic
  let base = SHOP_APP_URL || "https://shop.moondala.one";
  if (base.includes("localhost")) {
    base = base.replace(/\/+$/, "");
    return `${base}/shop/${encodeURIComponent(shopId)}`;
  }
  // Production
  return `https://shop.moondala.one/shop/${encodeURIComponent(shopId)}`;
}

export default function ShopFeedPublic() {
  const nav = useNavigate();
  const { shopId } = useParams();

  const safeShopId = useMemo(() => {
    return String(shopId || "").replace(/[<>]/g, "").replace(/^:/, "").trim();
  }, [shopId]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [shop, setShop] = useState(null);
  const [posts, setPosts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [openCommentsFor, setOpenCommentsFor] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  async function load() {
    if (!safeShopId) return;

    // ✅ strict mode: shopId must be Mongo _id
    if (!isObjectId24(safeShopId)) {
      setErr("Invalid shopId in URL (must be Mongo ObjectId).");
      setShop(null);
      setFeatured([]);
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");

    try {
      const data = await loadPublicShopFeed(safeShopId);

      setShop(data?.shop || null);

      // Public feed endpoint returns shop.
      // Fetch public products separately and use them as featured products for the public view.
      // If shop has featuredProductIds, use those to filter or sort.
      try {
        const prodRes = await fetch(apiUrl(`/public/shops/${safeShopId}/products?limit=100`), {
          headers: { Accept: "application/json" },
        });
        const prodData = await prodRes.json().catch(() => ({}));
        let prods = Array.isArray(prodData?.products) ? prodData.products : [];
        
        // Filter by featured IDs if available
        const featuredIds = data?.shop?.featuredProductIds || [];
        if (featuredIds.length > 0) {
           const featuredSet = new Set(featuredIds.map(x => String(x)));
           const featuredList = prods.filter(p => featuredSet.has(String(p._id || p.id)));
           // If we have actual featured matches, use them. Else fallback to all.
           if (featuredList.length > 0) {
             prods = featuredList;
           }
        }

        setFeatured(
          prods.map((p) => ({ ...p, _id: p._id || p.id, _image: normalizeProductImage(p) }))
        );
      } catch (e) {
        // ignore product load errors — posts still show
        setFeatured([]);
      }

      const items = Array.isArray(data?.items) ? data.items : [];

      // Support multiple shapes:
      // - items: [{type:"post", post:{...}}]
      // - posts: [...]
      const directPosts = Array.isArray(data?.posts) ? data.posts : [];
      const itemPosts = items
        .filter((x) => x?.type === "post")
        .map((x) => x?.post)
        .filter(Boolean);

      setPosts(itemPosts.length ? itemPosts : directPosts);
    } catch (e) {
      setErr(e?.message || "Failed to load shop feed");
      setShop(null);
      setFeatured([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  // build nested comment tree from flat list (handles parentComment being object or id)
  function buildCommentTree(comments = []) {
    const list = Array.isArray(comments) ? comments : [];
    const byId = new Map();
    list.forEach((c) => byId.set(String(c._id || c.id || Math.random()), { ...c, children: [] }));
    const roots = [];
    list.forEach((c) => {
      const id = String(c._id || c.id || Math.random());
      const parentRaw = c?.parentComment;
      const parentId = parentRaw ? String(parentRaw._id || parentRaw.id || parentRaw) : null;
      if (parentId && byId.has(parentId)) {
        byId.get(parentId).children.push(byId.get(id));
      } else {
        roots.push(byId.get(id));
      }
    });
    return roots;
  }

  function CommentNode({ node, depth = 0, onReply, onLike }) {
    if (!node) return null;
    const commenter = node?.author || node?.user || node?.createdBy || {};
    const name =
      commenter?.displayName ||
      commenter?.name ||
      commenter?.username ||
      commenter?.fullName ||
      commenter?.email ||
      "User";
    const avatarUrl =
      commenter?.avatarUrl ||
      commenter?.avatar ||
      commenter?.image ||
      commenter?.imageUrl ||
      commenter?.profileImage ||
      commenter?.photo ||
      "";
    const likesCount = Array.isArray(node?.likes) ? node.likes.length : 0;
    
    // Determine if author is a shop or user and get their ID
    const authorType = commenter?.authorType || "user";
    const authorShopId = commenter?.shopId || null;
    const authorUserId = commenter?.userId || null;
    
    // Handle click on author (navigate to their feed)
    const handleAuthorClick = () => {
      if (authorType === "shop" && authorShopId) {
        nav(`/shop/${encodeURIComponent(authorShopId)}/feed`);
      } else if (authorType === "user" && authorUserId) {
        // Navigate to user feed/profile if available
        nav(`/user/${encodeURIComponent(authorUserId)}/feed`);
      }
    };

    const isClickable = (authorType === "shop" && authorShopId) || (authorType === "user" && authorUserId);
    
    return (
      <div className="sf-comment" style={{ marginLeft: depth * 12, marginTop: 8 }}>
        <div className="sf-comment-top" style={{ alignItems: "center" }}>
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8,
              cursor: isClickable ? "pointer" : "default"
            }}
            onClick={isClickable ? handleAuthorClick : undefined}
          >
            {avatarUrl ? (
              <img
                src={assetUrl(avatarUrl)}
                alt={name}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.1)"
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff"
                }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="sf-comment-name">{name}</div>
          </div>
        </div>
        <div className="sf-comment-text" style={{ marginLeft: 40 }}>
          {node.text}
        </div>
        <div className="sf-replybar" style={{ marginLeft: 40 }}>
          <button className="sf-btn-mini" type="button" onClick={() => onLike(node._id || node.id)}>
            👍 {likesCount > 0 ? `(${likesCount})` : "Like"}
          </button>
          <button className="sf-btn-mini" type="button" onClick={() => onReply(node._id || node.id)}>
            💬 Reply
          </button>
        </div>
        {Array.isArray(node.children) && node.children.length > 0
          ? node.children.map((c) => (
              <CommentNode
                key={String(c._id || c.id || Math.random())}
                node={c}
                depth={depth + 1}
                onReply={onReply}
                onLike={onLike}
              />
            ))
          : null}
      </div>
    );
  }

  async function handleLike(postId) {
    if (!postId || !safeShopId) return;
    
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert("Please log in to like posts");
      nav('/login');
      return;
    }
    
    try {
      const result = await likeShopPost(safeShopId, postId);
      // Update local state using server-confirmed count
      setPosts(posts.map(p => {
        if ((p._id || p.id) === postId) {
          return {
            ...p,
            likedByMe: result.liked,
            likes: Array(result.likesCount || 0).fill('x')
          };
        }
        return p;
      }));
    } catch (e) {
      setErr(e?.message || "Failed to like post");
    }
  }

  async function handleAddComment(postId) {
    if (!postId || !safeShopId) return;
    const text = String(commentText || "").trim();
    if (!text) return;
    
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert("Please log in to comment");
      nav('/login');
      return;
    }
    
    try {
      const result = await addShopPostComment(safeShopId, postId, { text, parentComment: replyTo || null });
      // Update local state without reloading
      setPosts(posts.map(p => {
        if ((p._id || p.id) === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), result.comment]
          };
        }
        return p;
      }));
      setCommentText("");
      setReplyTo(null);
    } catch (e) {
      setErr(e?.message || "Failed to add comment");
    }
  }

  async function handleLikeComment(postId, commentId) {
    if (!postId || !commentId || !safeShopId) return;
    
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert("Please log in to like comments");
      nav('/login');
      return;
    }
    
    try {
      const result = await likeShopPostComment(safeShopId, postId, commentId);
      // Update local state using server-confirmed count
      setPosts(posts.map(p => {
        if ((p._id || p.id) === postId) {
          return {
            ...p,
            comments: (p.comments || []).map(c => {
              const cid = String(c._id || c.id);
              if (cid === String(commentId)) {
                return {
                  ...c,
                  likes: Array(result.likesCount || 0).fill('x')
                };
              }
              return c;
            })
          };
        }
        return p;
      }));
    } catch (e) {
      setErr(e?.message || "Failed to like comment");
    }
  }

  useEffect(() => {
    load();
    
    // Load follow status (only if user is logged in)
    async function loadFollowStatus() {
      if (!safeShopId) return;
      
      // Check if user is logged in before calling authenticated endpoint
      const token = localStorage.getItem('userToken');
      if (!token) {
        setIsFollowing(false);
        return;
      }
      
      try {
        const { following } = await checkShopFollowStatus(safeShopId);
        setIsFollowing(following);
      } catch (err) {
        console.error("Failed to check follow status:", err);
        setIsFollowing(false);
      }
    }
    loadFollowStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeShopId]);

  const shopName = shop?.shopName || shop?.name || "Shop";
  const logoSrc = toAbsUrl(shop?.logoUrl || shop?.logo || shop?.avatar || "");
  const bioText = shop?.bio || shop?.description || "";

  function goToShopMallPreview() {
    console.log("[ShopFeed] goToShopMallPreview clicked - safeShopId:", safeShopId);
    if (!safeShopId) {
      console.error("[ShopFeed] Cannot navigate - safeShopId is empty!");
      return;
    }
    const targetUrl = `/shop/${encodeURIComponent(safeShopId)}/mall`;
    console.log("[ShopFeed] Navigating to:", targetUrl);
    nav(targetUrl);
  }

  function openUserProduct(productId) {
    const pid = String(productId || "").trim();
    if (!pid) return;
    nav(`/product/${encodeURIComponent(pid)}`);
  }

  function openShopAppNewTab() {
    if (!safeShopId) return;
    const url = getShopAppUrl(safeShopId);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleToggleFollow() {
    if (!safeShopId) return;
    
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert("Please log in to follow shops");
      nav('/login');
      return;
    }
    
    console.log("🔵 Toggle follow - current state:", isFollowing, "shopId:", safeShopId);
    setFollowLoading(true);
    try {
      if (isFollowing) {
        console.log("📤 Unfollowing shop...");
        await unfollowShop(safeShopId);
        setIsFollowing(false);
        console.log("✅ Unfollowed successfully");
      } else {
        console.log("📤 Following shop...");
        await followShop(safeShopId);
        setIsFollowing(true);
        console.log("✅ Followed successfully");
      }
    } catch (err) {
      console.error("❌ Follow/unfollow error:", err);
      alert(err.message || "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  }

  return (
    <div className="sf-wrap">
      <div className="sf-wrap-inner">
        {/* Profile Card - Only show when shop data is loaded */}
        {shop && (
          <div style={{
            background: "linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.98))",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "24px",
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
          }}>
            {/* ===== COVER IMAGE ===== */}
            {shop?.coverImage ? (
              <div style={{ 
                width: "100%", 
                height: 220,
                position: "relative",
                overflow: "hidden"
              }}>
                <img
                  src={toAbsUrl(shop.coverImage)}
                  alt="Cover"
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover", 
                    display: "block"
                  }}
                />
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  background: "linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent)"
                }} />
              </div>
            ) : (
              <div style={{ 
                width: "100%", 
                height: 220, 
                background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #1e293b 100%)",
                position: "relative"
              }}>
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: 80,
                  opacity: 0.1
                }}>🏬</div>
              </div>
            )}

            {/* ===== AVATAR + INFO SECTION ===== */}
            <div style={{ padding: "0 28px 28px 28px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: -50 }}>
                {/* Avatar */}
                <div style={{
                  width: 130, 
                  height: 130, 
                  borderRadius: "50%", 
                  overflow: "hidden",
                  border: "5px solid rgba(15, 23, 42, 1)",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  position: "relative",
                  zIndex: 10
                }}>
                  {logoSrc ? (
                    <img src={logoSrc} alt={shopName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      width: "100%", 
                      height: "100%", 
                      display: "flex", 
                      alignItems: "center",
                      justifyContent: "center", 
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      color: "white", 
                      fontSize: 48, 
                      fontWeight: 700,
                      letterSpacing: 1
                    }}>
                      {shopName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name + Stats (if needed) */}
                <div style={{ flex: 1, paddingBottom: 8 }}>
                  <h1 style={{ 
                    fontSize: 32, 
                    fontWeight: 700, 
                    color: "#ffffff", 
                    margin: 0,
                    letterSpacing: "-0.02em",
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
                  }}>
                    {shopName}
                  </h1>
                </div>
              </div>
              
              {/* Bio Section */}
              {(shop?.bio || shop?.description) && (
                <div style={{ 
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)"
                }}>
                  <p style={{ 
                    fontSize: 15.5, 
                    lineHeight: 1.7, 
                    color: "#e2e8f0", 
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    fontWeight: 400
                  }}>
                    {shop.bio || shop.description}
                  </p>
                </div>
              )}

              {/* Country */}
              {shop?.country && (
                <div style={{ 
                  marginTop: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  borderRadius: 8,
                  border: "1px solid rgba(255, 255, 255, 0.06)"
                }}>
                  <span style={{ fontSize: 14 }}>📍</span>
                  <span style={{ 
                    fontSize: 13.5, 
                    color: "#94a3b8",
                    fontWeight: 500,
                    letterSpacing: "0.01em"
                  }}>
                    {shop.country}
                  </span>
                </div>
              )}
            </div>

          {/* ===== ACTION BUTTONS ===== */}
          <div style={{ 
            padding: "0 28px 28px 28px",
            display: "flex",
            gap: 12,
            flexWrap: "wrap"
          }}>
            <button
              type="button"
              onClick={handleToggleFollow}
              disabled={followLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                background: isFollowing ? "rgba(59, 130, 246, 0.1)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                border: isFollowing ? "1.5px solid rgba(59, 130, 246, 0.4)" : "none",
                borderRadius: 10,
                color: isFollowing ? "#60a5fa" : "#ffffff",
                fontSize: 14.5,
                fontWeight: 600,
                cursor: followLoading ? "wait" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: isFollowing ? "none" : "0 4px 12px rgba(59, 130, 246, 0.3)",
                opacity: followLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!followLoading && !isFollowing) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = isFollowing ? "none" : "0 4px 12px rgba(59, 130, 246, 0.3)";
              }}
            >
              <Heart size={16} fill={isFollowing ? "currentColor" : "none"} strokeWidth={isFollowing ? 0 : 2} />
              {followLoading ? "..." : isFollowing ? "Following" : "Follow Shop"}
            </button>
            
            <button 
              type="button" 
              onClick={goToShopMallPreview}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                background: "rgba(139, 92, 246, 0.1)",
                border: "1.5px solid rgba(139, 92, 246, 0.3)",
                borderRadius: 10,
                color: "#a78bfa",
                fontSize: 14.5,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
              }}
            >
              <span>🏬</span> Shop Mall
            </button>
            
            <button 
              type="button" 
              onClick={() => nav("/feed")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1.5px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 10,
                color: "#94a3b8",
                fontSize: 14.5,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.color = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              ← Back to Feed
            </button>
          </div>
        </div>
        )}

        {err ? <div className="sfp-err">{err}</div> : null}

        {loading ? (
          <div className="sfp-note">Loading…</div>
        ) : featured.length ? (
          <ProductsRowMarquee products={featured.slice(0, 12)} onOpenUserProduct={openUserProduct} />
        ) : (
          <div className="sfp-note">No featured products yet.</div>
        )}

        {loading ? (
          <div className="sfp-note">Loading posts…</div>
        ) : posts.length === 0 ? (
          <div className="sfp-note">No posts yet.</div>
        ) : (
          <div className="sf-list">
            {posts.map((p) => {
              const postId = p._id || p.id;
              
              // ✅ Better media detection - check multiple sources and backend isVideo flag
              let media = "";
              let isVid = false;
              
              // Check mediaUrl first (backend now normalizes this)
              if (p?.mediaUrl) {
                media = assetUrl(p.mediaUrl);
                isVid = p?.isVideo || isVideoUrl(media);
              }
              // Check videoUrl specifically
              else if (p?.videoUrl) {
                media = assetUrl(p.videoUrl);
                isVid = true;
              }
              // Check imageUrl
              else if (p?.imageUrl) {
                media = assetUrl(p.imageUrl);
                isVid = isVideoUrl(media);
              }
              // Check media array
              else if (Array.isArray(p?.media) && p.media[0]?.url) {
                media = assetUrl(p.media[0].url);
                isVid = p.media[0]?.isVideo || p.media[0]?.type === "video" || isVideoUrl(media);
              }

              const likeCount = Array.isArray(p?.likes) ? p.likes.length : 0;
              const likedByMe = p?.likedByMe || false;
              const commentsFlat = Array.isArray(p?.comments) ? p.comments : [];
              const commentCount = commentsFlat.length;

              const commentTree = buildCommentTree(commentsFlat);
              
              const shopLogo = logoSrc || "";
              const shopName = shop?.shopName || shop?.name || "Shop";
              
              // Debug log to see shop data
              if (posts.indexOf(p) === 0) console.log('[ShopFeed] shop data:', shop, 'shopLogo:', shopLogo);

              return (
                <div key={postId} className="sf-card sf-post">
                  <div className="sf-post-head">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {shopLogo ? (
                        <img 
                          src={shopLogo} 
                          alt={shopName}
                          style={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: "50%", 
                            objectFit: "cover",
                            border: "2px solid rgba(255,255,255,0.1)"
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: "50%", 
                          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#fff"
                        }}>
                          {shopName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="sf-name">{shopName}</div>
                        <div className="sf-meta">{timeAgo(p.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  {p.text ? <div className="sf-post-text">{p.text}</div> : null}

                  {media ? (
                    <div className="sf-media">
                      {isVid ? (
                        <video className="sf-video" controls src={media} />
                      ) : (
                        <img className="sf-img" src={media} alt="" />
                      )}
                    </div>
                  ) : null}

                  <div className="sf-post-actions">
                    <button className="sf-pill" type="button" onClick={() => handleLike(postId)}>
                      {likedByMe ? "❤️ Liked" : "👍 Like"} <span className="sf-pill-num">{likeCount}</span>
                    </button>

                    <button
                      className="sf-pill sf-pill-muted"
                      type="button"
                      onClick={() => {
                        setOpenCommentsFor((cur) => (cur === postId ? null : postId));
                        setReplyTo(null);
                        setCommentText("");
                      }}
                    >
                      💬 Comments <span className="sf-pill-num">{commentCount}</span>
                    </button>
                  </div>

                  {openCommentsFor === postId && (
                    <div className="sf-comments-panel">
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>Comments</div>

                      {commentTree.length === 0 ? (
                        <div className="sf-empty-comments">No comments yet.</div>
                      ) : (
                        <div className="sf-comments">
                          {commentTree.map((c) => (
                            <CommentNode
                              key={String(c._id || c.id || Math.random())}
                              node={c}
                              onReply={(id) => setReplyTo(id)}
                              onLike={(commentId) => handleLikeComment(postId, commentId)}
                            />
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: 12 }}>
                        {replyTo ? (
                          <div style={{ marginBottom: 8 }}>
                            Replying… <button type="button" onClick={() => setReplyTo(null)}>cancel</button>
                          </div>
                        ) : null}

                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                          rows={2}
                          className="sf-input"
                        />

                        <div style={{ marginTop: 8, textAlign: "right" }}>
                          <button className="sf-btn sf-btn-secondary" type="button" onClick={() => handleAddComment(postId)}>
                            {replyTo ? "Add Reply" : "Add Comment"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

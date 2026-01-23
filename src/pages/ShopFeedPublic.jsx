import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE, likeShopPost, addShopPostComment, likeShopPostComment, followShop, unfollowShop, checkShopFollowStatus } from "../api.jsx";
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
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  // uploads served from BASE (not /api)
  if (s.startsWith("/")) return BASE + s;
  return BASE + "/" + s;
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
    if (s) return assetUrl(s);
  }

  if (Array.isArray(prod.images) && prod.images.length > 0) {
    const first = String(prod.images[0] || "").trim();
    if (first) return assetUrl(first);
  }

  if (Array.isArray(prod.media?.images) && prod.media.images.length > 0) {
    const first = String(prod.media.images[0] || "").trim();
    if (first) return assetUrl(first);
  }

  if (prod.media?.image) {
    const first = String(prod.media.image || "").trim();
    if (first) return assetUrl(first);
  }

  if (prod.filename) {
    const first = String(prod.filename || "").trim();
    if (first) return assetUrl(`/uploads/shop-products/${first}`);
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

  return (
    <div className="sfp-marquee-wrap">
      <style>{`
        .sfp-marquee-viewport{ overflow:hidden; width:100%; }
        .sfp-marquee-track{
          display:flex;
          gap:14px;
          width:max-content;
          animation: sfpMoveLeft 26s linear infinite;
        }
        .sfp-marquee-viewport:hover .sfp-marquee-track{ animation-play-state: paused; }
        @keyframes sfpMoveLeft{
          0%{ transform: translateX(0); }
          100%{ transform: translateX(-50%); }
        }
      `}</style>

      <div className="sfp-marquee-head">
        <div className="sfp-marquee-title">Featured Products</div>
        <div className="sfp-marquee-sub">Moving left • Hover to pause</div>
      </div>

      <div className="sfp-marquee-viewport">
        <div className="sfp-marquee-track">
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
                onClick={() => onOpenUserProduct(pid)}
                onKeyDown={(e) => e.key === "Enter" && onOpenUserProduct(pid)}
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

  // Debug logging
  console.log('[ShopFeed] API Response:', data);
  if (data?.posts?.length > 0) {
    console.log('[ShopFeed] First post author:', data.posts[0].author);
    console.log('[ShopFeed] First post comments:', data.posts[0].comments?.slice(0, 2));
  }

  return data;
}

/* =========================
   ✅ Shop App URL (optional)
   ========================= */
const SHOP_APP_URL =
  import.meta.env.VITE_SHOP_APP_URL ||
  import.meta.env.VITE_SHOP_FRONTEND_URL ||
  "http://localhost:3000";

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
    const commenter = node?.author || node?.user || {};
    const name = commenter?.displayName || commenter?.name || commenter?.username || "User";
    const avatarUrl = commenter?.avatarUrl || "";
    const likesCount = Array.isArray(node?.likes) ? node.likes.length : 0;
    
    // Debug log to see what we're getting
    if (depth === 0) console.log('[CommentNode] author data:', commenter, 'avatarUrl:', avatarUrl);
    
    return (
      <div style={{ marginLeft: depth * 12, marginTop: 8, paddingBottom: 8, borderBottom: depth === 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
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
            <div style={{ 
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
            }}>
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{name}</div>
        </div>
        <div style={{ fontSize: 13, marginTop: 4, marginLeft: 40, color: "rgba(255,255,255,0.8)" }}>{node.text}</div>
        <div style={{ marginTop: 6, marginLeft: 40, display: "flex", gap: 8 }}>
          <button className="sfp-miniBtn" type="button" onClick={() => onLike(node._id || node.id)}>
            👍 {likesCount > 0 ? `(${likesCount})` : "Like"}
          </button>
          <button className="sfp-miniBtn" type="button" onClick={() => onReply(node._id || node.id)}>
            💬 Reply
          </button>
        </div>
        {Array.isArray(node.children) && node.children.length > 0
          ? node.children.map((c) => <CommentNode key={String(c._id || c.id || Math.random())} node={c} depth={depth + 1} onReply={onReply} onLike={onLike} />)
          : null}
      </div>
    );
  }

  async function handleLike(postId) {
    if (!postId || !safeShopId) return;
    try {
      const result = await likeShopPost(safeShopId, postId);
      // Update local state without reloading
      setPosts(posts.map(p => {
        if ((p._id || p.id) === postId) {
          return {
            ...p,
            likes: result.liked 
              ? [...(p.likes || []), 'current-user'] 
              : (p.likes || []).filter((_, i) => i < (p.likes || []).length - 1)
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
    try {
      const result = await likeShopPostComment(safeShopId, postId, commentId);
      // Update local state without reloading
      setPosts(posts.map(p => {
        if ((p._id || p.id) === postId) {
          return {
            ...p,
            comments: (p.comments || []).map(c => {
              const cid = String(c._id || c.id);
              if (cid === String(commentId)) {
                return {
                  ...c,
                  likes: result.liked 
                    ? [...(c.likes || []), 'current-user']
                    : (c.likes || []).filter((_, i) => i < (c.likes || []).length - 1)
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
    
    // Load follow status
    async function loadFollowStatus() {
      if (!safeShopId) return;
      try {
        const { following } = await checkShopFollowStatus(safeShopId);
        setIsFollowing(following);
      } catch (err) {
        console.error("Failed to check follow status:", err);
      }
    }
    loadFollowStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeShopId]);

  const title = useMemo(() => shop?.shopName || shop?.name || "Shop Feed", [shop]);

  function goToShopMallPreview() {
    if (!safeShopId) return;
    nav(`/shop/${encodeURIComponent(safeShopId)}/mall`);
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
    <div className="sfp-page">
      <div className="sfp-surface">
        <div className="sfp-top">
          <button className="sfp-btn sfp-btn-ghost" onClick={() => nav(-1)} type="button">
            ← Back
          </button>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              className={`sfp-btn ${isFollowing ? "sfp-btn-following" : "sfp-btn-follow"}`}
              onClick={handleToggleFollow}
              disabled={followLoading}
              type="button"
              title={isFollowing ? "Unfollow shop" : "Follow shop"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: isFollowing ? "#dc2626" : "#10b981",
                color: "#fff",
                border: "none"
              }}
            >
              <Heart 
                size={16} 
                fill={isFollowing ? "#fff" : "none"}
                strokeWidth={isFollowing ? 0 : 2}
              />
              {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
            </button>

            <button
              className="sfp-btn sfp-btn-primary"
              onClick={goToShopMallPreview}
              type="button"
              title="Open this shop's Mall Preview"
            >
              🏬 Shop Mall
            </button>

            {SHOW_OPEN_SHOP_APP ? (
              <button
                className="sfp-btn sfp-btn-ghost"
                onClick={openShopAppNewTab}
                type="button"
                title="Open shop frontend in a new tab"
              >
                ↗ Open Shop App
              </button>
            ) : null}

            <button className="sfp-btn sfp-btn-ghost" onClick={load} disabled={loading} type="button">
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="sfp-h1">{title}</div>
        <div className="sfp-sub">Public users view — featured products on top + posts below</div>

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
          <div className="sfp-list">
            {posts.map((p) => {
              const postId = p._id || p.id;
              const media =
                assetUrl(p?.mediaUrl) ||
                assetUrl(p?.imageUrl) ||
                assetUrl(p?.videoUrl) ||
                (Array.isArray(p?.media) && p.media[0]?.url ? assetUrl(p.media[0].url) : "");

              const isVid = isVideoUrl(media);

              const likeCount = Array.isArray(p?.likes) ? p.likes.length : 0;
              const commentsFlat = Array.isArray(p?.comments) ? p.comments : [];
              const commentCount = commentsFlat.length;

              const commentTree = buildCommentTree(commentsFlat);
              
              const shopLogo = shop?.logoUrl || shop?.logo || "";
              const shopName = shop?.shopName || shop?.name || "Shop";
              
              // Debug log to see shop data
              if (posts.indexOf(p) === 0) console.log('[ShopFeed] shop data:', shop, 'shopLogo:', shopLogo);

              return (
                <div key={postId} className="sfp-card">
                  <div className="sfp-head">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {shopLogo ? (
                        <img 
                          src={assetUrl(shopLogo)} 
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
                        <div className="sfp-name">{shopName}</div>
                        <div className="sfp-meta">{timeAgo(p.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  {p.text ? <div className="sfp-text">{p.text}</div> : null}

                  {media ? (
                    <div className="sfp-mediaWrap">
                      {isVid ? (
                        <video className="sfp-media" controls src={media} />
                      ) : (
                        <img className="sfp-media" src={media} alt="" />
                      )}
                    </div>
                  ) : null}

                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button className="sfp-miniBtn" type="button" onClick={() => handleLike(postId)}>
                      👍 Like ({likeCount})
                    </button>

                    <button
                      className="sfp-miniBtn"
                      type="button"
                      onClick={() => {
                        setOpenCommentsFor((cur) => (cur === postId ? null : postId));
                        setReplyTo(null);
                        setCommentText("");
                      }}
                    >
                      💬 Comments ({commentCount})
                    </button>
                  </div>

                  {openCommentsFor === postId && (
                    <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 12 }}>
                      <div style={{ fontWeight: 700 }}>Comments</div>

                      {commentTree.length === 0 ? (
                        <div style={{ marginTop: 8, color: "rgba(255,255,255,0.5)" }}>No comments yet.</div>
                      ) : (
                        <div style={{ marginTop: 8 }}>
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
                          style={{ width: "100%", padding: 8, borderRadius: 6 }}
                        />

                        <div style={{ marginTop: 8, textAlign: "right" }}>
                          <button className="sfp-miniBtn" type="button" onClick={() => handleAddComment(postId)}>
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

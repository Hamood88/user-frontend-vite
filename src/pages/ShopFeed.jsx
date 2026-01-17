// user-frontend-vite/src/pages/ShopFeed.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, API_BASE } from "../api.jsx";

function absUrl(u) {
  if (!u) return "";
  const s = String(u);
  // Fix localhost URLs to use production API_BASE
  if (s.includes("localhost:5000")) return s.replace(/http:\/\/localhost:5000/g, API_BASE);
  if (s.includes("127.0.0.1:5000")) return s.replace(/http:\/\/127\.0\.0\.1:5000/g, API_BASE);
  // Already absolute URL
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  // Relative path - add API_BASE
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  return `${API_BASE}/${s}`;
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
  if (!url) return false;
  const u = String(url).toLowerCase();
  return u.endsWith(".mp4") || u.endsWith(".mov") || u.endsWith(".webm") || u.includes("video");
}

function normalizePostMediaUrl(post) {
  const raw =
    post?._mediaUrl ||
    post?.mediaUrl ||
    post?.imageUrl ||
    post?.videoUrl ||
    post?.mediaPath ||
    post?.fileUrl ||
    post?.file ||
    (Array.isArray(post?.media) ? post.media?.[0]?.url : "") ||
    "";
  return raw ? absUrl(raw) : "";
}

function pickImage(p) {
  if (!p) return "";
  const imgs = Array.isArray(p.images) ? p.images : [];
  if (imgs[0]) return absUrl(imgs[0]);

  const mImgs = Array.isArray(p?.media?.images) ? p.media.images : [];
  if (mImgs[0]) return absUrl(mImgs[0]);

  if (p?.media?.image) return absUrl(p.media.image);

  const fallback = p.image || p.mainImage || p.photo || p.thumbnail || "";
  return fallback ? absUrl(fallback) : "";
}

function safeArr(x) {
  return Array.isArray(x) ? x : [];
}

async function loadPublicShopFeed(shopId) {
  // Try multiple possible public endpoints so it works even if backend route name differs.
  const tries = [
    `/api/public/shops/${shopId}/feed`,
    `/api/public/shop/${shopId}/feed`,
    `/api/public/feed/shop/${shopId}`,
    `/api/public/posts/shop/${shopId}`,
  ];

  let lastErr = null;

  for (const path of tries) {
    try {
      const out = await apiGet(path, { auth: false });

      // accept many shapes:
      const list =
        out?.posts ||
        out?.items ||
        out?.feed ||
        out?.data ||
        (Array.isArray(out) ? out : []);

      const posts = safeArr(list);
      return posts;
    } catch (e) {
      lastErr = e;
    }
  }

  // if none exists, return empty list (don’t crash the page)
  if (lastErr) {
    // just rethrow a friendly message
    throw new Error(lastErr?.message || "No public shop feed endpoint found");
  }
  return [];
}

export default function ShopFeed() {
  const { shopId } = useParams();
  const nav = useNavigate();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // local UI state for comments (frontend-only; you can wire backend later)
  const [commentDraft, setCommentDraft] = useState({}); // { [postId]: "text" }

  async function loadAll() {
    if (!shopId) return;

    setLoading(true);
    setErr("");

    try {
      // ✅ Public shop page: shop + products
      const d = await apiGet(`/api/public/shops/${shopId}`, { auth: false });
      setShop(d?.shop || null);
      setProducts(Array.isArray(d?.products) ? d.products : []);

      // ✅ Public shop feed posts
      const feedPosts = await loadPublicShopFeed(shopId);
      setPosts(Array.isArray(feedPosts) ? feedPosts : []);
    } catch (e) {
      setErr(e?.message || "Failed to load shop feed");
      setShop(null);
      setProducts([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const featuredProducts = useMemo(() => (products || []).slice(0, 6), [products]);

  // ✅ Like (frontend optimistic; if you later add public like endpoint we can call it)
  function toggleLike(postId) {
    setPosts((prev) =>
      (prev || []).map((p) => {
        const id = String(p._id || p.id || "");
        if (id !== String(postId)) return p;

        const liked = !p.likedByMe;
        const likesCount =
          typeof p.likesCount === "number"
            ? Math.max(0, p.likesCount + (liked ? 1 : -1))
            : Math.max(0, (Array.isArray(p.likes) ? p.likes.length : 0) + (liked ? 1 : -1));

        return { ...p, likedByMe: liked, likesCount };
      })
    );
  }

  // ✅ Add comment (frontend-only for now)
  function addComment(postId) {
    const t = String(commentDraft[postId] || "").trim();
    if (!t) return;

    setPosts((prev) =>
      (prev || []).map((p) => {
        const id = String(p._id || p.id || "");
        if (id !== String(postId)) return p;

        const newComment = {
          _id: `tmp-${Math.random()}`,
          text: t,
          createdAt: new Date().toISOString(),
          author: { name: "You" },
          replies: [],
        };

        const old = safeArr(p.comments);
        return { ...p, comments: [...old, newComment] };
      })
    );

    setCommentDraft((prev) => ({ ...prev, [postId]: "" }));
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, color: "#fff" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => nav(-1)}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          ← Back
        </button>

        <button
          onClick={() => nav("/feed")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(168,85,247,0.35)",
            background: "rgba(168,85,247,0.18)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 900,
          }}
          title="Back to your feed"
        >
          ← User Feed
        </button>

        <div style={{ fontSize: 22, fontWeight: 900 }}>
          {shop?.shopName ? `${shop.shopName} · Feed` : "Shop Feed"}
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => nav(`/shop/${shopId}`)} // ✅ user-frontend-vite mall page
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(59,130,246,0.35)",
            background: "rgba(59,130,246,0.18)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          See Shop Mall →
        </button>

        <button
          onClick={loadAll}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ opacity: 0.8 }}>Loading…</div>
      ) : err ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(239,68,68,0.35)",
            background: "rgba(239,68,68,0.12)",
            fontWeight: 900,
          }}
        >
          ❌ {err}
        </div>
      ) : (
        <>
          {/* Featured products (top) */}
          {featuredProducts.length ? (
            <div
              style={{
                marginBottom: 14,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 950, marginBottom: 10 }}>Featured Products</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {featuredProducts.map((p) => {
                  const img = pickImage(p);
                  const price = Number(p?.localPrice ?? p?.price ?? p?.displayPrice ?? 0);
                  const currency = (p?.currency || "USD").toUpperCase();

                  return (
                    <div
                      key={p._id || p.id}
                      onClick={() => nav(`/mall/product/${p._id || p.id}`)}
                      style={{
                        cursor: "pointer",
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(0,0,0,0.18)",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ height: 160, background: "rgba(0,0,0,0.25)" }}>
                        {img ? (
                          <img
                            alt={p.title || "Product"}
                            src={img}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : null}
                      </div>

                      <div style={{ padding: 12 }}>
                        <div style={{ fontWeight: 900 }}>{p.title || "Untitled"}</div>
                        <div style={{ opacity: 0.85, marginTop: 6 }}>
                          {currency} {Number.isFinite(price) ? price.toFixed(2) : "0.00"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Posts feed */}
          <div style={{ fontWeight: 950, marginBottom: 10 }}>Posts</div>

          {(posts || []).length === 0 ? (
            <div style={{ opacity: 0.8 }}>No posts yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {(posts || []).map((p) => {
                const postId = String(p._id || p.id || "");
                const media = normalizePostMediaUrl(p);

                const likes =
                  typeof p.likesCount === "number"
                    ? p.likesCount
                    : Array.isArray(p.likes)
                    ? p.likes.length
                    : 0;

                const comments = safeArr(p.comments);

                return (
                  <div
                    key={postId}
                    style={{
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.05)",
                      padding: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 950 }}>
                          {p.author?.shopName || shop?.shopName || "Shop"}
                        </div>
                        <div style={{ opacity: 0.75, fontWeight: 800, fontSize: 12 }}>
                          {timeAgo(p.createdAt || p.updatedAt)}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/feed/shop/${shopId}`;
                          navigator.clipboard?.writeText(shareUrl).catch(() => {});
                          alert("Link copied ✅");
                        }}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(0,0,0,0.18)",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                        type="button"
                      >
                        Share
                      </button>
                    </div>

                    {p.text ? (
                      <div style={{ marginTop: 10, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                        {p.text}
                      </div>
                    ) : null}

                    {media ? (
                      <div style={{ marginTop: 10, borderRadius: 14, overflow: "hidden" }}>
                        {isVideoUrl(media) ? (
                          <video style={{ width: "100%", display: "block" }} controls src={media} />
                        ) : (
                          <img
                            alt="post"
                            src={media}
                            style={{ width: "100%", display: "block", objectFit: "cover" }}
                          />
                        )}
                      </div>
                    ) : null}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                      <button
                        onClick={() => toggleLike(postId)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(0,0,0,0.18)",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                        type="button"
                      >
                        {p.likedByMe ? "❤️ Liked" : "🤍 Like"}{" "}
                        <span style={{ opacity: 0.85 }}>({likes})</span>
                      </button>

                      <div
                        style={{
                          padding: "8px 12px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(0,0,0,0.18)",
                          color: "#fff",
                          fontWeight: 900,
                          opacity: 0.9,
                        }}
                      >
                        💬 Comments ({comments.length})
                      </div>
                    </div>

                    {/* Comment box */}
                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                      <input
                        value={commentDraft[postId] || ""}
                        onChange={(e) =>
                          setCommentDraft((prev) => ({ ...prev, [postId]: e.target.value }))
                        }
                        placeholder="Write a comment…"
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(0,0,0,0.18)",
                          color: "#fff",
                          outline: "none",
                          fontWeight: 800,
                        }}
                      />
                      <button
                        onClick={() => addComment(postId)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: "1px solid rgba(34,197,94,0.35)",
                          background: "rgba(34,197,94,0.18)",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                        type="button"
                      >
                        Send
                      </button>
                    </div>

                    {/* Comments list */}
                    {comments.length ? (
                      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                        {comments.slice(0, 6).map((c) => (
                          <div
                            key={c._id || c.id || Math.random()}
                            style={{
                              padding: 10,
                              borderRadius: 12,
                              border: "1px solid rgba(255,255,255,0.08)",
                              background: "rgba(0,0,0,0.18)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <div style={{ fontWeight: 950 }}>
                                {c.author?.shopName || c.author?.name || "User"}
                              </div>
                              <div style={{ opacity: 0.7, fontSize: 12, fontWeight: 800 }}>
                                {timeAgo(c.createdAt)}
                              </div>
                            </div>
                            <div style={{ marginTop: 6, opacity: 0.95 }}>{c.text}</div>
                          </div>
                        ))}
                        {comments.length > 6 ? (
                          <div style={{ opacity: 0.75, fontWeight: 800, fontSize: 12 }}>
                            + {comments.length - 6} more comments…
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

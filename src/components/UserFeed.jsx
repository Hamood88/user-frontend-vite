import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, API_BASE } from "../api.jsx";

function absUrl(u) {
  if (!u) return "";
  const s = String(u);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  return `${API_BASE}/${s}`;
}

function timeAgo(ts) {
  if (!ts) return "";
  const d = new Date(ts);
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

async function tryMany(paths, opts) {
  let lastErr = null;
  for (const p of paths) {
    try {
      const data = await apiGet(p, opts);
      return { ok: true, path: p, data };
    } catch (e) {
      lastErr = e;
    }
  }
  return { ok: false, error: lastErr };
}

function pickPostText(post) {
  return post?.text || post?.content || post?.caption || post?.message || post?.body || "";
}

function pickPostMedia(post) {
  // ✅ FIX: handle media array returned by your shopPostsRoutes
  const mediaArrUrl =
    Array.isArray(post?.media) && post.media[0] && post.media[0].url ? post.media[0].url : "";

  const img =
    post?.image ||
    post?.photo ||
    post?.imageUrl ||
    post?.mediaUrl ||
    mediaArrUrl ||
    (Array.isArray(post?.images) && post.images[0]) ||
    (Array.isArray(post?.media?.images) && post.media.images[0]) ||
    "";

  const vid =
    post?.video ||
    post?.videoUrl ||
    (Array.isArray(post?.media) && post.media[0] && post.media[0].type === "video"
      ? post.media[0].url
      : "") ||
    post?.media?.video ||
    post?.media?.videoUrl ||
    "";

  return {
    image: img ? absUrl(img) : "",
    video: vid ? absUrl(vid) : "",
  };
}

function pickActorName(post, mode, headerName) {
  if (mode === "shop") {
    return (
      post?.author?.shopName ||
      post?.shopId?.shopName ||
      post?.shop?.shopName ||
      post?.shopName ||
      headerName ||
      "Shop"
    );
  }

  return (
    post?.user?.firstName ||
    post?.user?.name ||
    post?.authorName ||
    headerName ||
    "User"
  );
}

export default function UserFeed() {
  const nav = useNavigate();
  const { userId, shopId } = useParams();

  const mode = shopId ? "shop" : "user";
  const id = shopId || userId;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [header, setHeader] = useState(null);
  const [posts, setPosts] = useState([]);

  const title = useMemo(() => {
    const name =
      (mode === "shop" ? header?.shopName : header?.firstName) ||
      header?.name ||
      header?.shopName ||
      "";
    return name || (mode === "shop" ? "Shop feed" : "User feed");
  }, [header, mode]);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!id) return;

      setLoading(true);
      setErr("");

      try {
        // ✅ HEADER
        if (mode === "shop") {
          const shopRes = await tryMany(
            [
              `/api/public/shops/${id}`,
              `/api/public/shop/${id}`,
              `/api/shops/${id}`,
            ],
            { auth: false }
          );

          if (shopRes.ok && alive) {
            const s = shopRes.data?.shop || shopRes.data || null;
            setHeader(s);
          }
        } else {
          const userRes = await tryMany(
            [
              `/api/users/${id}`,
              `/api/public/users/${id}`,
              `/api/public/user/${id}`,
            ],
            { auth: true }
          );

          if (userRes.ok && alive) {
            const u = userRes.data?.user || userRes.data || null;
            setHeader(u);
          }
        }

        // ✅ POSTS
        if (mode === "shop") {
          // ✅ FIX: DO NOT tryMany here.
          // Always use the correct endpoint that filters by shopId:
          const shopPosts = await apiGet(`/api/shop/posts/shop/${id}`, { auth: true });

          const raw = shopPosts?.posts || [];
          const arr = Array.isArray(raw) ? raw : [];

          if (alive) setPosts(arr);
        } else {
          // user feed can still try multiple if your backend differs
          const userPostsRes = await tryMany(
            [
              `/api/posts/user/${id}`,
              `/api/posts/by-user/${id}`,
              `/api/posts/feed/user/${id}`,
            ],
            { auth: true }
          );

          if (!userPostsRes.ok) {
            throw userPostsRes.error || new Error("Failed to load feed");
          }

          const raw =
            userPostsRes.data?.posts ||
            userPostsRes.data?.data ||
            userPostsRes.data ||
            [];

          const arr = Array.isArray(raw) ? raw : [];
          if (alive) setPosts(arr);
        }
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load feed");
        setPosts([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, mode]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, color: "#fff" }}>
      <div
        style={{
          borderRadius: 18,
          padding: 16,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.05)",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ opacity: 0.7, marginTop: 2 }}>
            {mode === "shop" ? "Shop feed" : "User feed"}
          </div>
        </div>

        <button
          onClick={() => nav(-1)}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>

      {err ? (
        <div
          style={{
            padding: 12,
            borderRadius: 14,
            background: "rgba(239,68,68,0.18)",
            border: "1px solid rgba(239,68,68,0.35)",
            fontWeight: 900,
            marginBottom: 12,
          }}
        >
          ❌ {err}
        </div>
      ) : null}

      {loading ? (
        <div style={{ opacity: 0.8, fontWeight: 800 }}>Loading…</div>
      ) : posts.length === 0 ? (
        <div
          style={{
            padding: 14,
            borderRadius: 16,
            border: "1px dashed rgba(255,255,255,0.18)",
            opacity: 0.85,
            fontWeight: 800,
          }}
        >
          No posts yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {posts.map((post) => {
            const text = pickPostText(post);
            const { image, video } = pickPostMedia(post);
            const name = pickActorName(post, mode, title);
            const when = timeAgo(post?.createdAt || post?.timestamp);

            const likesCount = Array.isArray(post?.likes)
              ? post.likes.length
              : (post?.likesCount ?? 0);

            const commentsCount = Array.isArray(post?.comments)
              ? post.comments.length
              : (post?.commentsCount ?? 0);

            return (
              <div
                key={post?._id || `${Math.random()}`}
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.05)",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 900 }}>{name}</div>
                    <div style={{ opacity: 0.7, fontWeight: 800 }}>{when}</div>
                  </div>

                  {text ? (
                    <div style={{ marginTop: 10, opacity: 0.92, whiteSpace: "pre-wrap" }}>
                      {text}
                    </div>
                  ) : null}
                </div>

                {video ? (
                  <video
                    controls
                    src={video}
                    style={{ width: "100%", display: "block", background: "#000" }}
                  />
                ) : image ? (
                  <img
                    alt=""
                    src={image}
                    style={{ width: "100%", display: "block", background: "#000" }}
                  />
                ) : null}

                <div
                  style={{
                    padding: 12,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    opacity: 0.9,
                    fontWeight: 800,
                  }}
                >
                  <span>❤️ {likesCount}</span>
                  <span>💬 {commentsCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

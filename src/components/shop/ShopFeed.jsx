// src/components/shop/ShopFeed.jsx
import React, { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import TopBar from "../TopBar";
import ShopSidebar, { SHOP_COLLAPSED_WIDTH } from "./ShopSidebar";

// ⚠️ IMPORTANT:
// in your user-frontend-vite you used ../api.jsx exports.
// Here you have ../../api as default export.
// Keep it exactly as your project currently works:
import API_BASE from "../../api";

function abs(u) {
  if (!u) return "";
  const s = String(u);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  // backend returns "/uploads/..."
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  return `${API_BASE}/${s}`;
}

function pickMediaUrl(post) {
  if (!post) return "";
  if (post.mediaUrl) return post.mediaUrl;
  if (Array.isArray(post.media) && post.media[0] && post.media[0].url) return post.media[0].url;
  return "";
}

function pickMediaType(post) {
  if (!post) return "image";
  if (Array.isArray(post.media) && post.media[0] && post.media[0].type) return post.media[0].type;
  const u = pickMediaUrl(post).toLowerCase();
  if (u.endsWith(".mp4") || u.endsWith(".mov") || u.endsWith(".webm") || u.includes("video")) return "video";
  return "image";
}

export default function ShopFeed() {
  // ✅ shop token first (new), fallback to old key
  const shopToken = localStorage.getItem("shopToken") || localStorage.getItem("token") || "";
  const role = localStorage.getItem("role") || "";

  // ✅ shop object (optional but good)
  let shop = null;
  try {
    shop = JSON.parse(localStorage.getItem("shop") || "null");
  } catch {}

  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const fileRef = useRef(null);

  const shell = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 16,
    paddingLeft: SHOP_COLLAPSED_WIDTH + 16,
  };

  // ✅ Dark style (matches your Moondala UI better)
  const card = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 16,
    color: "#fff",
  };

  const input = {
    width: "100%",
    padding: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 12,
    background: "rgba(0,0,0,0.25)",
    color: "#fff",
    outline: "none",
  };

  const btn = {
    padding: "10px 12px",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  };

  const primary = {
    ...btn,
    background: "rgba(34,197,94,0.18)",
    borderColor: "rgba(34,197,94,0.35)",
  };

  const loadFeed = async () => {
    if (!shopToken) return;
    setLoading(true);
    try {
      // ✅ REAL SHOP FEED (shopAuth)
      const { data } = await axios.get(`${API_BASE}/api/shop/posts/feed`, {
        headers: { Authorization: `Bearer ${shopToken}` },
      });

      const list = Array.isArray(data?.posts) ? data.posts : [];
      setPosts(list);
    } catch (e) {
      console.log("SHOP FEED LOAD ERROR:", e?.response?.data || e?.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopToken]);

  // ✅ If not logged in as a shop, redirect
  if (!shopToken || role !== "storeowner") return <Navigate to="/" replace />;

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);

    if (previewURL) URL.revokeObjectURL(previewURL);
    setPreviewURL(f ? URL.createObjectURL(f) : null);
  };

  const clear = () => {
    setText("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    if (previewURL) URL.revokeObjectURL(previewURL);
    setPreviewURL(null);
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return alert("Write something or attach a file.");

    setPosting(true);
    try {
      const fd = new FormData();
      fd.append("text", text.trim());
      if (file) fd.append("media", file); // ✅ backend expects "media"

      const { data } = await axios.post(`${API_BASE}/api/shop/posts`, fd, {
        headers: {
          Authorization: `Bearer ${shopToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const post = data?.post || null;
      if (post) setPosts((prev) => [post, ...prev]);

      clear();
    } catch (err) {
      alert(err?.response?.data?.message || "Could not create post");
    } finally {
      setPosting(false);
    }
  };

  const Media = ({ post }) => {
    const urlRel = pickMediaUrl(post);
    if (!urlRel) return null;

    const src = abs(urlRel);
    const type = pickMediaType(post);

    if (type === "video") {
      return (
        <video
          controls
          style={{ width: "100%", borderRadius: 14, marginTop: 10, background: "#000" }}
          src={src}
        />
      );
    }

    return (
      <img
        alt=""
        style={{ width: "100%", borderRadius: 14, marginTop: 10, display: "block" }}
        src={src}
      />
    );
  };

  return (
    <>
      <TopBar />
      <ShopSidebar />

      <div style={shell}>
        <main>
          {/* Composer */}
          <form onSubmit={createPost} style={{ ...card, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                {shop?.shopName ? `${shop.shopName} • Shop Feed` : "Shop Feed"}
              </div>
              <button type="button" style={btn} onClick={loadFeed} disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <textarea
              style={{ ...input, marginTop: 12 }}
              rows={3}
              placeholder="Post something to your shop feed..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={onPickFile} />
              <div style={{ flex: 1 }} />
              <button type="button" style={btn} onClick={clear}>
                Clear
              </button>
              <button type="submit" style={primary} disabled={posting || (!text.trim() && !file)}>
                {posting ? "Posting…" : "Post"}
              </button>
            </div>

            {previewURL ? (
              <div style={{ marginTop: 12 }}>
                {file?.type?.startsWith("video") ? (
                  <video controls style={{ width: "100%", borderRadius: 14 }} src={previewURL} />
                ) : (
                  <img alt="preview" style={{ width: "100%", borderRadius: 14 }} src={previewURL} />
                )}
              </div>
            ) : null}
          </form>

          {/* List */}
          {loading ? (
            <div style={{ color: "rgba(255,255,255,0.75)" }}>Loading feed…</div>
          ) : posts.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.75)" }}>
              No posts yet — post your first update above.
            </div>
          ) : (
            posts.map((p) => (
              <article key={p._id} style={{ ...card, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>
                    {p?.author?.shopName || shop?.shopName || "Shop"}
                  </div>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>
                    {p?.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                  </div>
                </div>

                {p.text || p.content || p.caption ? (
                  <div style={{ marginTop: 10, lineHeight: 1.5, opacity: 0.95 }}>
                    {p.text || p.content || p.caption}
                  </div>
                ) : null}

                <Media post={p} />

                <div style={{ marginTop: 10, display: "flex", gap: 12, opacity: 0.8, fontSize: 12 }}>
                  <div>❤️ {p.likesCount ?? (p.likes?.length || 0)}</div>
                  <div>💬 {p.commentsCount ?? (p.comments?.length || 0)}</div>
                </div>
              </article>
            ))
          )}
        </main>
      </div>
    </>
  );
}

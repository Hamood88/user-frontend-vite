// user-frontend-vite/src/components/ProductReviews.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import StarRating from "./StarRating";
import {
  request,
  API_BASE,
  getProductReviews,
  createProductReview,
  getToken,
} from "../api.jsx";

/* =========================
   Helpers
   ========================= */
function absUrl(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  const base = String(API_BASE || "http://localhost:5000").trim();
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  return s.startsWith("/") ? `${b}${s}` : `${b}/${s}`;
}

function fileKind(f) {
  const t = String(f?.type || "").toLowerCase();
  return t.startsWith("video/") ? "video" : "image";
}

function isVideoType(m) {
  const t = String(m?.type || "").toLowerCase();
  return t === "video" || t.startsWith("video/");
}

function safeNum(v, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function normalizeReviewsPayload(res) {
  // supports:
  // - {count,avg,reviews}
  // - {data:{count,avg,reviews}}
  // - {reviews:[...]} / {data:{reviews:[...]}}
  // - [ ... ] (array directly)
  // - product includes reviews: {product:{reviews:[...]}} etc.
  if (Array.isArray(res)) {
    const arr = res;
    const avg =
      arr.length > 0
        ? arr.reduce((a, r) => a + Number(r?.rating || 0), 0) / arr.length
        : 0;
    return { count: arr.length, avg, reviews: arr };
  }

  const root = res?.data ? res.data : res;

  const reviews =
    (Array.isArray(root?.reviews) && root.reviews) ||
    (Array.isArray(root?.items) && root.items) ||
    (Array.isArray(root?.product?.reviews) && root.product.reviews) ||
    (Array.isArray(root?.data?.reviews) && root.data.reviews) ||
    (Array.isArray(root?.data?.items) && root.data.items) ||
    [];

  const count =
    safeNum(root?.count, 0) ||
    safeNum(root?.total, 0) ||
    safeNum(root?.reviewsCount, 0) ||
    (Array.isArray(reviews) ? reviews.length : 0);

  const avg =
    safeNum(root?.avg, 0) ||
    safeNum(root?.average, 0) ||
    safeNum(root?.ratingAvg, 0) ||
    (Array.isArray(reviews) && reviews.length
      ? reviews.reduce((a, r) => a + safeNum(r?.rating, 0), 0) / reviews.length
      : 0);

  return { count, avg, reviews: Array.isArray(reviews) ? reviews : [] };
}

function normalizeReviewMedia(media) {
  // supports:
  // - [{url,type}]
  // - [{path,type}]
  // - ["uploads/a.jpg", "/uploads/a.jpg"]
  // - [{src:"..."}, {uri:"..."}]
  const arr = Array.isArray(media) ? media : [];
  return arr
    .map((m) => {
      if (!m) return null;

      if (typeof m === "string") {
        const url = absUrl(m);
        if (!url) return null;
        const type = url.toLowerCase().match(/\.(mp4|mov|webm|mkv)$/) ? "video" : "image";
        return { url, type };
      }

      const urlRaw = m?.url || m?.path || m?.src || m?.uri || "";
      const url = absUrl(urlRaw);
      if (!url) return null;

      const type = m?.type
        ? String(m.type)
        : url.toLowerCase().match(/\.(mp4|mov|webm|mkv)$/)
        ? "video"
        : "image";

      return { url, type };
    })
    .filter(Boolean);
}

function pickUserObj(r) {
  // backend might return: user, userId (populated), buyer, author
  return r?.user || r?.userId || r?.buyer || r?.author || null;
}

function pickUserName(r) {
  const u = pickUserObj(r);
  if (!u) return "User";

  const dn = String(u?.displayName || r?.userName || r?.displayName || "").trim();
  const fn = String(u?.firstName || "").trim();
  const ln = String(u?.lastName || "").trim();
  const em = String(u?.email || "").trim();

  if (dn) return dn;
  if (fn || ln) return `${fn} ${ln}`.trim();
  if (em) return em.split("@")[0];
  return "User";
}

function pickUserAvatar(r) {
  const u = pickUserObj(r);
  const a = u?.avatarUrl || u?.avatar || u?.photoUrl || r?.avatarUrl || "";
  return absUrl(a);
}

function normalizeOneReview(r) {
  const rating = safeNum(r?.rating ?? r?.stars ?? r?.score ?? 0, 0);

  // backend might store comment as: comment | text | review | message | body
  const comment = String(
    r?.comment ?? r?.text ?? r?.review ?? r?.message ?? r?.body ?? ""
  ).trim();

  const createdAt = r?.createdAt ?? r?.date ?? r?.time ?? null;

  return {
    ...r,
    rating,
    comment,
    createdAt,
    userName: pickUserName(r),
    userAvatar: pickUserAvatar(r),
    media: normalizeReviewMedia(r?.media || r?.images || r?.attachments || []),
  };
}

export default function ProductReviews({
  productId,
  orderId = "",
  canWrite = false,
  defaultOpen = false,
  onPosted,
}) {
  const [data, setData] = useState({ count: 0, avg: 0, reviews: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(!!defaultOpen);
  const [composeOpen, setComposeOpen] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const uploadRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);

  async function load() {
    const pid = String(productId || "").trim();
    if (!pid) {
      setData({ count: 0, avg: 0, reviews: [] });
      setErr("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");

    const hasToken = !!getToken();

    // ✅ try helper first, then try endpoints with BOTH auth true/false
    const endpoints = [
      { kind: "helper" },

      { url: `/api/products/${encodeURIComponent(pid)}/reviews`, auth: false },
      { url: `/api/products/${encodeURIComponent(pid)}/reviews`, auth: true },

      { url: `/api/public/products/${encodeURIComponent(pid)}/reviews`, auth: false },

      { url: `/api/reviews/product/${encodeURIComponent(pid)}`, auth: false },
      { url: `/api/reviews/product/${encodeURIComponent(pid)}`, auth: true },

      { url: `/api/reviews?productId=${encodeURIComponent(pid)}`, auth: false },
      { url: `/api/reviews?productId=${encodeURIComponent(pid)}`, auth: true },

      // fallback where product response includes reviews
      { url: `/api/products/${encodeURIComponent(pid)}`, auth: false },
      { url: `/api/products/${encodeURIComponent(pid)}`, auth: true },

      { url: `/api/public/products/${encodeURIComponent(pid)}`, auth: false },
      { url: `/api/mall/products/${encodeURIComponent(pid)}`, auth: false },
    ];

    let lastErr = null;

    for (const ep of endpoints) {
      try {
        let res;

        if (ep.kind === "helper") {
          res = await getProductReviews(pid);
        } else {
          if (ep.auth && !hasToken) continue; // don't try auth if no token
          res = await request(ep.url, { auth: ep.auth });
        }

        const normalized = normalizeReviewsPayload(res);

        const fixedReviews = (normalized.reviews || []).map(normalizeOneReview);

        setData({
          count: Number(normalized.count || fixedReviews.length || 0),
          avg: Number(normalized.avg || 0),
          reviews: fixedReviews,
        });

        setLoading(false);
        return;
      } catch (e) {
        lastErr = e;
      }
    }

    setData({ count: 0, avg: 0, reviews: [] });
    setErr(lastErr?.response?.data?.message || lastErr?.message || "Failed to load reviews");
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [productId]);

  useEffect(() => {
    setOpen(!!defaultOpen);
  }, [defaultOpen]);

  function resetMedia() {
    try {
      previews.forEach((p) => p?.url && URL.revokeObjectURL(p.url));
    } catch {}
    setFiles([]);
    setPreviews([]);
  }

  function onPickMedia(list) {
    const arr = Array.from(list || []);
    if (!arr.length) return;

    const MAX = 6;
    const merged = [...files, ...arr].slice(0, MAX);

    try {
      previews.forEach((p) => p?.url && URL.revokeObjectURL(p.url));
    } catch {}

    setFiles(merged);
    setPreviews(
      merged.map((f) => ({
        url: URL.createObjectURL(f),
        type: fileKind(f),
      }))
    );
  }

  function removeMedia(i) {
    const next = files.filter((_, idx) => idx !== i);
    resetMedia();
    setFiles(next);
    setPreviews(next.map((f) => ({ url: URL.createObjectURL(f), type: fileKind(f) })));
  }

  async function submit() {
    const token = getToken();
    if (!token) return alert("Login first to post a review.");
    if (!productId) return;

    if (!canWrite) {
      return alert("You can only review after the order is completed.");
    }

    if (rating < 1 || rating > 5) return alert("Please select rating.");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("productId", String(productId));
      if (orderId) fd.append("orderId", String(orderId));
      fd.append("rating", String(rating));

      // ✅ keep sending comment, but also send "text" for backends that expect it
      fd.append("comment", comment || "");
      fd.append("text", comment || "");

      files.forEach((f) => fd.append("media", f));

      await createProductReview(fd);

      setComposeOpen(false);
      setOpen(true);
      setRating(0);
      setComment("");
      resetMedia();

      await load();

      if (typeof onPosted === "function") onPosted();
      alert("✅ Review posted");
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to post review");
    } finally {
      setSaving(false);
    }
  }

  const avgText = useMemo(() => Number(data.avg || 0).toFixed(1), [data.avg]);

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <div>
          <div style={S.title}>Reviews</div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
            <StarRating value={data.avg} size={16} />
            <div style={S.sub}>
              {avgText} / 5 • {data.count} review{data.count === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {canWrite ? (
            <button
              type="button"
              onClick={() => setComposeOpen((v) => !v)}
              style={{ ...S.btn, ...(composeOpen ? S.btnActive : null) }}
              disabled={saving}
            >
              ⭐ {composeOpen ? "Close Review" : "Add Review"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            style={{ ...S.btnGhost, ...(open ? S.btnActive : null) }}
          >
            {open ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {composeOpen && canWrite && (
        <div style={S.composer}>
          <div style={S.row2}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={S.label}>Rating</div>
              <div style={{ marginTop: 10 }}>
                <StarRating value={rating} onChange={setRating} disabled={saving} size={22} />
              </div>
              <div style={S.microHint}>Tap stars to select rating</div>
            </div>

            <div style={{ flex: 2, minWidth: 260 }}>
              <div style={S.label}>Comment</div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={saving}
                style={S.textarea}
                rows={4}
                placeholder="Write your experience..."
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={S.label}>Photos / Video</div>

            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => onPickMedia(e.target.files)}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => onPickMedia(e.target.files)}
            />
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => onPickMedia(e.target.files)}
            />

            <div style={S.mediaActions}>
              <button
                type="button"
                style={S.btnGhost}
                onClick={() => uploadRef.current && uploadRef.current.click()}
                disabled={saving}
              >
                📤 Upload Photos
              </button>

              <button
                type="button"
                style={S.btnGhost}
                onClick={() => cameraRef.current && cameraRef.current.click()}
                disabled={saving}
              >
                📷 Take Photo
              </button>

              <button
                type="button"
                style={S.btnGhost}
                onClick={() => videoRef.current && videoRef.current.click()}
                disabled={saving}
              >
                🎥 Upload Video
              </button>

              <div style={S.mediaLimit}>Max 6 files</div>
            </div>

            {previews.length > 0 && (
              <div style={S.previewGrid}>
                {previews.map((p, idx) => (
                  <div key={p.url || idx} style={S.previewItem}>
                    {p.type === "video" ? (
                      <video src={p.url} controls style={S.previewMedia} />
                    ) : (
                      <img src={p.url} alt="" style={S.previewMedia} />
                    )}

                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      style={S.previewRemove}
                      disabled={saving}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={S.footerActions}>
            <button
              type="button"
              onClick={() => {
                setComposeOpen(false);
                setRating(0);
                setComment("");
                resetMedia();
              }}
              style={S.btnGhost}
              disabled={saving}
            >
              Cancel
            </button>

            <button type="button" onClick={submit} style={S.btnPrimary} disabled={saving}>
              {saving ? "Posting..." : "Post Review"}
            </button>
          </div>
        </div>
      )}

      {open && (
        <>
          {loading && <div style={S.note}>Loading reviews…</div>}
          {!loading && err && <div style={S.errBox}>{err}</div>}

          {!loading && !err && data.reviews.length > 0 && (
            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              {data.reviews.map((r, idx) => (
                <div key={r._id || r.id || `rev-${idx}`} style={S.reviewCard}>
                  <div style={S.reviewTop}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {r.userAvatar ? (
                        <img
                          src={r.userAvatar}
                          alt=""
                          style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.12)",
                          }}
                        />
                      )}

                      <div>
                        <div style={S.reviewName}>{r.userName || "User"}</div>
                        <StarRating value={Number(r.rating || 0)} size={14} />
                      </div>
                    </div>

                    <div style={S.reviewTime}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                    </div>
                  </div>

                  {r.comment ? <div style={S.reviewText}>{r.comment}</div> : null}

                  {Array.isArray(r.media) && r.media.length > 0 && (
                    <div style={S.mediaGrid}>
                      {r.media.map((m, mi) => {
                        const url = absUrl(m?.url || m);
                        const isVideo = typeof m === "string" ? url.endsWith(".mp4") : isVideoType(m);
                        return (
                          <div key={url || mi} style={S.mediaItem}>
                            {isVideo ? (
                              <video src={url} controls style={S.mediaThumb} />
                            ) : (
                              <img src={url} alt="" style={S.mediaThumb} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !err && data.reviews.length === 0 && (
            <div style={S.note}>No reviews yet.</div>
          )}
        </>
      )}
    </div>
  );
}

/* =========================
   Styles (your same styles)
   ========================= */
const S = {
  wrap: {
    marginTop: 10,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background:
      "radial-gradient(900px 520px at 20% 0%, rgba(59,130,246,0.12), transparent 55%), " +
      "rgba(15,23,42,0.55)",
    boxShadow: "0 12px 36px rgba(0,0,0,0.28)",
    padding: 14,
    color: "#fff",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  title: { fontWeight: 950, fontSize: 16 },
  sub: { fontSize: 12, fontWeight: 900, opacity: 0.85 },

  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 950,
  },
  btnGhost: {
    padding: "10px 12px",
    borderRadius: 12,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontWeight: 950,
    cursor: "pointer",
  },
  btnActive: {
    borderColor: "rgba(59,130,246,0.50)",
    background: "rgba(59,130,246,0.18)",
  },

  composer: {
    marginTop: 12,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(2,6,23,0.35)",
    padding: 14,
  },
  row2: { display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" },
  label: { fontWeight: 950, opacity: 0.9 },
  microHint: { marginTop: 6, fontSize: 12, fontWeight: 900, opacity: 0.55 },

  textarea: {
    width: "100%",
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(2,6,23,0.55)",
    color: "#fff",
    fontWeight: 800,
    outline: "none",
    resize: "vertical",
    colorScheme: "dark",
  },

  mediaActions: { marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" },
  mediaLimit: {
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.6,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
  },

  previewGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: 10,
  },
  previewItem: {
    position: "relative",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
    background: "rgba(255,255,255,0.04)",
    height: 110,
  },
  previewMedia: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  previewRemove: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 950,
  },

  footerActions: { marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 },

  btnPrimary: {
    padding: "10px 12px",
    borderRadius: 12,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(59,130,246,0.35)",
    background: "rgba(59,130,246,0.20)",
    color: "#fff",
    fontWeight: 950,
    cursor: "pointer",
  },

  note: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.18)",
    fontWeight: 900,
    opacity: 0.9,
  },
  errBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.14)",
    fontWeight: 950,
  },

  reviewCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 12,
  },
  reviewTop: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  reviewName: { fontWeight: 950, opacity: 0.95 },
  reviewTime: { fontSize: 12, fontWeight: 900, opacity: 0.6 },
  reviewText: { marginTop: 8, fontWeight: 800, opacity: 0.9, whiteSpace: "pre-wrap" },

  mediaGrid: {
    marginTop: 10,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: 10,
  },
  mediaItem: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
    background: "rgba(255,255,255,0.04)",
    height: 110,
  },
  mediaThumb: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
};

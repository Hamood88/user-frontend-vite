// user-frontend/src/pages/MallFeed.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, getToken, request } from "../api";

function toAbs(u) {
  if (!u) return "";
  const s = String(u);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `${API_BASE}${s.startsWith("/") ? "" : "/"}${s}`;
}

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function MallFeed() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState("");

  const loadFeed = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      // ✅ This requires auth
      const data = await request("/api/mall/feed", { method: "GET" });

      // backend styles:
      // { products: [...] } OR { data: [...] } OR array directly
      const list =
        (Array.isArray(data?.products) && data.products) ||
        (Array.isArray(data?.data) && data.data) ||
        (Array.isArray(data) && data) ||
        [];

      setProducts(list);
    } catch (err) {
      const msg = err?.message || "Failed to load mall feed";
      setError(msg);

      // ✅ if token expired, request() already clears session on 401
      if (err?.status === 401 || !getToken()) {
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const normalized = useMemo(() => {
    return (products || []).map((p) => {
      const img =
        p?.media?.images?.[0] ||
        (Array.isArray(p?.images) ? p.images[0] : "") ||
        p?.image ||
        p?.thumbnail ||
        "";
      const price = safeNum(p?.localPrice ?? p?.price ?? 0, 0);
      const currency = (p?.currency || "USD").toUpperCase();
      return { ...p, _img: toAbs(img), _price: price, _currency: currency };
    });
  }, [products]);

  async function buy(productId) {
    setBuyingId(productId);
    setError("");

    try {
      // ✅ your endpoint: POST /api/orders/buy
      const data = await request("/api/orders/buy", {
        method: "POST",
        body: { productId },
      });

      const s = data?.summary || data?.data?.summary || null;

      if (s) {
        alert(
          `✅ Purchase recorded\n\nFee: ${s.platformFeePercent}%\nPaid levels: ${s.paidLevels}\nDistributed: ${s.distributedPercent}%\nMoondala: ${s.moondalaPercent}%`
        );
      } else {
        alert("✅ Purchase recorded");
      }
    } catch (err) {
      const msg = err?.message || "Buy failed";
      alert(msg);

      if (err?.status === 401 || !getToken()) {
        navigate("/login", { replace: true });
      }
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.surface}>
        <div style={S.header}>
          <div>
            <div style={S.h1}>Mall</div>
            <div style={S.sub}>Matched products</div>
          </div>

          <button style={S.btn} onClick={loadFeed} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error ? <div style={S.error}>{error}</div> : null}

        {loading ? <div style={S.note}>Loading…</div> : null}

        {!loading && normalized.length === 0 ? (
          <div style={S.empty}>No matched products yet.</div>
        ) : null}

        <div style={S.grid}>
          {normalized.map((p) => (
            <div key={p._id} style={S.card}>
              {p._img ? (
                <img src={p._img} alt={p.title || "Product"} style={S.img} />
              ) : (
                <div style={S.noImg}>No image</div>
              )}

              <div style={S.body}>
                <div style={S.title}>{p.title || "Untitled"}</div>
                <div style={S.price}>
                  {p._currency} {p._price.toFixed(2)}
                </div>

                <button
                  style={S.buyBtn}
                  disabled={buyingId === p._id}
                  onClick={() => buy(p._id)}
                  type="button"
                >
                  {buyingId === p._id ? "Buying..." : "Buy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    padding: 18,
    color: "#fff",
    background:
      "radial-gradient(1200px 700px at 20% 0%, rgba(59,130,246,0.18), transparent 55%), " +
      "radial-gradient(1000px 600px at 85% 10%, rgba(34,197,94,0.12), transparent 55%), " +
      "linear-gradient(180deg, #0b1224 0%, #070b16 100%)",
  },
  surface: {
    maxWidth: 1100,
    margin: "0 auto",
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(15,23,42,0.55)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  h1: { fontSize: 22, fontWeight: 900 },
  sub: { opacity: 0.75, marginTop: 4, fontSize: 12 },
  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  error: {
    background: "rgba(239,68,68,0.18)",
    border: "1px solid rgba(239,68,68,0.35)",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    fontWeight: 800,
  },
  note: {
    padding: 12,
    borderRadius: 16,
    border: "1px dashed rgba(255,255,255,0.18)",
    opacity: 0.9,
    fontWeight: 800,
    marginBottom: 10,
  },
  empty: {
    padding: 16,
    border: "1px dashed rgba(255,255,255,0.18)",
    borderRadius: 12,
    opacity: 0.85,
    marginBottom: 10,
    fontWeight: 800,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 14,
  },
  card: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14,
    overflow: "hidden",
    background: "rgba(255,255,255,0.05)",
  },
  img: { width: "100%", height: 190, objectFit: "cover", background: "#000" },
  noImg: {
    width: "100%",
    height: 190,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.75,
    background: "rgba(0,0,0,0.25)",
  },
  body: { padding: 12 },
  title: { fontWeight: 900, marginBottom: 6 },
  price: { fontWeight: 900, marginBottom: 10, opacity: 0.9 },
  buyBtn: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(34,197,94,0.35)",
    background: "rgba(34,197,94,0.18)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
};

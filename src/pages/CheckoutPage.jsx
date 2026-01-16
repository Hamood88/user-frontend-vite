// user-frontend-vite/src/pages/CheckoutPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE, apiGet, apiPost, getToken } from "../api";

function makeAbsolute(url) {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  return `${API_BASE}/${s}`;
}

// ✅ removes < > and trims (fixes %3C..%3E)
function cleanId(v) {
  return String(v || "").replace(/[<>]/g, "").trim();
}

export default function CheckoutPage() {
  const params = useParams();
  const navigate = useNavigate();

  // ✅ SAFE product id
  const productId = cleanId(params.productId);

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // ✅ if URL contains < >, refresh to clean path once
  useEffect(() => {
    const raw = String(params.productId || "");
    if (raw.includes("<") || raw.includes(">")) {
      navigate(`/checkout/${productId}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    setErr("");
    setLoading(true);

    try {
      if (!productId) throw new Error("Missing product id");

      // ✅ public product endpoint (no auth)
      const data = await apiGet(`/api/public/products/${productId}`, { auth: false });

      // supports {product} or direct product
      const p = data?.product ? data.product : data;

      setProduct(p || null);
    } catch (e) {
      setErr(e?.message || "Failed to load product");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const img = useMemo(() => {
    const first = product?.images?.[0] || product?.image || product?.thumbnail || "";
    return makeAbsolute(first);
  }, [product]);

  const price = Number(product?.localPrice ?? product?.price ?? 0);
  const currency = (product?.currency || "USD").toUpperCase();
  const qtySafe = Math.max(1, Number.isFinite(Number(qty)) ? Number(qty) : 1);
  const total = qtySafe * (Number.isFinite(price) ? price : 0);

  async function placeOrder() {
    const token = getToken();
    if (!token) {
      alert("Please login first.");
      navigate("/login", { replace: true });
      return;
    }

    setBusy(true);
    setErr("");

    try {
      await apiPost("/api/orders", { productId, quantity: qtySafe });

      alert("✅ Order placed!");
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setErr(e?.message || "Order failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 18, color: "#fff" }}>Loading checkout…</div>;
  }

  if (err) {
    return (
      <div style={{ padding: 18, color: "#fff" }}>
        ❌ {err}
        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Back
          </button>

          <button
            onClick={load}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div style={{ padding: 18, color: "#fff" }}>Product not found.</div>;
  }

  return (
    <div style={{ padding: 18, color: "#fff", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ fontSize: 22, fontWeight: 900 }}>Checkout</div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 14,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div style={{ height: 280, background: "rgba(255,255,255,0.05)" }}>
          {img ? (
            <img
              alt={product.title || "Product"}
              src={img}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => console.log("❌ PRODUCT IMG FAIL:", img)}
            />
          ) : (
            <div style={{ height: "100%", display: "grid", placeItems: "center", opacity: 0.75 }}>
              No image
            </div>
          )}
        </div>

        <div style={{ padding: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{product.title}</div>
          <div style={{ opacity: 0.85, marginTop: 6 }}>{product.category}</div>

          <div style={{ marginTop: 10, fontWeight: 900 }}>
            {currency} {Number.isFinite(price) ? price.toFixed(2) : "0.00"}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontWeight: 900 }}>Quantity</div>
            <input
              type="number"
              min={1}
              value={qtySafe}
              onChange={(e) => {
                const v = Math.max(1, Math.floor(Number(e.target.value || 1)));
                setQty(v);
              }}
              style={{
                width: 90,
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.25)",
                color: "#fff",
                fontWeight: 900,
              }}
            />
          </div>

          <div style={{ marginTop: 12, fontSize: 18, fontWeight: 900 }}>
            Total: {currency} {total.toFixed(2)}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button
              onClick={placeOrder}
              disabled={busy}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {busy ? "Placing…" : "Place Order"}
            </button>

            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Back
            </button>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
            Product ID: {productId}
          </div>
        </div>
      </div>
    </div>
  );
}

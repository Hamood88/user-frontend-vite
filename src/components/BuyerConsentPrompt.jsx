// user-frontend-vite/src/components/BuyerConsentPrompt.jsx
import React, { useState } from "react";
import { request } from "../api.jsx";

export default function BuyerConsentPrompt({ productIds = [], orderId = "" }) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function send(allow) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      setDone(true);
      return;
    }

    setLoading(true);
    try {
      // ✅ save consent for each product in the order
      for (const pid of productIds) {
        await request("/api/product-questions/consent", {
          method: "POST",
          body: { productId: pid, orderId, allow },
        });
      }
      setDone(true);
    } catch (e) {
      alert(e?.message || "Failed to save consent");
    } finally {
      setLoading(false);
    }
  }

  if (done) return null;

  return (
    <div style={{ marginTop: 16, padding: 14, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12 }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>
        Help other buyers?
      </div>
      <div style={{ opacity: 0.85, marginBottom: 12 }}>
        If someone buys the same product, can they message you to ask about your experience?
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => send(true)}
          disabled={loading}
          style={{ padding: "10px 14px", borderRadius: 10, fontWeight: 900 }}
        >
          ✅ Yes, allow
        </button>
        <button
          onClick={() => send(false)}
          disabled={loading}
          style={{ padding: "10px 14px", borderRadius: 10, fontWeight: 900 }}
        >
          ❌ No thanks
        </button>
      </div>
    </div>
  );
}

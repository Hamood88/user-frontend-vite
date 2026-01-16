import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { request } from "../api.jsx";

export default function PublicShareRedirect() {
  const nav = useNavigate();
  const { shareId } = useParams();
  const [msg, setMsg] = useState("Opening product...");

  useEffect(() => {
    let live = true;

    async function go() {
      try {
        const sid = String(shareId || "").trim().toLowerCase();
        if (!sid) throw new Error("Missing share id");

        /**
         * ✅ IMPORTANT:
         * Your request() helper usually already prefixes "/api"
         * So DO NOT write "/api/..." here.
         *
         * Backend route should be:
         *   GET /api/products/public/p/:shareId
         *
         * Therefore call:
         *   /products/public/p/:shareId
         */
        const res = await request(`/products/public/p/${encodeURIComponent(sid)}`, {
          auth: false,
        });

        const productId = res?.productId || res?.id || res?._id;
        if (!productId) throw new Error("Product not found");

        /**
         * ✅ Redirect to your PUBLIC product page.
         * Use ONE of these depending on your app routes:
         *
         * - Unified public product:
         *     /product/:productId
         *
         * - Mall product page:
         *     /mall/product/:productId
         */
        const target = `/product/${encodeURIComponent(productId)}`;

        nav(target, {
          replace: true,
          state: { backTo: "/mall" },
        });
      } catch (e) {
        if (!live) return;
        setMsg(e?.message || "Failed to open this link");
      }
    }

    go();
    return () => {
      live = false;
    };
  }, [shareId, nav]);

  return (
    <div style={{ padding: 18, color: "#fff", fontWeight: 900 }}>
      {msg}
    </div>
  );
}

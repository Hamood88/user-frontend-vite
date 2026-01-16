import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ShopRedirect() {
  const { shopId } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    if (!shopId) return;
    // ✅ redirect to the ShopMall route
    nav(`/shop/${shopId}/mall`, { replace: true });
  }, [shopId, nav]);

  return null;
}

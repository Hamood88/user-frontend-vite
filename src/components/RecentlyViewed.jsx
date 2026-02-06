// RecentlyViewed.jsx - Shows user's recently viewed products
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronRight, Trash2 } from "lucide-react";
import { getRecentlyViewed, clearViewHistory, toAbsUrl } from "../api.jsx";
import { useTranslation } from "react-i18next";
import SaveProductButton from "./SaveProductButton.jsx";

export default function RecentlyViewed({ limit = 10, showClear = true, className = "" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [limit]);

  async function loadHistory() {
    setLoading(true);
    const data = await getRecentlyViewed(limit);
    setProducts(data);
    setLoading(false);
  }

  async function handleClear() {
    if (!window.confirm(t("clearViewHistory") || "Clear your view history?")) return;
    await clearViewHistory();
    setProducts([]);
  }

  if (loading) {
    return (
      <div className={`recently-viewed-section ${className}`}>
        <div className="recently-viewed-header">
          <Clock className="w-5 h-5" />
          <span>{t("recentlyViewed") || "Recently Viewed"}</span>
        </div>
        <div className="recently-viewed-loading">
          <div className="animate-pulse flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-32 h-40 rounded-xl shrink-0" style={{ background: "hsl(var(--muted))" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't show section if no history
  }

  return (
    <div className={`recently-viewed-section ${className}`}>
      <div className="recently-viewed-header">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
          <span className="font-semibold">{t("recentlyViewed") || "Recently Viewed"}</span>
          <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>({products.length})</span>
        </div>
        {showClear && products.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm flex items-center gap-1 transition-colors"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            <Trash2 className="w-4 h-4" />
            {t("clear") || "Clear"}
          </button>
        )}
      </div>

      <div className="recently-viewed-scroll">
        {products.map((product) => {
          const pid = product._id || product.id;
          const mainImage = Array.isArray(product.images) ? product.images[0] : product.image;
          
          return (
            <div
              key={pid}
              className="recently-viewed-card"
              onClick={() => navigate(`/product/${pid}`)}
            >
              <div className="recently-viewed-image">
                <img
                  src={toAbsUrl(mainImage)}
                  alt={product.title}
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23374151' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af'%3E📦%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="recently-viewed-save">
                  <SaveProductButton productId={pid} size="xs" />
                </div>
              </div>
              <div className="recently-viewed-info">
                <div className="recently-viewed-title">{product.title}</div>
                <div className="recently-viewed-price">
                  ${(product.localPrice || 0).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* View All Link */}
        <button
          onClick={() => navigate("/recently-viewed")}
          className="recently-viewed-more"
        >
          <ChevronRight className="w-6 h-6" />
          <span>{t("viewAll") || "View All"}</span>
        </button>
      </div>
    </div>
  );
}

// RecentlyViewedPage.jsx - Full page showing all recently viewed products
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Trash2, ArrowLeft, Package } from "lucide-react";
import { getRecentlyViewed, clearViewHistory, toAbsUrl } from "../api.jsx";
import { useTranslation } from "react-i18next";
import SaveProductButton from "../components/SaveProductButton.jsx";
import "../styles/Engagement.css";

export default function RecentlyViewedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    const data = await getRecentlyViewed(50);
    setProducts(data);
    setLoading(false);
  }

  async function handleClear() {
    if (!window.confirm(t("clearViewHistory") || "Clear your view history?")) return;
    await clearViewHistory();
    setProducts([]);
  }

  return (
    <div className="recently-viewed-page">
      {/* Header */}
      <div className="recently-viewed-page-header">
        <button onClick={() => navigate(-1)} className="recently-viewed-back-btn">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="recently-viewed-page-title">
          <Clock className="w-6 h-6 text-blue-400" />
          <h1>{t("recentlyViewed") || "Recently Viewed"}</h1>
          {products.length > 0 && (
            <span className="text-white/50 text-sm">({products.length})</span>
          )}
        </div>
        {products.length > 0 && (
          <button onClick={handleClear} className="recently-viewed-clear-btn">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="recently-viewed-page-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="recently-viewed-card-skeleton">
              <div className="animate-pulse">
                <div className="aspect-square bg-white/10 rounded-t-xl" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-5 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="recently-viewed-empty-state">
          <Package className="w-16 h-16 mx-auto mb-4 text-white/20" />
          <h2 className="text-lg font-semibold mb-2">
            {t("noRecentlyViewed") || "No recently viewed products"}
          </h2>
          <p className="text-white/50 mb-4">
            Products you view will appear here
          </p>
          <button
            onClick={() => navigate("/mall")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
          >
            {t("browseMall") || "Browse Mall"}
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="recently-viewed-page-grid">
          {products.map((product) => {
            const pid = product._id || product.id;
            const mainImage = Array.isArray(product.images) ? product.images[0] : product.image;
            
            return (
              <div
                key={pid}
                className="recently-viewed-page-card"
                onClick={() => navigate(`/product/${pid}`)}
              >
                <div className="recently-viewed-page-save">
                  <SaveProductButton productId={pid} size="sm" />
                </div>

                <div className="recently-viewed-page-image">
                  <img
                    src={toAbsUrl(mainImage)}
                    alt={product.title}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23374151' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af'%3E📦%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                
                <div className="recently-viewed-page-info">
                  <div className="recently-viewed-page-title">{product.title}</div>
                  <div className="recently-viewed-page-price">
                    ${(product.localPrice || 0).toFixed(2)}
                  </div>
                  {product.shop?.name && (
                    <div className="text-xs text-white/50 mt-1">
                      {product.shop.name}
                    </div>
                  )}
                  {product.viewedAt && (
                    <div className="text-xs text-white/40 mt-2">
                      {new Date(product.viewedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ForYouPage.jsx - Full page for personalized AI recommendations
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, RefreshCw, ArrowLeft, Tag, Package } from "lucide-react";
import { getForYouFeed, toAbsUrl } from "../api.jsx";
import { useTranslation } from "react-i18next";
import SaveProductButton from "../components/SaveProductButton.jsx";
import "../styles/Engagement.css";

export default function ForYouPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiPowered, setAiPowered] = useState(false);
  const [basedOn, setBasedOn] = useState({});

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    setLoading(true);
    const data = await getForYouFeed(50); // Get more for full page
    setProducts(data.products || []);
    setAiPowered(data.aiPowered || false);
    setBasedOn(data.basedOn || {});
    setLoading(false);
  }

  return (
    <div className="for-you-page">
      {/* Header */}
      <div className="for-you-page-header">
        <button onClick={() => navigate(-1)} className="for-you-back-btn">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="for-you-page-title">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h1>{t("forYou") || "For You"}</h1>
          {aiPowered && <span className="for-you-ai-badge">AI</span>}
        </div>
        <button onClick={loadRecommendations} className="for-you-refresh" disabled={loading}>
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Based On Tags */}
      {basedOn.tags?.length > 0 && !loading && (
        <div className="for-you-based-on" style={{ margin: "0 16px 16px" }}>
          <Tag className="w-3 h-3" />
          <span>{t("basedOn") || "Based on your interests"}:</span>
          {basedOn.tags.slice(0, 6).map((tag, i) => (
            <span key={i} className="for-you-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="for-you-page-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="for-you-card-skeleton">
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
        <div className="for-you-empty-state" style={{ marginTop: 60 }}>
          <Package className="w-16 h-16 mx-auto mb-4 text-white/20" />
          <h2 className="text-lg font-semibold mb-2">
            {t("forYouEmpty") || "No recommendations yet"}
          </h2>
          <p className="text-white/50 mb-4">
            Browse more products to get personalized recommendations!
          </p>
          <button
            onClick={() => navigate("/mall")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-colors"
          >
            {t("browseMall") || "Browse Mall"}
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="for-you-page-grid">
          {products.map((product) => {
            const pid = product._id || product.id;
            const mainImage = Array.isArray(product.images) ? product.images[0] : product.image;
            
            return (
              <div
                key={pid}
                className="for-you-card"
                onClick={() => navigate(`/product/${pid}`)}
              >
                {/* Match Score Badge */}
                {product.matchScore && product.matchScore > 0.5 && (
                  <div className="for-you-match-badge">
                    {Math.round(product.matchScore * 100)}% match
                  </div>
                )}

                <div className="for-you-save">
                  <SaveProductButton productId={pid} size="sm" />
                </div>

                <div className="for-you-image">
                  <img
                    src={toAbsUrl(mainImage)}
                    alt={product.title}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23374151' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af'%3E📦%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                
                <div className="for-you-info">
                  <div className="for-you-product-title">{product.title}</div>
                  <div className="for-you-price">
                    ${(product.localPrice || 0).toFixed(2)}
                  </div>
                  {product.shop?.name && (
                    <div className="text-xs text-white/50 mt-1">
                      {product.shop.name}
                    </div>
                  )}
                  {product.aiTags?.length > 0 && (
                    <div className="for-you-tags">
                      {product.aiTags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="for-you-product-tag">{tag}</span>
                      ))}
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

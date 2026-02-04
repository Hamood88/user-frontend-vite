// ForYouFeed.jsx - AI-Personalized Product Recommendations
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, RefreshCw, ChevronRight, Tag } from "lucide-react";
import { getForYouFeed, toAbsUrl } from "../api.jsx";
import { useTranslation } from "react-i18next";
import SaveProductButton from "./SaveProductButton.jsx";

export default function ForYouFeed({ 
  limit = 12, 
  showHeader = true,
  showRefresh = true,
  layout = "grid", // "grid" | "scroll"
  className = ""
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiPowered, setAiPowered] = useState(false);
  const [basedOn, setBasedOn] = useState({});

  useEffect(() => {
    loadRecommendations();
  }, [limit]);

  async function loadRecommendations() {
    setLoading(true);
    const data = await getForYouFeed(limit);
    setProducts(data.products || []);
    setAiPowered(data.aiPowered || false);
    setBasedOn(data.basedOn || {});
    setLoading(false);
  }

  if (loading) {
    return (
      <div className={`for-you-section ${className}`}>
        {showHeader && (
          <div className="for-you-header">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>{t("forYou") || "For You"}</span>
          </div>
        )}
        <div className={`for-you-${layout}`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
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
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`for-you-section for-you-empty ${className}`}>
        {showHeader && (
          <div className="for-you-header">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>{t("forYou") || "For You"}</span>
          </div>
        )}
        <div className="for-you-empty-state">
          <p>{t("forYouEmpty") || "Browse more products to get personalized recommendations!"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`for-you-section ${className}`}>
      {showHeader && (
        <div className="for-you-header">
          <div className="for-you-title-group">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="font-semibold">{t("forYou") || "For You"}</span>
            {aiPowered && (
              <span className="for-you-ai-badge">
                AI
              </span>
            )}
          </div>
          
          <div className="for-you-actions">
            {showRefresh && (
              <button
                onClick={loadRecommendations}
                className="for-you-refresh"
                title={t("refresh") || "Refresh"}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => navigate("/for-you")}
              className="for-you-see-all"
            >
              {t("seeAll") || "See All"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Based On Tags */}
      {basedOn.tags?.length > 0 && (
        <div className="for-you-based-on">
          <Tag className="w-3 h-3" />
          <span>{t("basedOn") || "Based on"}:</span>
          {basedOn.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="for-you-tag">{tag}</span>
          ))}
        </div>
      )}

      <div className={`for-you-${layout}`}>
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
    </div>
  );
}

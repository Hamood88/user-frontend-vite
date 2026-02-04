// SimilarProducts.jsx - "You might also like" section using AI embeddings
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getSimilarProducts, toAbsUrl } from "../api.jsx";
import SaveProductButton from "./SaveProductButton.jsx";

/**
 * SimilarProducts - Shows products similar to the current one using AI embeddings
 * @param {string} productId - The product to find similar items for
 * @param {number} limit - Maximum number of products to show (default 8)
 * @param {Set|Array} savedProductIds - Optional set of already-saved product IDs
 */
export default function SimilarProducts({
  productId,
  limit = 8,
  savedProductIds = new Set(),
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convert to Set for quick lookup
  const savedSet =
    savedProductIds instanceof Set
      ? savedProductIds
      : new Set(savedProductIds || []);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSimilarProducts(productId, limit);
        if (mounted) {
          setProducts(data || []);
        }
      } catch (err) {
        console.error("Error fetching similar products:", err);
        if (mounted) {
          setError(err?.message || "Failed to load similar products");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId, limit]);

  const handleProductClick = (pid) => {
    navigate(`/product/${pid}`);
    // Scroll to top when navigating to new product
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Don't render if no products and not loading
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-bold text-gray-900">
            {t("youMightAlsoLike") || "You might also like"}
          </h2>
        </div>
        {products.length > 4 && (
          <button
            onClick={() => navigate("/mall")}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            {t("seeMore") || "See more"}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-6 text-gray-500 text-sm">
          {t("couldNotLoadSimilar") || "Couldn't load similar products"}
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {products.map((product) => {
            const pid = product._id || product.id;
            const mainImage = Array.isArray(product.images)
              ? product.images[0]
              : product.image;
            const isSaved = savedSet.has(pid);

            return (
              <div
                key={pid}
                className="flex-shrink-0 w-36 bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-all cursor-pointer relative"
                onClick={() => handleProductClick(pid)}
              >
                {/* AI Match Badge */}
                {product.similarity && product.similarity > 0.85 && (
                  <div className="absolute top-1 left-1 z-10 bg-purple-500/90 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    {Math.round(product.similarity * 100)}% match
                  </div>
                )}

                {/* Save Button */}
                <div className="absolute top-1 right-1 z-10">
                  <SaveProductButton
                    productId={pid}
                    initialSaved={isSaved}
                    size="sm"
                  />
                </div>

                {/* Image */}
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={toAbsUrl(mainImage)}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af'%3ENo image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="p-2">
                  <h3 className="font-medium text-xs text-gray-900 line-clamp-2 mb-1">
                    {product.title}
                  </h3>
                  <span className="font-bold text-sm text-purple-600">
                    ${(product.localPrice || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

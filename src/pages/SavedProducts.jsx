// SavedProducts.jsx - Page to view all saved/wishlist products
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, TrendingDown, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getSavedProducts, unsaveProduct, toAbsUrl } from "../api.jsx";
import SaveProductButton from "../components/SaveProductButton.jsx";

export default function SavedProducts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getSavedProducts();
        if (mounted) {
          setProducts(data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching saved products:", err);
        if (mounted) {
          setError(err?.message || "Failed to load saved products");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRemove = async (productId) => {
    try {
      await unsaveProduct(productId);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    } catch (err) {
      console.error("Error removing product:", err);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Calculate savings for price drops
  const calculateSavings = (product) => {
    if (!product.priceDropped || !product.priceAtSave) return null;
    const currentPrice = product.localPrice || 0;
    const savedPrice = product.priceAtSave;
    const savings = savedPrice - currentPrice;
    const percentage = ((savings / savedPrice) * 100).toFixed(0);
    return { amount: savings, percentage };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--md-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-[var(--md-text-secondary)]">{t("loading") || "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--md-bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {t("retry") || "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--md-bg)]">
      {/* Header */}
      <div className="bg-[var(--md-card)] border-b border-[var(--md-border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[var(--md-hover)] rounded-full transition-colors text-[var(--md-text)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
              <h1 className="text-xl font-bold text-[var(--md-text)]">{t("savedProducts") || "Saved Products"}</h1>
            </div>
            <span className="ml-auto text-[var(--md-text-secondary)]">
              {products.length} {t("items") || "items"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-[var(--md-text-muted)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--md-text)] mb-2">
              {t("noSavedProducts") || "No saved products yet"}
            </h2>
            <p className="text-[var(--md-text-secondary)] mb-6">
              {t("saveProductsHint") || "Tap the heart icon on products you like to save them here"}
            </p>
            <button
              onClick={() => navigate("/mall")}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <ShoppingBag className="w-5 h-5" />
              {t("browseMall") || "Browse Mall"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => {
              const productId = product._id || product.id;
              const savings = calculateSavings(product);
              const mainImage = Array.isArray(product.images)
                ? product.images[0]
                : product.image;

              return (
                <div
                  key={productId}
                  className="bg-[var(--md-card)] rounded-xl border border-[var(--md-border)] overflow-hidden group hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer relative"
                  onClick={() => handleProductClick(productId)}
                >
                  {/* Price Drop Badge */}
                  {product.priceDropped && savings && (
                    <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {savings.percentage}% off
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="absolute top-2 right-2 z-10">
                    <SaveProductButton
                      productId={productId}
                      initialSaved={true}
                      onToggle={(saved) => {
                        if (!saved) handleRemove(productId);
                      }}
                      size="sm"
                    />
                  </div>

                  {/* Image */}
                  <div className="aspect-square bg-[var(--md-bg-elevated)] overflow-hidden">
                    <img
                      src={toAbsUrl(mainImage)}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%231a1a2e' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280'%3ENo image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-[var(--md-text)] line-clamp-2 mb-1">
                      {product.title}
                    </h3>
                    
                    {/* Price Section */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-purple-500">
                        ${(product.localPrice || 0).toFixed(2)}
                      </span>
                      {product.priceDropped && product.priceAtSave && (
                        <span className="text-xs text-[var(--md-text-muted)] line-through">
                          ${product.priceAtSave.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Shop Name */}
                    {product.shop?.name && (
                      <p className="text-xs text-[var(--md-text-secondary)] mt-1 truncate">
                        {product.shop.name}
                      </p>
                    )}

                    {/* Saved Date */}
                    {product.savedAt && (
                      <p className="text-xs text-[var(--md-text-muted)] mt-1">
                        {t("savedOn") || "Saved"}{" "}
                        {new Date(product.savedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Quick Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(productId);
                    }}
                    className="absolute bottom-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    title={t("remove") || "Remove"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

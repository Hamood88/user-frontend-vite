// user-frontend-vite-temp/src/pages/ShopMallProductDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { apiGet, toAbsUrl } from "../api.jsx";
import { useUserMallCart } from "../context/UserMallCartContext";
import { THEMES } from "../components/ShopMallTheme";
import ProductReviews from "../components/ProductReviews.jsx";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Star, 
  Package,
  Truck,
  Shield,
  Store,
  MessageCircle,
  Send,
  X,
  Users
} from "lucide-react";

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}

function pickImages(p) {
  const arr = [];
  if (p?.image) arr.push(p.image);
  if (p?.imageUrl) arr.push(p.imageUrl);
  if (p?.thumbnail) arr.push(p.thumbnail);
  if (p?.photo) arr.push(p.photo);
  if (Array.isArray(p?.images)) arr.push(...p.images);
  if (Array.isArray(p?.displayImages)) arr.push(...p.displayImages);
  if (p?.media?.image) arr.push(p.media.image);
  if (Array.isArray(p?.media?.images)) arr.push(...p.media.images);
  if (Array.isArray(p?.media) && p.media.length) {
    for (const m of p.media) if (m?.url) arr.push(m.url);
  }
  return Array.from(new Set(arr.filter(Boolean).map((url) => toAbsUrl(url)).filter(Boolean)));
}

export default function ShopMallProductDetail() {
  const { productId, shopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get theme from URL params or state or default to midnight
  const themeId = searchParams.get("theme") || location.state?.theme || "midnight";
  const theme = THEMES[themeId] || THEMES.midnight;

  const { addToCart } = useUserMallCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");

  // Ask previous buyers functionality
  const [askBuyersOpen, setAskBuyersOpen] = useState(false);
  const [askQuestion, setAskQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askSuccess, setAskSuccess] = useState(false);

  // Get shop info from state (passed from mall navigation)
  const shopFromState = location.state?.shop;

  const images = useMemo(() => pickImages(product), [product]);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        if (!productId) throw new Error("Missing product ID");

        // Try multiple endpoints to find the product
        const endpoints = [
          `/mall/products/${encodeURIComponent(productId)}`,
          `/mall/product/${encodeURIComponent(productId)}`,
          `/products/${encodeURIComponent(productId)}`,
          `/shop-products/${encodeURIComponent(productId)}`,
          `/public/products/${encodeURIComponent(productId)}`,
        ];

        let res = null;
        let lastErr = null;

        for (const ep of endpoints) {
          try {
            res = await apiGet(ep, { auth: false });
            break;
          } catch (e) {
            lastErr = e;
          }
        }

        const found = res?.product || res?.data?.product || res?.data || res;

        if (!found?._id && !found?.id) {
          throw new Error(lastErr?.message || "Product not found");
        }

        if (!cancelled) {
          setProduct(found);
          const imgs = pickImages(found);
          setActiveImg(imgs[0] || "");
          setQty(1);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Failed to load product");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const title = product?.title || product?.name || "Product";
  const description = product?.description || product?.desc || "";
  const price = product?.localPrice ?? product?.price ?? 0;
  const currency = String(product?.currency || "USD").toUpperCase();
  const maxStock = Math.max(1, safeNum(product?.quantity, 99));
  const category = product?.categoryLabel || product?.category || "Category";
  const rating = safeNum(product?.rating, 0);
  const reviewCount = safeNum(product?.reviewCount, 0);

  // Get shop info (from product or from state)
  const productShopId = product?.shopId || product?.shop?._id || product?.shop?.id || shopId || shopFromState?._id;
  const shopName = product?.shopName || product?.shop?.shopName || product?.shop?.name || shopFromState?.shopName || shopFromState?.name || "Shop";

  function dec() {
    setQty((q) => Math.max(1, Number(q) - 1));
  }

  function inc() {
    setQty((q) => Math.min(maxStock, Number(q) + 1));
  }

  function handleAddToCart() {
    if (!product) return;
    
    addToCart({
      ...product,
      shopName: shopName, // Ensure shop name is included
    }, qty);
    
    // Show success notification
    alert(`✅ Added ${qty} item${qty > 1 ? 's' : ''} to your mall cart!`);
  }

  async function handleAskPreviousBuyers() {
    if (!askQuestion.trim()) {
      alert("Please enter your question");
      return;
    }

    setAskLoading(true);
    try {
      // Create a question for previous buyers - for now just simulate success
      // TODO: Implement actual API call to post question to product discussion or start conversations
      const payload = {
        productId: product._id || product.id,
        question: askQuestion.trim(),
        type: 'product_question'
      };
      
      console.log('Asking previous buyers:', payload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAskSuccess(true);
      setAskQuestion("");
      setTimeout(() => {
        setAskBuyersOpen(false);
        setAskSuccess(false);
      }, 2000);
    } catch (error) {
      alert(`Failed to send question: ${error.message}`);
    } finally {
      setAskLoading(false);
    }
  }

  function goBack() {
    // Go back to shop mall
    if (productShopId) {
      navigate(`/shop-mall/${encodeURIComponent(productShopId)}?theme=${themeId}`);
    } else if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate("/mall");
    }
  }

  function goToShop() {
    if (productShopId) {
      navigate(`/shop-mall/${encodeURIComponent(productShopId)}`);
    }
  }

  if (loading) {
    return (
      <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, padding: "40px 20px", textAlign: "center" }}>
        <p style={{ color: theme.muted }}>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, padding: "40px 20px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: theme.muted, marginBottom: 20 }}>{error || "Product not found"}</p>
          <button
            onClick={goBack}
            style={{
              background: theme.primary,
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ← Back to Mall
          </button>
        </div>
      </div>
    );
  }

  const qtySafe = Math.max(1, Math.floor(safeNum(qty, 1)));
  const total = safeNum(price, 0) * qtySafe;

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, fontFamily: theme.font }}>
      {/* Header */}
      <div style={{ 
        borderBottom: `1px solid ${theme.border}`,
        padding: "16px 20px",
        background: theme.card,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={goBack}
            style={{
              background: "transparent",
              border: "none",
              color: theme.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div style={{ flex: 1 }} />
          {productShopId && (
            <button
              onClick={goToShop}
              style={{
                background: "transparent",
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                padding: "8px 16px",
                color: theme.text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
              }}
            >
              <Store size={16} />
              Visit Shop
            </button>
          )}
        </div>
      </div>

      {/* Product Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
          gap: 40 
        }}>
          {/* Images */}
          <div>
            {/* Main Image */}
            <div style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 16,
              aspectRatio: "1/1",
            }}>
              <img
                src={activeImg || images[0] || "/placeholder.png"}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(img)}
                    style={{
                      width: 80,
                      height: 80,
                      background: theme.card,
                      border: `2px solid ${activeImg === img ? theme.primary : theme.border}`,
                      borderRadius: 8,
                      overflow: "hidden",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <img
                      src={img}
                      alt={`${title} ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category */}
            <p style={{ 
              color: theme.primary, 
              fontSize: 13, 
              fontWeight: 600, 
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              {category}
            </p>

            {/* Title */}
            <h1 style={{ 
              fontSize: 32, 
              fontWeight: 700, 
              marginBottom: 12,
              lineHeight: 1.2,
            }}>
              {title}
            </h1>

            {/* Shop Name */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              marginBottom: 16,
              color: theme.muted,
              fontSize: 14,
            }}>
              <Store size={16} />
              <span>{shopName}</span>
            </div>

            {/* Rating */}
            {rating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(rating) ? theme.primary : "none"}
                    stroke={i < Math.floor(rating) ? theme.primary : theme.muted}
                  />
                ))}
                <span style={{ color: theme.muted, fontSize: 14 }}>
                  {rating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ 
                fontSize: 36, 
                fontWeight: 700, 
                color: theme.primary,
                marginBottom: 4,
              }}>
                {currency} {money(price)}
              </p>
              <p style={{ color: theme.muted, fontSize: 14 }}>
                Total: {currency} {money(total)}
              </p>
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: "block", 
                fontSize: 14, 
                fontWeight: 600, 
                marginBottom: 8,
                color: theme.muted,
              }}>
                Quantity
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={dec}
                  disabled={qty <= 1}
                  style={{
                    width: 40,
                    height: 40,
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 8,
                    color: theme.text,
                    cursor: qty <= 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: qty <= 1 ? 0.5 : 1,
                  }}
                >
                  <Minus size={18} />
                </button>
                <span style={{ 
                  fontSize: 18, 
                  fontWeight: 600,
                  minWidth: 40,
                  textAlign: "center",
                }}>
                  {qty}
                </span>
                <button
                  onClick={inc}
                  disabled={qty >= maxStock}
                  style={{
                    width: 40,
                    height: 40,
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 8,
                    color: theme.text,
                    cursor: qty >= maxStock ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: qty >= maxStock ? 0.5 : 1,
                  }}
                >
                  <Plus size={18} />
                </button>
                <span style={{ color: theme.muted, fontSize: 13 }}>
                  {maxStock} available
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              style={{
                width: "100%",
                background: theme.primary,
                color: "#fff",
                padding: "16px 24px",
                borderRadius: 12,
                border: "none",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginBottom: 16,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.background = theme.primaryHover}
              onMouseLeave={(e) => e.target.style.background = theme.primary}
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>

            {/* Features */}
            <div style={{ 
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: 20,
              marginTop: 24,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Package size={20} style={{ color: theme.primary }} />
                  <span style={{ fontSize: 14, color: theme.muted }}>In Stock</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Truck size={20} style={{ color: theme.primary }} />
                  <span style={{ fontSize: 14, color: theme.muted }}>Fast Shipping</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Shield size={20} style={{ color: theme.primary }} />
                  <span style={{ fontSize: 14, color: theme.muted }}>Buyer Protection</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ 
                  fontSize: 18, 
                  fontWeight: 700, 
                  marginBottom: 12,
                }}>
                  Description
                </h3>
                <p style={{ 
                  color: theme.muted, 
                  fontSize: 14, 
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}>
                  {description}
                </p>
              </div>
            )}

            {/* Ask Previous Buyers Section */}
            <div style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: 20,
              marginTop: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h3 style={{ 
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <Users size={20} style={{ color: theme.primary }} />
                    Ask Previous Buyers
                  </h3>
                  <p style={{ 
                    color: theme.muted, 
                    fontSize: 14,
                    margin: 0,
                  }}>
                    Get advice from people who bought this product
                  </p>
                </div>
                <button
                  onClick={() => setAskBuyersOpen(!askBuyersOpen)}
                  style={{
                    background: theme.primary,
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <MessageCircle size={16} />
                  Ask Question
                </button>
              </div>

              {/* Ask Question Modal/Form */}
              {askBuyersOpen && (
                <div style={{
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  padding: 16,
                  marginTop: 12,
                }}>
                  {askSuccess ? (
                    <div style={{ textAlign: "center", color: theme.primary }}>
                      <div style={{ fontSize: 20, marginBottom: 8 }}>✅</div>
                      <p>Your question has been sent to previous buyers!</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Ask your question</h4>
                        <button
                          onClick={() => setAskBuyersOpen(false)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: theme.muted,
                            cursor: "pointer",
                            padding: 4,
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <textarea
                        value={askQuestion}
                        onChange={(e) => setAskQuestion(e.target.value)}
                        placeholder="What would you like to know about this product?"
                        style={{
                          width: "100%",
                          minHeight: 80,
                          padding: 12,
                          border: `1px solid ${theme.border}`,
                          borderRadius: 6,
                          background: theme.card,
                          color: theme.text,
                          fontSize: 14,
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                        <button
                          onClick={handleAskPreviousBuyers}
                          disabled={askLoading || !askQuestion.trim()}
                          style={{
                            background: theme.primary,
                            color: "#fff",
                            padding: "8px 16px",
                            borderRadius: 6,
                            border: "none",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: askLoading || !askQuestion.trim() ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            opacity: askLoading || !askQuestion.trim() ? 0.6 : 1,
                          }}
                        >
                          <Send size={14} />
                          {askLoading ? "Sending..." : "Send Question"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Product Reviews Section */}
            <div style={{ marginTop: 32 }}>
              <ProductReviews 
                productId={product?._id || product?.id} 
                defaultOpen={false}
                theme={theme}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

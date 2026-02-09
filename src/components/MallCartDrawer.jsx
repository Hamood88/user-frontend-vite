// user-frontend-vite-temp/src/components/MallCartDrawer.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserMallCart } from "../context/UserMallCartContext";
import { toAbsUrl } from "../api.jsx";
import { X, Plus, Minus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";

export default function MallCartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    total,
    itemCount,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useUserMallCart();

  if (!isOpen) return null;

  function handleCheckout() {
    closeCart();
    // TODO: Navigate to mall checkout page
    alert("Mall checkout coming soon!");
  }

  function handleContinueShopping() {
    closeCart();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 9998,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(90vw, 420px)",
          background: "#fff",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 16px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ShoppingCart size={24} style={{ color: "#6366f1" }} />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Mall Cart
              </h2>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
            }}
            onMouseEnter={(e) => (e.target.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#9ca3af",
              }}
            >
              <ShoppingCart size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                Your mall cart is empty
              </p>
              <p style={{ fontSize: 14, marginBottom: 24 }}>
                Browse shop malls to add products
              </p>
              <button
                onClick={handleContinueShopping}
                style={{
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map((item) => {
                const img = item.image || item.imageUrl || item.thumbnail || item.photo || "/placeholder.png";
                const title = item.title || item.name || "Product";
                const price = Number(item.localPrice ?? item.price ?? 0);
                const qty = Number(item.quantity || 1);
                const currency = String(item.currency || "USD").toUpperCase();
                const shopName = item.shopName || "Shop";

                return (
                  <div
                    key={item._id || item.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      background: "#f9fafb",
                      borderRadius: 12,
                      padding: 12,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {/* Image */}
                    <img
                      src={toAbsUrl(img)}
                      alt={title}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8,
                        background: "#fff",
                      }}
                    />

                    {/* Details */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          margin: "0 0 4px 0",
                          lineHeight: 1.3,
                        }}
                      >
                        {title}
                      </h3>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {shopName}
                      </p>
                      <div style={{ marginTop: "auto" }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#6366f1",
                            margin: 0,
                          }}
                        >
                          {currency} {(price * qty).toFixed(2)}
                        </p>
                        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                          {currency} {price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => removeFromCart(item._id || item.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          color: "#ef4444",
                        }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => updateQuantity(item._id || item.id, qty - 1)}
                          disabled={qty <= 1}
                          style={{
                            width: 24,
                            height: 24,
                            background: qty <= 1 ? "#f3f4f6" : "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            cursor: qty <= 1 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: qty <= 1 ? "#9ca3af" : "#000",
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: "center" }}>
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id || item.id, qty + 1)}
                          style={{
                            width: 24,
                            height: 24,
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              padding: "20px 24px",
              background: "#f9fafb",
            }}
          >
            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#6366f1" }}>
                USD {total.toFixed(2)}
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={handleCheckout}
                style={{
                  width: "100%",
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  padding: "14px 24px",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => (e.target.style.background = "#4f46e5")}
                onMouseLeave={(e) => (e.target.style.background = "#6366f1")}
              >
                Checkout
                <ArrowRight size={18} />
              </button>
              <button
                onClick={handleContinueShopping}
                style={{
                  width: "100%",
                  background: "transparent",
                  color: "#6366f1",
                  border: "1px solid #6366f1",
                  padding: "12px 24px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#eef2ff")}
                onMouseLeave={(e) => (e.target.style.background = "transparent")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

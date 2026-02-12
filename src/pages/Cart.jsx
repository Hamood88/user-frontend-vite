// user-frontend-vite-temp/src/pages/Cart.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserMallCart } from "../context/UserMallCartContext";
import { toAbsUrl } from "../api.jsx";
import "../styles/cart.css";

function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function Cart() {
  const nav = useNavigate();
  const {
    items,
    count: itemCount,
    total,
    updateQuantity,
    removeFromCart,
    clearCart: clearCartCtx,
  } = useUserMallCart();

  // Group items by shopId for multi-shop display
  const shopGroups = useMemo(() => {
    const map = {};
    for (const item of items) {
      const sid = item.shopId || "unknown";
      if (!map[sid]) {
        map[sid] = {
          shopId: sid,
          shopName: item.shopName || "Shop",
          shopImage: item.shopImage || "",
          items: [],
          subtotal: 0,
        };
      }
      const qty = Math.max(1, safeNum(item.qty, 1));
      const price = safeNum(item.price, 0);
      map[sid].items.push(item);
      map[sid].subtotal += price * qty;
    }
    return Object.values(map);
  }, [items]);

  function clearCart() {
    if (confirm("Clear all items from cart?")) {
      clearCartCtx();
    }
  }

  if (items.length === 0) {
    return (
      <div className="cart-wrap">
        <div className="cart-header">
          <h1>🛒 Shopping Cart</h1>
          <button className="cart-back-btn" onClick={() => nav("/mall")}>
            ← Continue Shopping
          </button>
        </div>

        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Browse products and add items to your cart</p>
          <button className="cart-cta-btn" onClick={() => nav("/mall")}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-wrap">
      <div className="cart-header">
        <h1>🛒 Shopping Cart ({itemCount} items)</h1>
        <div className="cart-header-actions">
          <button className="cart-back-btn" onClick={() => nav("/mall")}>
            ← Continue Shopping
          </button>
          <button className="cart-clear-btn" onClick={clearCart}>
            Clear Cart
          </button>
        </div>
      </div>

      <div className="cart-container">
        <div className="cart-items">
          {shopGroups.map((group) => (
            <div key={group.shopId} className="cart-shop-group">
              {/* Shop name header */}
              <div className="cart-shop-header">
                <div
                  className="cart-shop-left"
                  onClick={() => nav(`/shop-mall/${group.shopId}`)}
                  title={`Visit ${group.shopName}`}
                >
                  {group.shopImage ? (
                    <img
                      src={toAbsUrl(group.shopImage)}
                      alt={group.shopName}
                      className="cart-shop-avatar"
                    />
                  ) : (
                    <span className="cart-shop-avatar-placeholder">🏪</span>
                  )}
                  <span className="cart-shop-name">{group.shopName}</span>
                </div>
                <div
                  className="cart-shop-continue"
                  onClick={() => nav(`/shop-mall/${group.shopId}`)}
                >
                  Continue Shopping →
                </div>
              </div>

              {group.items.map((item, idx) => {
                const itemTotal =
                  safeNum(item.price, 0) * Math.max(1, safeNum(item.qty, 1));
                const itemQty = Math.max(1, safeNum(item.qty, 1));
                const pid = item.productId || item._id;

                return (
                  <div key={pid || idx} className="cart-item">
                    <div className="cart-item-image">
                      {item.image ? (
                        <img src={toAbsUrl(item.image)} alt={item.title} />
                      ) : (
                        <div className="cart-item-no-image">No image</div>
                      )}
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-title">{item.title}</div>
                      <div className="cart-item-price">
                        {item.currency || "USD"} {money(item.price)}
                      </div>
                    </div>

                    <div className="cart-item-qty">
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(pid, itemQty - 1)}
                        type="button"
                      >
                        −
                      </button>
                      <div className="cart-qty-box">{itemQty}</div>
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(pid, itemQty + 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-total">
                      <div className="cart-item-total-label">Total</div>
                      <div className="cart-item-total-price">
                        {item.currency || "USD"} {money(itemTotal)}
                      </div>
                    </div>

                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(pid)}
                      title="Remove from cart"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              {/* Shop subtotal */}
              <div className="cart-shop-subtotal">
                <span>Subtotal</span>
                <span>
                  {group.items[0]?.currency || "USD"} {money(group.subtotal)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-title">Order Summary</div>

          <div className="cart-summary-row">
            <div>Subtotal ({itemCount} items)</div>
            <div>{items[0]?.currency || "USD"} {money(total)}</div>
          </div>

          <div className="cart-summary-row">
            <div>Shipping</div>
            <div>Calculated at checkout</div>
          </div>

          <div className="cart-summary-row">
            <div>Tax</div>
            <div>Calculated at checkout</div>
          </div>

          <div className="cart-summary-divider"></div>

          <div className="cart-summary-total">
            <div>Estimated Total</div>
            <div>{items[0]?.currency || "USD"} {money(total)}</div>
          </div>

          <button className="cart-checkout-btn" onClick={() => nav("/checkout")}>
            Proceed to Checkout
          </button>

          <button className="cart-continue-btn" onClick={() => nav("/mall")}>
            Continue Shopping
          </button>
        </div>
      </div>

      <div className="cart-info">
        <p>💡 Items remain in your cart for 30 days</p>
        <p>✅ No charges until you complete an order</p>
      </div>
    </div>
  );
}

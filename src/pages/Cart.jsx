// user-frontend-vite/src/pages/Cart.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cart.css";

function getUserCartKey() {
  try {
    const user = JSON.parse(localStorage.getItem("userObj") || localStorage.getItem("user") || "{}");
    const userId = user?._id || user?.id || "guest";
    return `cart_items_${userId}`;
  } catch {
    return "cart_items_guest";
  }
}

function readCart() {
  try {
    const key = getUserCartKey();
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeCart(items) {
  try {
    const key = getUserCartKey();
    localStorage.setItem(key, JSON.stringify(items || []));
  } catch {}
}

function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function makeAbsolute(url) {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const API_BASE = "https://moondala-backend.onrender.com";
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  if (s.startsWith("uploads/")) return `${API_BASE}/${s}`;
  return `${API_BASE}/${s}`;
}

export default function Cart() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [changed, setChanged] = useState(false);

  // Load cart on mount
  useEffect(() => {
    const cart = readCart();
    setItems(cart);
    setChanged(false);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (changed) {
      writeCart(items);
      setChanged(false);
    }
  }, [items, changed]);

  const updateQty = useCallback((productId, newQty) => {
    const safe = Math.max(1, Math.min(99, Math.floor(safeNum(newQty, 1))));
    setItems((prev) =>
      prev.map((item) =>
        String(item.productId) === String(productId)
          ? { ...item, qty: safe }
          : item
      )
    );
    setChanged(true);
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) =>
      prev.filter((item) => String(item.productId) !== String(productId))
    );
    setChanged(true);
  }, []);

  const clearCart = useCallback(() => {
    if (confirm("Clear all items from cart?")) {
      setItems([]);
      setChanged(true);
    }
  }, []);

  const total = items.reduce(
    (acc, item) => acc + safeNum(item.price, 0) * Math.max(1, safeNum(item.qty, 1)),
    0
  );

  const itemCount = items.reduce(
    (acc, item) => acc + Math.max(1, safeNum(item.qty, 1)),
    0
  );

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
          {items.map((item, idx) => {
            const itemTotal = safeNum(item.price, 0) * Math.max(1, safeNum(item.qty, 1));
            const itemQty = Math.max(1, safeNum(item.qty, 1));

            return (
              <div key={item.productId || idx} className="cart-item">
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={makeAbsolute(item.image)} alt={item.title} />
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
                    onClick={() => updateQty(item.productId, itemQty - 1)}
                    type="button"
                  >
                    −
                  </button>
                  <div className="cart-qty-box">{itemQty}</div>
                  <button
                    className="cart-qty-btn"
                    onClick={() => updateQty(item.productId, itemQty + 1)}
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
                  onClick={() => removeItem(item.productId)}
                  title="Remove from cart"
                  type="button"
                >
                  ✕
                </button>
              </div>
            );
          })}
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

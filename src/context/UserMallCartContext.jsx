// user-frontend-vite-temp/src/context/UserMallCartContext.jsx
// ✅ UNIFIED CART — used by mall pages, product details, Cart page, and AppLayout sidebar
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const UserMallCartContext = createContext();

export function useUserMallCart() {
  const ctx = useContext(UserMallCartContext);
  if (!ctx) throw new Error("useUserMallCart must be used within UserMallCartProvider");
  return ctx;
}

/** Resolve the localStorage key for the unified cart */
function getCartKey() {
  try {
    // Try userObj first (set on login in many places)
    const userObj = localStorage.getItem("userObj") || localStorage.getItem("user");
    if (userObj) {
      const u = JSON.parse(userObj);
      const uid = u?._id || u?.id;
      if (uid) return `cart_items_${uid}`;
    }
    // Fallback: decode userId from JWT token
    const token = localStorage.getItem("userToken") || localStorage.getItem("token");
    if (token) {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1]));
        const uid = payload.userId || payload.id || payload.sub;
        if (uid) return `cart_items_${uid}`;
      }
    }
    return "cart_items_guest";
  } catch {
    return "cart_items_guest";
  }
}

function readCart() {
  try {
    const key = getCartKey();
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  try {
    const key = getCartKey();
    localStorage.setItem(key, JSON.stringify(items || []));
  } catch (err) {
    console.error("Failed to save cart:", err);
  }
}

/** Migrate old mall cart data into the unified cart (runs once) */
function migrateOldMallCart() {
  try {
    // Find any userMallCart_* keys
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("userMallCart_")) {
        const old = JSON.parse(localStorage.getItem(k) || "[]");
        if (Array.isArray(old) && old.length > 0) {
          const current = readCart();
          let merged = [...current];
          for (const item of old) {
            const pid = String(item.productId || item._id || "");
            if (!pid) continue;
            const exists = merged.find(
              (x) => String(x.productId || x._id) === pid
            );
            if (!exists) {
              merged.push({
                productId: pid,
                _id: pid,
                title: item.title || item.name || "Product",
                price: Number(item.price) || 0,
                currency: item.currency || "USD",
                image: item.image || item.imageUrl || "",
                shopId: item.shopId || "",
                shopName: item.shopName || "Shop",
                qty: Math.max(1, Number(item.qty) || 1),
              });
            }
          }
          writeCart(merged);
        }
        localStorage.removeItem(k); // clean up old key
      }
    }
  } catch {}
}

export function UserMallCartProvider({ children }) {
  const didMigrate = useRef(false);
  const selfUpdate = useRef(false); // guard against infinite loop

  // One-time migration of old mall cart
  if (!didMigrate.current) {
    didMigrate.current = true;
    migrateOldMallCart();
  }

  const [items, setItems] = useState(() => readCart());
  const [isOpen, setIsOpen] = useState(false);

  // Persist cart to localStorage whenever it changes + dispatch event for AppLayout
  useEffect(() => {
    writeCart(items);
    // Fire event so AppLayout (and any other listener) can update count
    selfUpdate.current = true;
    window.dispatchEvent(new Event("cartUpdated"));
    selfUpdate.current = false;
  }, [items]);

  // Listen for external cart changes (other tabs, or ProductDetailsUnified direct writes)
  useEffect(() => {
    const sync = () => {
      const fresh = readCart();
      setItems(fresh);
    };
    window.addEventListener("storage", sync);
    // Also listen for cartUpdated from legacy addToCart in ProductDetailsUnified
    const onCartUpdated = () => {
      // Skip events we dispatched ourselves
      if (selfUpdate.current) return;
      const fresh = readCart();
      setItems(fresh);
    };
    window.addEventListener("cartUpdated", onCartUpdated);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cartUpdated", onCartUpdated);
    };
  }, []);

  // Calculate total count
  const count = items.reduce((sum, item) => sum + Math.max(1, Number(item.qty) || 1), 0);

  // Calculate total price
  const total = items.reduce((sum, item) => {
    const qty = Math.max(1, Number(item.qty) || 1);
    const price = Number(item.price) || 0;
    return sum + price * qty;
  }, 0);

  const addToCart = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const pid = String(product._id || product.id || "");
      const existing = prev.find(
        (item) => String(item.productId || item._id) === pid
      );

      if (existing) {
        return prev.map((item) => {
          if (String(item.productId || item._id) === pid) {
            const newQty = Math.max(1, (item.qty || 1) + quantity);
            return { ...item, qty: newQty };
          }
          return item;
        });
      } else {
        const newItem = {
          productId: pid,
          _id: pid,
          title: product.title || product.name || "Product",
          price: product.price || product.localPrice || 0,
          currency: product.currency || "USD",
          image: product.image || product.imageUrl || product.thumbnail || "",
          shopId: product.shopId || product.shop?._id || product.shop?.id || "",
          shopName: product.shopName || product.shop?.shopName || product.shop?.name || "Shop",
          qty: Math.max(1, quantity),
        };
        return [...prev, newItem];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) =>
      prev.filter((item) => String(item.productId || item._id) !== String(productId))
    );
  }, []);

  const updateQuantity = useCallback((productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (String(item.productId || item._id) === String(productId)) {
          return { ...item, qty: Math.max(1, newQty) };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = {
    items,
    count,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isOpen,
    openCart,
    closeCart,
  };

  return (
    <UserMallCartContext.Provider value={value}>
      {children}
    </UserMallCartContext.Provider>
  );
}

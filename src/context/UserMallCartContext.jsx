// user-frontend-vite-temp/src/context/UserMallCartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const UserMallCartContext = createContext();

export function useUserMallCart() {
  const ctx = useContext(UserMallCartContext);
  if (!ctx) throw new Error("useUserMallCart must be used within UserMallCartProvider");
  return ctx;
}

function getUserMallCartKey() {
  try {
    // Use userToken-based cart to keep it separate from main moondala cart
    const userToken = localStorage.getItem("userToken") || localStorage.getItem("token");
    if (!userToken) return "userMallCart_guest";
    
    // Decode user ID from token (simple base64 decode of payload)
    const parts = userToken.split(".");
    if (parts.length >= 2) {
      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.userId || payload.id || payload.sub || "guest";
      return `userMallCart_${userId}`;
    }
    return "userMallCart_guest";
  } catch {
    return "userMallCart_guest";
  }
}

function readUserMallCart() {
  try {
    const key = getUserMallCartKey();
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeUserMallCart(items) {
  try {
    const key = getUserMallCartKey();
    localStorage.setItem(key, JSON.stringify(items || []));
  } catch (err) {
    console.error("Failed to save user mall cart:", err);
  }
}

export function UserMallCartProvider({ children }) {
  const [items, setItems] = useState(() => readUserMallCart());
  const [isOpen, setIsOpen] = useState(false);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    writeUserMallCart(items);
  }, [items]);

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
      const existing = prev.find((item) => 
        String(item.productId || item._id) === String(product._id || product.id)
      );

      if (existing) {
        // Update quantity
        return prev.map((item) => {
          if (String(item.productId || item._id) === String(product._id || product.id)) {
            const newQty = Math.max(1, (item.qty || 1) + quantity);
            return { ...item, qty: newQty };
          }
          return item;
        });
      } else {
        // Add new item
        const newItem = {
          productId: product._id || product.id,
          _id: product._id || product.id,
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

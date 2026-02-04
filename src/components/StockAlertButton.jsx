// StockAlertButton.jsx - "Notify Me When Back in Stock" button
import React, { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, Check } from "lucide-react";
import { subscribeToStockAlert, unsubscribeFromStockAlert, isSubscribedToStockAlert } from "../api.jsx";
import { useTranslation } from "react-i18next";

export default function StockAlertButton({ 
  productId, 
  inStock = true,
  className = "",
  showWhenInStock = false // Set to true to always show (for debugging)
}) {
  const { t } = useTranslation();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [justSubscribed, setJustSubscribed] = useState(false);

  useEffect(() => {
    if (productId && (!inStock || showWhenInStock)) {
      checkStatus();
    } else {
      setLoading(false);
    }
  }, [productId, inStock]);

  async function checkStatus() {
    setLoading(true);
    const status = await isSubscribedToStockAlert(productId);
    setSubscribed(status);
    setLoading(false);
  }

  async function handleToggle(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (loading) return;
    setLoading(true);

    try {
      if (subscribed) {
        await unsubscribeFromStockAlert(productId);
        setSubscribed(false);
        setJustSubscribed(false);
      } else {
        await subscribeToStockAlert(productId);
        setSubscribed(true);
        setJustSubscribed(true);
        // Show success briefly
        setTimeout(() => setJustSubscribed(false), 2000);
      }
    } catch (err) {
      console.error("Stock alert toggle error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Don't show if product is in stock (unless debugging)
  if (inStock && !showWhenInStock) {
    return null;
  }

  if (loading && !subscribed) {
    return (
      <button
        disabled
        className={`stock-alert-btn stock-alert-loading ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{t("loading") || "Loading..."}</span>
      </button>
    );
  }

  if (subscribed) {
    return (
      <button
        onClick={handleToggle}
        className={`stock-alert-btn stock-alert-subscribed ${className}`}
        disabled={loading}
      >
        {justSubscribed ? (
          <>
            <Check className="w-4 h-4" />
            <span>{t("stockAlertSet") || "You'll be notified!"}</span>
          </>
        ) : (
          <>
            <BellOff className="w-4 h-4" />
            <span>{t("cancelStockAlert") || "Cancel Alert"}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`stock-alert-btn ${className}`}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      <span>{t("notifyWhenAvailable") || "Notify Me When Available"}</span>
    </button>
  );
}

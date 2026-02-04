// SaveProductButton.jsx - Heart button to save/unsave products
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { saveProduct, unsaveProduct, checkProductSaved, getToken } from "../api.jsx";

/**
 * SaveProductButton - A heart icon button to save/unsave products
 * @param {string} productId - The product ID to save/unsave
 * @param {boolean} initialSaved - Optional initial saved state (for optimization)
 * @param {function} onToggle - Optional callback when saved state changes
 * @param {string} size - Icon size: "sm" | "md" | "lg"
 * @param {string} className - Additional CSS classes
 */
export default function SaveProductButton({
  productId,
  initialSaved = null,
  onToggle,
  size = "md",
  className = "",
}) {
  const [saved, setSaved] = useState(initialSaved ?? false);
  const [loading, setLoading] = useState(false);
  const [checkedInitial, setCheckedInitial] = useState(initialSaved !== null);

  // Check if user is logged in
  const isLoggedIn = !!getToken();

  // Fetch initial saved state if not provided
  useEffect(() => {
    if (!productId || !isLoggedIn || checkedInitial) return;

    let mounted = true;
    (async () => {
      try {
        const { saved: isSaved } = await checkProductSaved(productId);
        if (mounted) {
          setSaved(isSaved);
          setCheckedInitial(true);
        }
      } catch (err) {
        console.error("Error checking saved state:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId, isLoggedIn, checkedInitial]);

  // Update if initialSaved prop changes
  useEffect(() => {
    if (initialSaved !== null) {
      setSaved(initialSaved);
      setCheckedInitial(true);
    }
  }, [initialSaved]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      // Could show a login prompt here
      alert("Please log in to save products");
      return;
    }

    if (loading || !productId) return;

    setLoading(true);
    const newSaved = !saved;

    // Optimistic update
    setSaved(newSaved);

    try {
      if (newSaved) {
        await saveProduct(productId);
      } else {
        await unsaveProduct(productId);
      }
      onToggle?.(newSaved);
    } catch (err) {
      // Revert on error
      setSaved(!newSaved);
      console.error("Error toggling save:", err);
    } finally {
      setLoading(false);
    }
  };

  // Size variants
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        p-1.5 rounded-full transition-all duration-200
        ${saved 
          ? "text-red-500 bg-red-50 hover:bg-red-100" 
          : "text-gray-400 bg-white/80 hover:bg-gray-100 hover:text-red-400"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        shadow-sm backdrop-blur-sm
        ${className}
      `}
      aria-label={saved ? "Remove from saved" : "Save product"}
      title={saved ? "Remove from saved" : "Save product"}
    >
      <Heart
        className={`${iconSize} transition-transform duration-200 ${loading ? "animate-pulse" : ""}`}
        fill={saved ? "currentColor" : "none"}
        strokeWidth={2}
      />
    </button>
  );
}

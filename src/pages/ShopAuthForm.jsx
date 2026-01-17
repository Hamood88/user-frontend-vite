import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Mail, Lock, Store, CheckCircle } from "lucide-react";
import { apiPost, setUserSession } from "../api";

console.log("[ShopAuthForm] Module loaded");

export function ShopAuthForm({ mode }) {
  console.log("[ShopAuthForm] Rendering with mode:", mode);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [shopName, setShopName] = useState("");
  const [shopEmail, setShopEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      if (mode === "login") {
        if (!shopEmail.trim() || !password) throw new Error("Please enter your email and password");
        const data = await apiPost("/shop/auth/login", { email: shopEmail.trim().toLowerCase(), password });
        setSuccess(true);
        setUserSession({ token: data.token, shop: data.shop }, "shop");
        setTimeout(() => navigate("/shop/dashboard"), 500);
      } else {
        if (!shopName.trim() || !shopEmail.trim() || !password) {
          throw new Error("Please fill in Shop Name, Email, and Password");
        }
        const data = await apiPost("/shop/auth/register", {
          shopName: shopName.trim(),
          name: shopName.trim(),
          shopEmail: shopEmail.trim().toLowerCase(),
          email: shopEmail.trim().toLowerCase(),
          password,
        });
        setSuccess(true);
        setUserSession({ token: data.token, shop: data.shop }, "shop");
        setTimeout(() => navigate("/shop/dashboard"), 500);
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Success message */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 ring-1 ring-green-400/30 rounded-xl animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300 font-medium">Success! Redirecting...</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 ring-1 ring-red-400/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Shop name field (register only) */}
      {mode === "register" && (
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">Shop Name</label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/40" />
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              placeholder="My Awesome Shop"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] text-white placeholder-gray-500 ring-1 ring-white/15 focus:ring-2 focus:ring-amber-400/50 focus:bg-white/[0.06] transition-all outline-none"
            />
          </div>
        </div>
      )}

      {/* Email field */}
      <div>
        <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/40" />
          <input
            type="email"
            value={shopEmail}
            onChange={(e) => setShopEmail(e.target.value)}
            required
            placeholder="shop@example.com"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] text-white placeholder-gray-500 ring-1 ring-white/15 focus:ring-2 focus:ring-amber-400/50 focus:bg-white/[0.06] transition-all outline-none"
          />
        </div>
      </div>

      {/* Password field */}
      <div>
        <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/40" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] text-white placeholder-gray-500 ring-1 ring-white/15 focus:ring-2 focus:ring-amber-400/50 focus:bg-white/[0.06] transition-all outline-none"
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading || success}
        className="w-full mt-2 rounded-xl py-3 px-4 font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-amber-600/50 disabled:to-amber-700/50 disabled:cursor-not-allowed text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Success!
          </>
        ) : mode === "login" ? (
          "Sign In to Shop"
        ) : (
          "Register Shop"
        )}
      </button>
    </form>
  );
}

export default ShopAuthForm;


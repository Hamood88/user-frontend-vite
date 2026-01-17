import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { apiPost, setUserSession } from "../api";

console.log("[ShopAuthForm] Module loaded");

export function ShopAuthForm({ mode }) {
  console.log("[ShopAuthForm] Rendering with mode:", mode);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shopName, setShopName] = useState("");
  const [shopEmail, setShopEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        if (!shopEmail.trim() || !password) throw new Error("Please enter your email and password");
        const data = await apiPost("/shop/auth/login", { email: shopEmail.trim().toLowerCase(), password });
        setUserSession({ token: data.token, shop: data.shop }, "shop");
        navigate("/shop/dashboard");
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
        setUserSession({ token: data.token, shop: data.shop }, "shop");
        navigate("/shop/dashboard");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 ring-1 ring-red-400/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {mode === "register" && (
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Shop Name</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
            placeholder="My Awesome Shop"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.03] text-white ring-1 ring-white/10 focus:ring-2 focus:ring-white/20 outline-none"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
        <input
          type="email"
          value={shopEmail}
          onChange={(e) => setShopEmail(e.target.value)}
          required
          placeholder="shop@example.com"
          className="w-full px-3 py-2 rounded-lg bg-white/[0.03] text-white ring-1 ring-white/10 focus:ring-2 focus:ring-white/20 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full px-3 py-2 rounded-lg bg-white/[0.03] text-white ring-1 ring-white/10 focus:ring-2 focus:ring-white/20 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg py-2.5 px-4 font-medium transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-amber-300/20 via-fuchsia-500/20 to-purple-500/25 ring-1 ring-white/10 hover:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Please wait...
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

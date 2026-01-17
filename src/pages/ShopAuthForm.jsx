import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, Store } from "lucide-react";
import { apiPost, setUserSession } from "../api";
import { Button, Input, Alert, Label } from "../components/ui";

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
      {success && <Alert type="success" message="Success! Redirecting..." />}

      {/* Error message */}
      {error && <Alert type="error" message={error} />}

      {/* Shop name field (register only) */}
      {mode === "register" && (
        <div>
          <Label htmlFor="shopName" className="mb-2 block">Shop Name *</Label>
          <Input
            id="shopName"
            icon={Store}
            type="text"
            placeholder="My Awesome Shop"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
          />
        </div>
      )}

      {/* Email */}
      <div>
        <Label htmlFor="shopEmail" className="mb-2 block">Email *</Label>
        <Input
          id="shopEmail"
          icon={Mail}
          type="email"
          placeholder="shop@example.com"
          value={shopEmail}
          onChange={(e) => setShopEmail(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password" className="mb-2 block">Password *</Label>
        <Input
          id="password"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* Remember & Forgot */}
      {mode === "login" && (
        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-gray-900/40" />
            <span className="text-gray-400">Remember me</span>
          </label>
          <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors">Forgot password?</a>
        </div>
      )}

      {/* Submit button */}
      <Button 
        type="submit" 
        variant="shop" 
        className="w-full mt-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {mode === "login" ? "Signing in..." : "Creating shop..."}
          </>
        ) : (
          mode === "login" ? "Log In" : "Sign Up"
        )}
      </Button>
    </form>
  );
}

export default ShopAuthForm;


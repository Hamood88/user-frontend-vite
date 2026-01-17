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
          <Label>Shop Name</Label>
          <Input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
            placeholder="My Awesome Shop"
            icon={Store}
            iconColor="text-amber-400/40"
          />
        </div>
      )}

      {/* Email field */}
      <div>
        <Label>Email Address</Label>
        <Input
          type="email"
          value={shopEmail}
          onChange={(e) => setShopEmail(e.target.value)}
          required
          placeholder="shop@example.com"
          icon={Mail}
          iconColor="text-amber-400/40"
        />
      </div>

      {/* Password field */}
      <div>
        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          icon={Lock}
          iconColor="text-amber-400/40"
        />
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading || success}
        variant="shop"
        className="w-full mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : success ? (
          "Success!"
        ) : mode === "login" ? (
          "Sign In to Shop"
        ) : (
          "Register Shop"
        )}
      </Button>
    </form>
  );
}

export default ShopAuthForm;


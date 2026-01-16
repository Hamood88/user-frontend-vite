import { useMemo, useState, useEffect } from "react";
import { Input } from "../components/Input";
import { Loader2, AlertCircle, Upload, X } from "lucide-react";

function readInviterFromUrl() {
  try {
    const sp = new URLSearchParams(window.location.search);
    const v =
      sp.get("inviter") ||
      sp.get("inviterCode") ||
      sp.get("ref") ||
      sp.get("refCode") ||
      sp.get("code") ||
      "";
    return String(v || "").trim().toUpperCase();
  } catch {
    return "";
  }
}

export function ShopAuthForm({ mode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [shopName, setShopName] = useState("");
  const [shopEmail, setShopEmail] = useState("");
  const [password, setPassword] = useState("");
  const [industryName, setIndustryName] = useState("");
  const [country, setCountry] = useState("");

  const inviterFromLink = useMemo(() => readInviterFromUrl(), []);
  const [inviterCode, setInviterCode] = useState("");
  const inviterLocked = Boolean(inviterFromLink);

  useEffect(() => {
    if (inviterFromLink) setInviterCode(inviterFromLink);
  }, [inviterFromLink]);

  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  const industryOptions = [
    "Fashion & Apparel",
    "Electronics",
    "Home & Garden",
    "Beauty & Cosmetics",
    "Sports & Outdoors",
    "Books & Media",
    "Toys & Games",
    "Food & Beverage",
    "Health & Wellness",
    "Automotive",
    "Art & Crafts",
    "Other",
  ];

  const selectClass =
    "w-full px-3 py-2 rounded-lg bg-white/[0.03] text-white ring-1 ring-white/10 hover:ring-white/20 focus:outline-none focus:ring-2 focus:ring-white/20";

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        if (!shopEmail.trim() || !password) throw new Error("Please enter your email and password");

        const loginEndpoints = [
          "/api/shop/auth/login",
          "/api/shops/auth/login",
          "/api/shop/login",
          "/api/shops/login",
        ];

        const payload = { email: shopEmail.trim().toLowerCase(), password };

        let response = null;
        for (const endpoint of loginEndpoints) {
          try {
            response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (response.ok) break;
          } catch {
            // try next
          }
        }

        if (!response || !response.ok) throw new Error("Invalid credentials");

        const data = await response.json();
        localStorage.setItem("shopToken", data.token);
        localStorage.setItem("shop", JSON.stringify(data.shop));
        alert("Shop login successful! Redirecting...");
      } else {
        if (!shopName.trim() || !shopEmail.trim() || !password) {
          throw new Error("Please fill in Shop Name, Email, and Password");
        }

        const registerEndpoints = [
          "/api/shop/auth/register",
          "/api/shops/auth/register",
          "/api/shop/register",
          "/api/shops/register",
        ];

        const payload = {
          shopName: shopName.trim(),
          name: shopName.trim(),
          shopEmail: shopEmail.trim().toLowerCase(),
          email: shopEmail.trim().toLowerCase(),
          password,
        };

        if (industryName) payload.industryName = industryName;
        if (country) payload.country = country;

        if (inviterCode.trim()) {
          payload.inviterCode = inviterCode.trim().toUpperCase();
          payload.shopReferralCode = inviterCode.trim().toUpperCase();
        }

        if (logoUrl) payload.logoUrl = logoUrl;

        let response = null;
        for (const endpoint of registerEndpoints) {
          try {
            response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (response.ok) break;
          } catch {
            // try next
          }
        }

        if (!response || !response.ok) {
          const errorData = await response?.json().catch(() => ({}));
          throw new Error(errorData?.message || "Registration failed");
        }

        const data = await response.json();
        if (data.token) {
          localStorage.setItem("shopToken", data.token);
          localStorage.setItem("shop", JSON.stringify(data.shop));
        }

        alert("Shop registration successful! Welcome to Moondala!");
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
        <div
          className="flex items-start gap-2 p-3 bg-red-500/10 ring-1 ring-red-400/20 rounded-lg"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {mode === "register" ? (
        <>
          <Input
            label="Shop Name"
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
            placeholder="My Awesome Shop"
          />

          <Input
            label="Email"
            type="email"
            value={shopEmail}
            onChange={(e) => setShopEmail(e.target.value)}
            required
            placeholder="shop@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            showToggle
            placeholder="••••••••"
          />

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-white/45 mb-3">Optional: Complete your shop profile</p>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Industry</label>
              <select value={industryName} onChange={(e) => setIndustryName(e.target.value)} className={selectClass}>
                <option value="">Select industry...</option>
                {industryOptions.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input label="Country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="USA" />

          <Input
            label="Inviter Code"
            type="text"
            value={inviterCode}
            onChange={(e) => setInviterCode(e.target.value.toUpperCase())}
            placeholder={inviterLocked ? "" : "Enter inviter code (optional)"}
            className="uppercase"
            locked={inviterLocked}
            helperText={
              inviterLocked
                ? "Inviter code was applied from your invite link."
                : "If you have an invite code, add it to earn referral benefits."
            }
          />

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Shop Logo</label>

            {logoUrl ? (
              <div className="relative inline-block">
                <img src={logoUrl} alt="Shop logo preview" className="w-24 h-24 object-cover rounded-lg ring-1 ring-white/15" />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400/40"
                  aria-label="Remove logo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg cursor-pointer
                ring-1 ring-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:ring-white/20 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-white/45 mb-2" />
                  <p className="text-sm text-white/70">Click to upload logo</p>
                  <p className="text-xs text-white/45">PNG, JPG up to 5MB</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            )}
          </div>
        </>
      ) : (
        <>
          <Input label="Shop Email" type="email" value={shopEmail} onChange={(e) => setShopEmail(e.target.value)} required placeholder="shop@example.com" />

          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required showToggle placeholder="••••••••" />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-white/80" />
              <span className="text-white/60">Remember me</span>
            </label>
            <a href="#" className="text-amber-200 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-1">Forgot password?</a>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg py-2.5 px-4 font-medium transition-all flex items-center justify-center gap-2
          bg-gradient-to-r from-amber-300/20 via-fuchsia-500/20 to-purple-500/25
          ring-1 ring-white/10 hover:ring-white/20 hover:bg-white/10
          shadow-[0_0_30px_rgba(251,191,36,0.10)]
          disabled:opacity-50 disabled:cursor-not-allowed"
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

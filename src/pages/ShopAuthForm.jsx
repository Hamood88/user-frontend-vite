import { useState } from "react";

export function ShopAuthForm({ mode }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
      minHeight: '400px'
    }}>
      <div style={{
        fontSize: '64px',
        marginBottom: '24px'
      }}>
        🚀
      </div>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#22c55e',
        marginBottom: '16px',
        letterSpacing: '0.5px'
      }}>
        You're in!
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#94a3b8',
        lineHeight: '1.7',
        marginBottom: '12px',
        maxWidth: '400px'
      }}>
        The Moondala shop app isn't ready yet.
      </p>
      <p style={{
        fontSize: '16px',
        color: '#94a3b8',
        lineHeight: '1.7',
        fontWeight: '600'
      }}>
        We'll notify you as soon as it's live.
      </p>
    </div>
  );
}

export default ShopAuthForm;

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return minLength && hasUpper && hasLower && hasNumber;
};

const calculateAge = (dateString) => {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export function ShopAuthForm({ mode }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
      minHeight: '400px'
    }}>
      <div style={{
        fontSize: '64px',
        marginBottom: '24px'
      }}>
        🚀
      </div>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#22c55e',
        marginBottom: '16px',
        letterSpacing: '0.5px'
      }}>
        You're in!
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#94a3b8',
        lineHeight: '1.7',
        marginBottom: '12px',
        maxWidth: '400px'
      }}>
        The Moondala shop app isn't ready yet.
      </p>
      <p style={{
        fontSize: '16px',
        color: '#94a3b8',
        lineHeight: '1.7',
        fontWeight: '600'
      }}>
        We'll notify you as soon as it's live.
      </p>
    </div>
  );
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      if (mode === "login") {
        if (!validateEmail(shopEmail)) {
          throw new Error("Please enter a valid email address");
        }

        const data = await apiPost("/shop/auth/login", { 
          email: shopEmail.trim().toLowerCase(), 
          password 
        });
        setSuccess(true);
        setUserSession({ token: data.token, shop: data.shop }, "shop");
        
        // ✅ Redirect with token in URL for cross-domain auth
        const shopUrl = import.meta.env.PROD 
          ? `https://shop.moondala.one/shop/feed?token=${data.token}` 
          : `http://localhost:3001/shop/feed?token=${data.token}`; 
        window.location.href = shopUrl;
      } else if (mode === "signup") {
        // Validate required fields
        if (!shopName.trim() || !ownerFirstName.trim() || !ownerLastName.trim() || !shopEmail.trim() || !password) {
          throw new Error("Please fill in all required fields");
        }

        if (!validateEmail(shopEmail)) {
          throw new Error("Please enter a valid email address");
        }

        if (!validatePassword(password)) {
          throw new Error("Password must be at least 8 characters with uppercase, lowercase, and numbers");
        }

        if (!phoneNumber.trim()) {
          throw new Error("Phone number is required");
        }

        if (!dobDay || !dobMonth || !dobYear) {
          throw new Error("Owner date of birth is required");
        }

        const dateStr = `${dobYear}-${String(dobMonth).padStart(2, "0")}-${String(dobDay).padStart(2, "0")}`;
        const age = calculateAge(dateStr);
        if (age < 18) {
          throw new Error("Shop owner must be at least 18 years old");
        }

        if (!country) {
          throw new Error("Country is required");
        }

        // ✅ Early Access Application Payload
        const registerData = {
          shopName: shopName.trim(),
          shopEmail: shopEmail.trim().toLowerCase(),
          email: shopEmail.trim().toLowerCase(),
          password,
          ownerFirstName: ownerFirstName.trim(),
          ownerLastName: ownerLastName.trim(),
          dateOfBirth: dateStr, // Keep compatibility with backend schema
          country: country,
          phone: phoneNumber.trim(),
        };

        if (inviterCode.trim()) {
          registerData.inviterCode = inviterCode.trim().toUpperCase();
        }

        // ✅ Change endpoint to Early Access
        await apiPost("/shop-early-access/apply", registerData);
        
        setSuccess(true);
        setError("Your application has been received! This is a waitlist. We will contact you soon.");
        setIsLoading(false);
        // Do not redirect to shop feed or save session
        return;

      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
      {success && <Alert type="success" message="Success! Joined Waitlist." />}
      
      {error && !success && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {error && success && (
        <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-300">{error}</p>
        </div>
      )}

      {mode === "login" ? (
        <>
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

          <div>
            <Label htmlFor="password" className="mb-2 block">Password *</Label>
            <Input
              id="password"
              icon={Lock}
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-gray-900/40" />
              <span className="text-gray-400">Remember me</span>
            </label>
            <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors">Forgot password?</a>
          </div>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="shopName" className="mb-2 block text-xs">Shop Name *</Label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ownerFirstName" className="mb-2 block text-xs">Owner First Name *</Label>
              <Input
                id="ownerFirstName"
                icon={User}
                type="text"
                placeholder="John"
                value={ownerFirstName}
                onChange={(e) => setOwnerFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="ownerLastName" className="mb-2 block text-xs">Owner Last Name *</Label>
              <Input
                id="ownerLastName"
                icon={User}
                type="text"
                placeholder="Doe"
                value={ownerLastName}
                onChange={(e) => setOwnerLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shopEmail" className="mb-2 block text-xs">Shop Email *</Label>
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

          <div>
            <Label htmlFor="password" className="mb-2 block text-xs">
              Password * <span className="text-gray-500 text-xs ml-1">(8+ chars, uppercase, lowercase, number)</span>
            </Label>
            <Input
              id="password"
              icon={Lock}
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber" className="mb-2 block text-xs">Phone Number *</Label>
            <Input
              id="phoneNumber"
              icon={Phone}
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <Label className="mb-2 block text-xs">Owner Date of Birth * <span className="text-gray-500 text-xs ml-1">(Must be 18+)</span></Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                options={Array.from({ length: 31 }, (_, i) => ({
                  value: String(i + 1),
                  label: String(i + 1).padStart(2, "0")
                }))}
                placeholder="Day"
              />
              <Select
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
                options={[
                  { value: "1", label: "January" },
                  { value: "2", label: "February" },
                  { value: "3", label: "March" },
                  { value: "4", label: "April" },
                  { value: "5", label: "May" },
                  { value: "6", label: "June" },
                  { value: "7", label: "July" },
                  { value: "8", label: "August" },
                  { value: "9", label: "September" },
                  { value: "10", label: "October" },
                  { value: "11", label: "November" },
                  { value: "12", label: "December" },
                ]}
                placeholder="Month"
              />
              <Select
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                options={Array.from({ length: 80 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return { value: String(year), label: String(year) };
                })}
                placeholder="Year"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country" className="mb-2 block text-xs">Country *</Label>
            <Select
              id="country"
              icon={Globe}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              options={countries.map(c => ({ value: c, label: c }))}
              placeholder="Select country"
            />
          </div>

          <div>
            <Label htmlFor="inviterCode" className="mb-2 block text-xs">
              Invited By Code {inviterCode && <span className="text-green-400">(Auto-filled)</span>}
            </Label>
            <Input
              id="inviterCode"
              type="text"
              placeholder="Enter inviter code if you have one"
              value={inviterCode}
              onChange={(e) => setInviterCode(e.target.value)}
              disabled={!!inviterCode}
              className={inviterCode ? "bg-green-500/10 border-green-500/30" : ""}
            />
          </div>
        </>
      )}

      <Button
        type="submit"
        variant="shop"
        className="w-full mt-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {mode === "login" ? "Signing in..." : "Submitting..."}
          </>
        ) : (
          mode === "login" ? "Log In" : "Join Waitlist"
        )}
      </Button>
    </form>
  );
}

export default ShopAuthForm;

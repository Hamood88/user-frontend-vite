import { useState, FormEvent } from 'react';
import { Input } from './Input';
import { Loader2, AlertCircle, Upload, X } from 'lucide-react';

type AuthMode = 'login' | 'register';

interface ShopAuthFormProps {
  mode: AuthMode;
}

export function ShopAuthForm({ mode }: ShopAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [shopName, setShopName] = useState('');
  const [shopEmail, setShopEmail] = useState('');
  const [password, setPassword] = useState('');
  const [industryName, setIndustryName] = useState('');
  const [country, setCountry] = useState('');
  const [inviterCode, setInviterCode] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const industryOptions = [
    'Fashion & Apparel',
    'Electronics',
    'Home & Garden',
    'Beauty & Cosmetics',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Food & Beverage',
    'Health & Wellness',
    'Automotive',
    'Art & Crafts',
    'Other',
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoUrl('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        // Validate required fields
        if (!shopEmail.trim() || !password) {
          throw new Error('Please enter your email and password');
        }

        // API: Try multiple shop login endpoints
        const loginEndpoints = [
          '/api/shop/auth/login',
          '/api/shops/auth/login',
          '/api/shop/login',
          '/api/shops/login',
        ];

        const payload = {
          email: shopEmail.trim().toLowerCase(),
          password,
        };

        console.log('Shop login payload:', payload);

        // Try endpoints in order
        let response: Response | null = null;
        let lastError: Error | null = null;

        for (const endpoint of loginEndpoints) {
          try {
            response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              break; // Success
            }
          } catch (err: any) {
            lastError = err;
            continue; // Try next endpoint
          }
        }

        if (!response || !response.ok) {
          throw lastError || new Error('Invalid credentials');
        }

        const data = await response.json();
        
        // Store shop token and data
        localStorage.setItem('shopToken', data.token);
        localStorage.setItem('shop', JSON.stringify(data.shop));
        
        alert('Shop login successful! Redirecting to dashboard...');
        // window.location.href = '/shop/dashboard';
      } else {
        // Register mode
        // Validate required fields
        if (!shopName.trim() || !shopEmail.trim() || !password) {
          throw new Error('Please fill in all required fields (Shop Name, Email, Password)');
        }

        // API: Try multiple shop register endpoints
        const registerEndpoints = [
          '/api/shop/auth/register',
          '/api/shops/auth/register',
          '/api/shop/register',
          '/api/shops/register',
        ];

        // Build payload with exact keys expected by backend
        const payload: any = {
          shopName: shopName.trim(),
          name: shopName.trim(), // Send both for compatibility
          shopEmail: shopEmail.trim().toLowerCase(),
          email: shopEmail.trim().toLowerCase(), // Send both for compatibility
          password,
        };

        // Add optional fields
        if (industryName) payload.industryName = industryName;
        if (country) payload.country = country;
        if (inviterCode.trim()) {
          payload.inviterCode = inviterCode.trim().toUpperCase();
          payload.shopReferralCode = inviterCode.trim().toUpperCase(); // Alternative field name
        }
        if (logoUrl) payload.logoUrl = logoUrl;

        console.log('Shop register payload:', payload);

        // Try endpoints in order
        let response: Response | null = null;
        let lastError: Error | null = null;

        for (const endpoint of registerEndpoints) {
          try {
            response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              break; // Success
            }
          } catch (err: any) {
            lastError = err;
            continue; // Try next endpoint
          }
        }

        if (!response || !response.ok) {
          const errorData = await response?.json().catch(() => ({}));
          throw new Error(errorData?.message || lastError?.message || 'Registration failed');
        }

        const data = await response.json();
        
        // Store shop token and data
        if (data.token) {
          localStorage.setItem('shopToken', data.token);
          localStorage.setItem('shop', JSON.stringify(data.shop));
        }
        
        alert('Shop registration successful! Welcome to SocialCommerce!');
        // window.location.href = '/shop/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {mode === 'register' ? (
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

          {/* Optional Fields */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-3">Optional: Complete your shop profile</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
              <select
                value={industryName}
                onChange={(e) => setIndustryName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select industry...</option>
                {industryOptions.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="USA"
          />

          <Input
            label="Inviter Code (Optional)"
            type="text"
            value={inviterCode}
            onChange={(e) => setInviterCode(e.target.value.toUpperCase())}
            placeholder="Enter referral code if you have one"
            className="uppercase"
          />

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Shop Logo
            </label>
            
            {logoUrl ? (
              <div className="relative inline-block">
                <img 
                  src={logoUrl} 
                  alt="Shop logo preview" 
                  className="w-24 h-24 object-cover rounded-lg border-2 border-slate-300"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Remove logo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Click to upload logo</p>
                  <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </label>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Login Mode - Minimal Fields */}
          <Input
            label="Shop Email"
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500" />
              <span className="text-slate-600">Remember me</span>
            </label>
            <a href="#" className="text-purple-600 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-1">
              Forgot password?
            </a>
          </div>
        </>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2.5 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Please wait...
          </>
        ) : (
          mode === 'login' ? 'Sign In to Shop' : 'Register Shop'
        )}
      </button>

      {mode === 'login' && (
        <p className="text-center text-sm text-slate-600">
          New seller?{' '}
          <button type="button" className="text-purple-600 hover:text-purple-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-1">
            Register your shop
          </button>
        </p>
      )}

      {mode === 'register' && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs text-purple-800">
            <strong>Benefits of selling:</strong> Reach millions of buyers, get analytics, 
            referral rewards, and secure payment processing. Join our growing marketplace today!
          </p>
        </div>
      )}
    </form>
  );
}

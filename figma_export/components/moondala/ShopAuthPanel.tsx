import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Store, TrendingUp, BarChart3, Zap } from 'lucide-react';
import { MoondalaInput } from './MoondalaInput';
import { MoondalaButton } from './MoondalaButton';

export function ShopAuthPanel() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    'Fashion & Apparel',
    'Electronics',
    'Home & Garden',
    'Beauty & Cosmetics',
    'Sports & Outdoors',
    'Food & Beverage',
    'Art & Crafts',
    'Other',
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      alert(mode === 'signin' ? 'Shop signed in!' : 'Shop account created!');
    }, 1500);
  };

  return (
    <div className="relative h-full flex items-center justify-center p-12">
      <div className="w-full max-w-[480px] relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B]/20 to-[#EC4899]/20 border border-white/10 mb-4">
            <Store className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-3">
            Join as a Seller
          </h2>
          <p className="text-white/60 text-lg">
            Grow your business and reach millions of buyers
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div 
          className="mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-transparent border border-[#F59E0B]/30 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <p className="text-xs text-white/70 font-medium">Grow Sales</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EC4899]/20 to-transparent border border-[#EC4899]/30 flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-5 h-5 text-[#EC4899]" />
              </div>
              <p className="text-xs text-white/70 font-medium">Analytics</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-transparent border border-[#F59E0B]/30 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <p className="text-xs text-white/70 font-medium">Easy Setup</p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="relative rounded-2xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Gradient Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F59E0B]/10 via-transparent to-[#EC4899]/10 -z-10 blur-2xl" />

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#EC4899] text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#EC4899] text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <>
                <MoondalaInput
                  id="shop-name"
                  label="Shop Name"
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-2 ml-1">
                    Category <span className="text-[#F59E0B]">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 hover:border-white/20 transition-all"
                    style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)' }}
                  >
                    <option value="" disabled className="bg-[#0A0E1A] text-white">
                      Select category...
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0A0E1A] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <MoondalaInput
              id="shop-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <MoondalaInput
              id="shop-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              showPasswordToggle
            />

            {mode === 'signup' && (
              <MoondalaInput
                id="shop-confirm-password"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                showPasswordToggle
              />
            )}

            {mode === 'signin' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/50"
                  />
                  <span className="text-white/60">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-[#F59E0B] hover:text-[#EC4899] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <MoondalaButton 
              type="submit" 
              variant={mode === 'signin' ? 'shop' : 'shop'} 
              isLoading={isLoading}
            >
              {mode === 'signin' ? 'Sign In to Shop' : 'Create Shop Account'}
            </MoondalaButton>

            <p className="text-center text-xs text-white/40 mt-4">
              By continuing you agree to our{' '}
              <button type="button" className="text-[#F59E0B] hover:underline">
                Terms
              </button>
              {' & '}
              <button type="button" className="text-[#F59E0B] hover:underline">
                Privacy
              </button>
            </p>
          </form>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#F59E0B]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-[#EC4899]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}

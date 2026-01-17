import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Users, Sparkles, TrendingUp, Gift, Shield } from 'lucide-react';
import { MoondalaInput } from './MoondalaInput';
import { MoondalaButton } from './MoondalaButton';

export function UserAuthPanel() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      alert(mode === 'signin' ? 'User signed in!' : 'User account created!');
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
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#2DD4BF]/20 border border-white/10 mb-4">
            <Users className="w-8 h-8 text-[#2DD4BF]" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-3">
            Join as a Buyer
          </h2>
          <p className="text-white/60 text-lg">
            Shop, discover amazing products, and earn rewards
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div 
          className="mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-transparent border border-[#7C3AED]/30 flex items-center justify-center mx-auto mb-2">
                <Gift className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <p className="text-xs text-white/70 font-medium">Earn Rewards</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DD4BF]/20 to-transparent border border-[#2DD4BF]/30 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-[#2DD4BF]" />
              </div>
              <p className="text-xs text-white/70 font-medium">Best Deals</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-transparent border border-[#7C3AED]/30 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <p className="text-xs text-white/70 font-medium">Secure</p>
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
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Gradient Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7C3AED]/10 via-transparent to-[#2DD4BF]/10 -z-10 blur-2xl" />

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#2DD4BF] text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#2DD4BF] text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <MoondalaInput
                id="user-fullname"
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            )}

            <MoondalaInput
              id="user-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <MoondalaInput
              id="user-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              showPasswordToggle
            />

            {mode === 'signup' && (
              <MoondalaInput
                id="user-confirm-password"
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
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/50"
                  />
                  <span className="text-white/60">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-[#2DD4BF] hover:text-[#7C3AED] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <MoondalaButton type="submit" variant="primary" isLoading={isLoading}>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </MoondalaButton>

            <p className="text-center text-xs text-white/40 mt-4">
              By continuing you agree to our{' '}
              <button type="button" className="text-[#2DD4BF] hover:underline">
                Terms
              </button>
              {' & '}
              <button type="button" className="text-[#2DD4BF] hover:underline">
                Privacy
              </button>
            </p>
          </form>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-[#7C3AED]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#2DD4BF]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}

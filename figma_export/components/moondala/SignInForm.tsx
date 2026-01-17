import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { MoondalaInput } from './MoondalaInput';
import { MoondalaButton } from './MoondalaButton';
import { SocialSignIn } from './SocialSignIn';

interface SignInFormProps {
  onSuccess: (message: string) => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSuccess('Signed in successfully!');
    }, 1500);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Social Sign In */}
      <SocialSignIn />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-transparent text-white/50">Or continue with email</span>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <MoondalaInput
          id="signin-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <MoondalaInput
          id="signin-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          showPasswordToggle
          autoComplete="current-password"
        />
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#6B4CFA] focus:ring-2 focus:ring-[#6B4CFA]/50 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-white/70 group-hover:text-white transition-colors">Remember me</span>
        </label>
        <button
          type="button"
          className="text-[#32D1FF] hover:text-[#6B4CFA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B4CFA]/50 rounded px-1"
        >
          Forgot password?
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <MoondalaButton type="submit" variant="primary" isLoading={isLoading}>
        Sign In
      </MoondalaButton>

      {/* Terms */}
      <p className="text-center text-xs text-white/50">
        By continuing you agree to our{' '}
        <button type="button" className="text-[#32D1FF] hover:underline focus:outline-none">
          Terms
        </button>
        {' & '}
        <button type="button" className="text-[#32D1FF] hover:underline focus:outline-none">
          Privacy
        </button>
        .
      </p>
    </motion.form>
  );
}

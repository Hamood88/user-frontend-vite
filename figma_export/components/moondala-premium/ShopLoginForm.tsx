import { useState, FormEvent } from 'react';
import { Mail, Lock } from 'lucide-react';
import { PremiumInput } from './PremiumInput';
import { PremiumButton } from './PremiumButton';

export function ShopLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      alert('Shop logged in!');
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-6">
      <PremiumInput
        label="Email"
        type="email"
        icon={<Mail className="w-5 h-5" />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <PremiumInput
        label="Password"
        type="password"
        icon={<Lock className="w-5 h-5" />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        showPasswordToggle
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/50 cursor-pointer"
          />
          <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
            Remember me
          </span>
        </label>

        <button
          type="button"
          className="text-sm text-[#D4AF37] hover:text-[#FFD700] transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <PremiumButton type="submit" isLoading={isLoading} accentColor="gold">
        Log In
      </PremiumButton>

      <p className="text-center text-xs text-white/30 pt-2 border-t border-white/5">
        By continuing you agree to{' '}
        <button type="button" className="text-white/50 hover:text-[#D4AF37]">
          Terms
        </button>
        {' & '}
        <button type="button" className="text-white/50 hover:text-[#D4AF37]">
          Privacy
        </button>
        .
      </p>
    </form>
  );
}

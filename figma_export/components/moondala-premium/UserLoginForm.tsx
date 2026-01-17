import { useState, FormEvent } from 'react';
import { Mail, Lock } from 'lucide-react';
import { PremiumInput } from './PremiumInput';
import { PremiumButton } from './PremiumButton';
import { ErrorMessage } from './ErrorMessage';
import { authService } from '../../services/authService';
import { validateEmail, validateRequired } from './FormValidation';

export function UserLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Field-level errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate
    const emailErr = validateEmail(email);
    const passwordErr = validateRequired(password, 'Password');

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.loginUser({ email: email.trim(), password });
      
      if (response.token) {
        authService.saveToken(response.token, 'user');
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      setSuccess(true);
      
      // Redirect to dashboard after success
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-6">
      {error && <ErrorMessage message={error} type="error" />}
      {success && <ErrorMessage message="Login successful! Redirecting..." type="success" />}

      <PremiumInput
        label="Email"
        type="email"
        icon={<Mail className="w-5 h-5" />}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError(null);
        }}
        error={emailError || undefined}
        required
        disabled={isLoading}
        autoComplete="email"
      />

      <PremiumInput
        label="Password"
        type="password"
        icon={<Lock className="w-5 h-5" />}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setPasswordError(null);
        }}
        error={passwordError || undefined}
        required
        showPasswordToggle
        disabled={isLoading}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/50 cursor-pointer disabled:opacity-50"
          />
          <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
            Remember me
          </span>
        </label>

        <button
          type="button"
          className="text-sm text-[#D4AF37] hover:text-[#C4A962] transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>

      <PremiumButton type="submit" isLoading={isLoading} accentColor="purple">
        {isLoading ? 'Signing In...' : 'Log In'}
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
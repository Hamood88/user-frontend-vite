import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { MoondalaInput } from './MoondalaInput';
import { MoondalaButton } from './MoondalaButton';
import { SocialSignIn } from './SocialSignIn';

interface SignUpUserFormProps {
  onSuccess: (message: string) => void;
}

export function SignUpUserForm({ onSuccess }: SignUpUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSuccess('User account created successfully!');
    }, 2000);
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
          <span className="px-3 bg-transparent text-white/50">Or create with email</span>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <MoondalaInput
          id="signup-fullname"
          label="Full Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          success={fullName.trim().length > 0 && !errors.fullName}
          required
          autoComplete="name"
        />

        <MoondalaInput
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          success={email.includes('@') && !errors.email}
          required
          autoComplete="email"
        />

        <MoondalaInput
          id="signup-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          success={password.length >= 8 && !errors.password}
          required
          showPasswordToggle
          autoComplete="new-password"
        />

        <MoondalaInput
          id="signup-confirm-password"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          success={confirmPassword.length > 0 && password === confirmPassword}
          required
          showPasswordToggle
          autoComplete="new-password"
        />

        <MoondalaInput
          id="signup-phone"
          label="Phone (Optional)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </div>

      {/* Submit Button */}
      <MoondalaButton type="submit" variant="primary" isLoading={isLoading}>
        Create Account
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

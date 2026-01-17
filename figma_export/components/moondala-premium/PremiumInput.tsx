import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  showPasswordToggle?: boolean;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, icon, error, showPasswordToggle, type = 'text', className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <div className="relative">
        <label className="block text-sm font-semibold text-white/70 mb-2">
          {label}
          {props.required && <span className="text-[#F472B6] ml-1">*</span>}
        </label>
        
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A78BFA]/60 pointer-events-none z-10">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={`w-full ${icon ? 'pl-12' : 'pl-4'} ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 transition-all focus:outline-none hover:border-white/20 backdrop-blur-sm ${
              error ? 'border-red-400/50 focus:border-red-400' : 'focus:border-[#D4AF37] focus:shadow-lg focus:shadow-[#D4AF37]/15'
            } ${className}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Animated Glow Underline */}
          {isFocused && !error && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6B46C1] via-[#D4AF37] to-[#C4A962]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ transformOrigin: 'left' }}
            />
          )}

          {/* Password Toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#D4AF37] transition-colors z-10"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            className="mt-2 text-xs text-red-400 font-medium"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = 'PremiumInput';
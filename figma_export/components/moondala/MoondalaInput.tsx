import { useState, forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MoondalaInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  showPasswordToggle?: boolean;
}

export const MoondalaInput = forwardRef<HTMLInputElement, MoondalaInputProps>(
  ({ label, error, success, showPasswordToggle, type = 'text', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="relative">
        <div className="relative">
          {/* Floating Label */}
          <motion.label
            className={`absolute left-4 transition-all pointer-events-none font-medium ${
              isFocused || hasValue || props.value
                ? 'top-2 text-xs text-white/70'
                : 'top-1/2 -translate-y-1/2 text-sm text-white/50'
            }`}
            animate={{
              y: isFocused || hasValue || props.value ? 0 : 0,
            }}
          >
            {label}
            {props.required && <span className="text-[#F6C343] ml-1">*</span>}
          </motion.label>

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            className={`w-full px-4 pt-7 pb-3 rounded-xl bg-white/5 border transition-all focus:outline-none ${
              error
                ? 'border-red-400/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                : success
                ? 'border-green-400/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                : 'border-white/10 focus:border-[#6B4CFA] focus:ring-2 focus:ring-[#6B4CFA]/20 hover:border-white/20'
            } text-white placeholder-white/30 ${
              isPassword && showPasswordToggle ? 'pr-12' : success || error ? 'pr-10' : ''
            }`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            style={{
              boxShadow: isFocused ? '0 0 0 1px rgba(107, 76, 250, 0.3), inset 0 2px 8px rgba(0, 0, 0, 0.2)' : 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            {...props}
          />

          {/* Password Toggle */}
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 p-2 text-white/50 hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-[#6B4CFA]/50 rounded-lg transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Success Icon */}
          {success && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
              <Check className="w-5 h-5 text-green-400" />
            </div>
          )}

          {/* Error Icon */}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              id={`${props.id}-error`}
              className="mt-2 text-xs text-red-400 flex items-center gap-1"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

MoondalaInput.displayName = 'MoondalaInput';

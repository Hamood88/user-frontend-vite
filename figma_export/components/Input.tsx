import { useState, InputHTMLAttributes, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, showToggle, type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              error
                ? 'border-red-300 bg-red-50'
                : 'border-slate-300 bg-white hover:border-slate-400'
            } ${isPasswordField && showToggle ? 'pr-10' : ''} ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          {isPasswordField && showToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

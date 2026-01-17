import { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { Input } from './Input';

interface ReferralFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoGenerate?: boolean;
  helperText?: string;
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function ReferralField({ 
  label, 
  value, 
  onChange, 
  required, 
  autoGenerate,
  helperText 
}: ReferralFieldProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Auto-generate on mount if required and empty
    if (autoGenerate && required && !value) {
      onChange(generateReferralCode());
    }
  }, [autoGenerate, required, value, onChange]);

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    onChange(generateReferralCode());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and allow only alphanumeric
    const newValue = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    onChange(newValue);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {autoGenerate && (
          <button
            type="button"
            onClick={handleRegenerate}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
            title="Generate new code"
          >
            <RefreshCw className="w-3 h-3" />
            Generate
          </button>
        )}
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm uppercase"
          placeholder={autoGenerate ? 'Auto-generated' : 'Enter code'}
          required={required}
          maxLength={12}
        />
        {value && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Copy referral code"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      
      {helperText && (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      )}
      
      {required && autoGenerate && (
        <p className="mt-1.5 text-xs text-blue-600 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          Your unique referral code - share it to earn rewards!
        </p>
      )}
    </div>
  );
}

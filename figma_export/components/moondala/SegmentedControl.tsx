import { motion } from 'motion/react';
import { AuthMode } from './MoondalaAuthPage';

interface SegmentedControlProps {
  value: AuthMode;
  onChange: (value: AuthMode) => void;
}

export function SegmentedControl({ value, onChange }: SegmentedControlProps) {
  const options: { value: AuthMode; label: string }[] = [
    { value: 'signin', label: 'Sign In' },
    { value: 'signup-user', label: 'Sign Up — User' },
    { value: 'signup-shop', label: 'Sign Up — Shop' },
  ];

  return (
    <div 
      className="relative flex gap-1 p-1 rounded-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      role="tablist"
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#6B4CFA]/50 ${
            value === option.value
              ? 'text-white'
              : 'text-white/60 hover:text-white/80'
          }`}
          role="tab"
          aria-selected={value === option.value}
        >
          {value === option.value && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#6B4CFA] to-[#32D1FF] shadow-lg"
              style={{
                boxShadow: '0 4px 16px rgba(107, 76, 250, 0.4)',
              }}
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
          <span className="relative z-10 whitespace-nowrap">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

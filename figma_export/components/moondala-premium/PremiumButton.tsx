import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  accentColor?: 'purple' | 'blue';
  children: ReactNode;
}

export function PremiumButton({ 
  variant = 'primary', 
  isLoading, 
  accentColor = 'purple',
  children,
  className = '',
  disabled,
  ...props 
}: PremiumButtonProps) {
  const gradients = {
    purple: 'from-[#6B46C1] via-[#8B5CF6] to-[#D4AF37]',
    blue: 'from-[#D4AF37] via-[#C4A962] to-[#6B46C1]',
  };

  const shadows = {
    purple: '0 12px 32px rgba(107, 70, 193, 0.3)',
    blue: '0 12px 32px rgba(212, 175, 55, 0.3)',
  };

  const baseStyles = "relative w-full px-6 py-4 rounded-2xl font-semibold text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0D1C] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";

  const variantStyles = {
    primary: `bg-gradient-to-r ${gradients[accentColor]} text-white hover:shadow-2xl`,
    secondary: "bg-white/5 text-white border border-white/20 hover:bg-white/8 hover:border-white/30 focus:ring-white/20",
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${className} group`}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale: 1.01, boxShadow: variant === 'primary' ? shadows[accentColor] : undefined } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.99 } : {}}
      {...props}
    >
      {/* Shimmer Effect */}
      {variant === 'primary' && !isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          initial={{ x: '-200%' }}
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.7 }}
        />
      )}

      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {children}
      </span>
    </motion.button>
  );
}
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface MoondalaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'shop';
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function MoondalaButton({ 
  variant = 'primary', 
  isLoading, 
  icon, 
  children,
  className = '',
  disabled,
  ...props 
}: MoondalaButtonProps) {
  const baseStyles = "relative w-full px-6 py-3.5 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0E1A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  const variantStyles = {
    primary: "bg-gradient-to-r from-[#7C3AED] to-[#2DD4BF] text-white hover:shadow-2xl hover:shadow-[#7C3AED]/30 focus:ring-[#7C3AED]/50",
    secondary: "bg-white/5 text-white border border-white/20 hover:bg-white/10 hover:border-white/30 focus:ring-white/20",
    shop: "bg-gradient-to-r from-[#F59E0B] to-[#EC4899] text-white hover:shadow-2xl hover:shadow-[#F59E0B]/30 focus:ring-[#F59E0B]/50",
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {!isLoading && icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}

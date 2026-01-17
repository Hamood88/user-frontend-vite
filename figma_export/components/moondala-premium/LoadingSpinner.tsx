import { motion } from 'motion/react';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizes[size]} rounded-full border-2 border-white/20 border-t-[#D4AF37]`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-[#0A0D1C] flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-white/60 text-sm">Loading...</p>
      </div>
    </div>
  );
}

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
          >
            <div className="px-4 py-2 bg-gradient-to-r from-[#6B46C1] to-[#D4AF37] rounded-xl shadow-2xl backdrop-blur-xl whitespace-nowrap border border-white/20">
              <p className="text-xs text-white font-medium">{content}</p>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#6B46C1] transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
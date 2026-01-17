import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface AuthHeroProps {
  isMobile?: boolean;
}

export function AuthHero({ isMobile = false }: AuthHeroProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background Gradient Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#6B4CFA]/30 via-[#32D1FF]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-[#6B4CFA]/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }} />
      </div>

      {/* Concentric Rings - Decorative */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/5"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1 + i * 0.2, 
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              width: `${300 + i * 100}px`,
              height: `${300 + i * 100}px`,
            }}
          />
        ))}
      </div>

      {/* Floating Particles */}
      {!isMobile && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-gradient-to-br from-[#6B4CFA] to-[#32D1FF] rounded-full opacity-40"
              initial={{ 
                x: Math.random() * 400 - 200, 
                y: Math.random() * 400 - 200,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                scale: Math.random() * 0.8 + 0.4,
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-6 lg:px-16 max-w-2xl">
        {/* Logo - Top Left on Desktop */}
        {!isMobile && (
          <motion.div 
            className="absolute top-[-200px] left-[-100px]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3">
              {/* Logo Placeholder - Replace with actual logo */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6B4CFA] to-[#32D1FF] flex items-center justify-center shadow-lg shadow-[#6B4CFA]/50">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Moondala Inc.</h1>
                <p className="text-xs text-white/60">Premium Marketplace</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile Logo */}
        {isMobile && (
          <motion.div 
            className="mb-6 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6B4CFA] to-[#32D1FF] flex items-center justify-center shadow-lg shadow-[#6B4CFA]/50">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-white tracking-tight">Moondala Inc.</h1>
                <p className="text-[10px] text-white/60">Premium Marketplace</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Headline */}
        <motion.h2
          className={`font-bold text-white mb-4 ${
            isMobile ? 'text-3xl' : 'text-5xl lg:text-6xl'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Welcome to Moondala
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className={`text-white/70 leading-relaxed ${
            isMobile ? 'text-sm' : 'text-lg'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Sign in or create an account — for buyers and shop owners.
        </motion.p>

        {/* Decorative Elements */}
        {!isMobile && (
          <motion.div
            className="mt-12 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-[#6B4CFA] to-[#32D1FF]"
                style={{ opacity: 0.4 - i * 0.1 }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Watermark Logo - Subtle */}
      {!isMobile && (
        <div className="absolute bottom-12 left-12 opacity-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#6B4CFA] to-[#32D1FF] flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

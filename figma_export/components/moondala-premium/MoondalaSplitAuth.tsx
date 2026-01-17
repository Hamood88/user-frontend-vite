import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import logoImage from 'figma:asset/566482270f2f7476c9230885f0e12f34381635d9.png';
import { UserAuthPanel } from './UserAuthPanel';
import { ShopAuthPanel } from './ShopAuthPanel';
import { FloatingParticles } from './FloatingParticles';

export function MoondalaSplitAuth() {
  const [inviterCode, setInviterCode] = useState<string | null>(null);

  useEffect(() => {
    // Check URL for invite code
    const params = new URLSearchParams(window.location.search);
    const code = params.get('inviterCode') || params.get('inviter');
    if (code) {
      setInviterCode(code);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0D1C] via-[#12141F] to-[#0A0D1C] relative overflow-hidden">
      {/* Elegant Background Gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-[#6B46C1]/15 via-[#8B5CF6]/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#D4AF37]/8 via-[#C4A962]/5 to-transparent rounded-full blur-3xl" />
      </div>
      
      {/* Subtle Mesh Gradient Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(107, 70, 193, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.06) 0%, transparent 50%)',
        }}
      />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Brand Header */}
        <motion.header
          className="text-center py-10 px-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <motion.div 
            className="flex items-center justify-center mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-[#6B46C1]/15 to-transparent blur-3xl rounded-full scale-150" />
              <img 
                src={logoImage} 
                alt="Moondala Inc." 
                className="relative w-48 h-48 object-contain drop-shadow-2xl"
                style={{ 
                  mixBlendMode: 'lighten',
                  filter: 'brightness(1.15) contrast(1.1) saturate(0.95)'
                }}
              />
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5F5F5] to-[#C4A962] font-semibold tracking-wide mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Social Commerce, Shared Profits
          </motion.p>

          {/* Microcopy */}
          <p className="text-sm text-white/40 font-light">
            Choose your account type to continue
          </p>
        </motion.header>

        {/* Main Split Panels */}
        <div className="flex-1 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Panel */}
              <UserAuthPanel inviterCode={inviterCode} />

              {/* Shop Panel */}
              <ShopAuthPanel inviterCode={inviterCode} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          className="py-6 px-6 border-t border-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="max-w-7xl mx-auto flex justify-center gap-8 text-sm text-white/40">
            <button className="hover:text-[#D4AF37] transition-colors">Terms</button>
            <span className="text-white/20">•</span>
            <button className="hover:text-[#D4AF37] transition-colors">Privacy</button>
            <span className="text-white/20">•</span>
            <button className="hover:text-[#D4AF37] transition-colors">Support</button>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
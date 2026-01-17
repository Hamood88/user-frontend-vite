import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';
import { SignInForm } from './SignInForm';
import { SignUpUserForm } from './SignUpUserForm';
import { SignUpShopForm } from './SignUpShopForm';
import { AuthMode } from './MoondalaAuthPage';

interface AuthFormCardProps {
  authMode: AuthMode;
  onAuthModeChange: (mode: AuthMode) => void;
  isMobile?: boolean;
}

export function AuthFormCard({ authMode, onAuthModeChange, isMobile = false }: AuthFormCardProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = (message: string) => {
    setShowSuccess(true);
    // Auto-hide success after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <motion.div
      className={`relative w-full ${isMobile ? 'max-w-full' : 'max-w-[420px]'}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Glassmorphism Card */}
      <div 
        className="relative rounded-2xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
      >
        {/* Gradient Border Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6B4CFA]/20 via-transparent to-[#32D1FF]/20 opacity-50 -z-10 blur-xl" />

        {/* Segmented Control */}
        <div className="mb-8">
          <SegmentedControl value={authMode} onChange={onAuthModeChange} />
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {authMode === 'signin' && (
            <SignInForm key="signin" onSuccess={handleSuccess} />
          )}
          {authMode === 'signup-user' && (
            <SignUpUserForm key="signup-user" onSuccess={handleSuccess} />
          )}
          {authMode === 'signup-shop' && (
            <SignUpShopForm key="signup-shop" onSuccess={handleSuccess} />
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="absolute inset-0 rounded-2xl bg-[#0B1020]/95 backdrop-blur-xl flex items-center justify-center p-8 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#6B4CFA] to-[#32D1FF] flex items-center justify-center"
                >
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">Success!</h3>
                <p className="text-white/70 text-sm">Account created — check email to verify.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

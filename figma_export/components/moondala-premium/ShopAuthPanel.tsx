import { useState } from 'react';
import { motion } from 'motion/react';
import { Store, CheckCircle, Zap, BarChart3, Sparkles } from 'lucide-react';
import { TabSwitcher } from './TabSwitcher';
import { ShopSignUpForm } from './ShopSignUpForm';
import { ShopLoginForm } from './ShopLoginForm';

interface ShopAuthPanelProps {
  inviterCode: string | null;
}

export function ShopAuthPanel({ inviterCode }: ShopAuthPanelProps) {
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('login');

  const benefits = [
    { icon: Zap, text: 'Launch mall', color: '#D4AF37' },
    { icon: BarChart3, text: 'Track earnings', color: '#6B46C1' },
    { icon: Sparkles, text: 'Reach buyers', color: '#C4A962' },
  ];

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      whileHover={{ y: -4 }}
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-[#6B46C1]/8 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Panel Card */}
      <div 
        className="relative rounded-3xl border border-white/10 p-8 backdrop-blur-xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37]/15 to-[#6B46C1]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
            <Store className="w-7 h-7 text-[#D4AF37]" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-3">
              Join as Seller
            </h2>
            <div className="flex flex-wrap gap-3">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <benefit.icon className="w-3.5 h-3.5" style={{ color: benefit.color }} />
                  <span className="text-xs text-white/70 font-medium">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'signup', label: 'Sign Up' },
            { id: 'login', label: 'Log In' },
          ]}
          accentColor="blue"
        />

        {/* Forms */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'signup' ? (
            <ShopSignUpForm inviterCode={inviterCode} />
          ) : (
            <ShopLoginForm />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
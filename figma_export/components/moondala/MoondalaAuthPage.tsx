import { useState } from 'react';
import { UserAuthPanel } from './UserAuthPanel';
import { ShopAuthPanel } from './ShopAuthPanel';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function MoondalaAuthPage() {
  return (
    <div className="h-screen bg-[#0A0E1A] overflow-hidden flex flex-col">
      {/* Top Brand Bar */}
      <motion.div 
        className="relative bg-gradient-to-r from-[#0D1226] to-[#0A0E1A] border-b border-white/5 px-8 py-5 z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] to-[#2DD4BF] blur-xl opacity-50" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2DD4BF] flex items-center justify-center shadow-2xl">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Moondala Inc.
              </h1>
              <p className="text-xs text-white/40 tracking-wide">Premium Marketplace Platform</p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="flex items-center gap-6">
            <div className="hidden xl:flex items-center gap-4 text-sm text-white/50">
              <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">Trusted by 10,000+ users</span>
              <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">5,000+ shops</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Split Panels */}
      <div className="flex-1 flex">
        {/* Left Panel - Users */}
        <div className="flex-1 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#7C3AED]/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#2DD4BF]/10 rounded-full blur-3xl" />
          </div>
          
          <UserAuthPanel />
        </div>

        {/* Center Divider */}
        <div className="w-px bg-gradient-to-b from-transparent via-white/10 to-transparent relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2DD4BF] flex items-center justify-center shadow-2xl border-4 border-[#0A0E1A]">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>

        {/* Right Panel - Shops */}
        <div className="flex-1 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#F59E0B]/15 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#EC4899]/10 rounded-full blur-3xl" />
          </div>
          
          <ShopAuthPanel />
        </div>
      </div>
    </div>
  );
}

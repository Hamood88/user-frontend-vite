import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-violet-500/30 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/moondala-logo.png" alt="Moondala" className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight">Moondala</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/login?mode=register"
              className="px-5 py-2 bg-white text-[#0F172A] hover:bg-gray-200 font-bold rounded-full transition-all text-sm"
            >
              Start Earning
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-semibold mb-6">
              🚀 The Future of Social Shopping
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Shop. Share. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Get Paid.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Don't just spend. Earn cash automatically when your friends shop. 
              The first marketplace that pays you back.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/login?mode=register"
                className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-violet-500/25 transition-all transform hover:scale-105"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-2xl border border-white/10 backdrop-blur-sm transition-all"
              >
                Log In
              </Link>
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-900/50 bg-[#1E293B]">
              <img 
                src="/images/dashboard-preview.png" 
                alt="Moondala App Interface" 
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
              />
              {/* Overlay Gradient for smooth bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-20" />
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-lg"
            >
              <span className="text-2xl">💸</span>
              <span className="ml-2 font-bold text-green-400">+$124.50</span>
              <div className="text-xs text-gray-400 mt-1">New Commission</div>
            </motion.div>
          </motion.div>
        
        </div>
      </header>

      {/* 3 Steps - Simple & Visual */}
      <section className="relative z-10 py-24 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How you build wealth</h2>
            <p className="text-gray-400">No inventory. No shipping. Just sharing.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              icon="🛍️" 
              title="Shop & Discover" 
              desc="Buy amazing products from verified shops at the best prices." 
            />
            <StepCard 
              icon="🔗" 
              title="Share Links" 
              desc="Send products to friends. When they buy, you earn." 
            />
            <StepCard 
              icon="📈" 
              title="Grow Network" 
              desc="Invite users. Earn a % of everything they buy. Forever." 
              highlight 
            />
          </div>
        </div>
      </section>

      {/* Trust / Final CTA */}
      <section className="relative z-10 py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-b from-violet-900/20 to-transparent p-12 rounded-3xl border border-violet-500/20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to launch?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join the community that's redefining e-commerce. It takes 30 seconds.
          </p>
          <Link
            to="/login?mode=register"
            className="inline-block px-10 py-5 bg-white text-[#0F172A] font-extrabold text-lg rounded-full hover:bg-gray-100 hover:scale-105 transition-all shadow-xl shadow-white/10"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 text-center text-gray-600 text-sm relative z-10">
        <p>© 2026 Moondala Inc.</p>
      </footer>
    </div>
  );
}

function StepCard({ icon, title, desc, highlight }) {
  return (
    <div className={`p-8 rounded-2xl border transition-all duration-300 hover:translate-y-[-5px]
      ${highlight 
        ? "bg-violet-600/10 border-violet-500/50 hover:border-violet-400" 
        : "bg-white/5 border-white/5 hover:border-white/20"
      }`}
    >
      <div className="text-5xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

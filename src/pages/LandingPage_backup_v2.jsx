import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-violet-500/30 overflow-x-hidden">
      {/* Background Ambience - Toned down */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-900/20 to-transparent opacity-50" />
      </div>

      {/* Navbar - Sticky & Glass */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/moondala-logo.png" alt="Moondala" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg tracking-tight">Moondala</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/login?mode=register"
              className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-full transition-all text-sm shadow-lg shadow-violet-500/20"
            >
              Start Earning
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-12 px-4 md:px-6">
        {/* HERO SECTION - Compact & Punchy */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
          
          {/* Left: Content */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-6">
              <span>🚀</span> The future of social shopping
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-white">
              Shop. Share. <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Get Paid.
              </span>
            </h1>
            
            <p className="text-lg text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Earn automatically when friends shop. The first marketplace that shares transaction value directly with you, not just ad platforms.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/login?mode=register"
                className="w-full sm:w-auto px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-xl shadow-violet-900/20 transition-all hover:translate-y-[-2px]"
              >
                Create free account
              </Link>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all"
              >
                See how it works
              </button>
            </div>
            
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Built for users + shops
              </div>
              <div>•</div>
              <div>100% Free to join</div>
              <div>•</div>
              <div>No hidden fees</div>
            </div>
          </motion.div>

          {/* Right: Glass Card Visual (Lightweight) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto lg:mr-0 max-w-[400px] w-full"
          >
             {/* Abstract Glass UI Card */}
             <div className="relative z-10 bg-[#1E293B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                {/* Header Dots */}
                <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>

                {/* Earnings Stat */}
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-1">Total Earnings</div>
                  <div className="text-4xl font-bold text-white flex items-center gap-2">
                    $1,240.50
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">+12%</span>
                  </div>
                </div>

                {/* Network Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="text-xs text-gray-400 mb-1">Network Size</div>
                    <div className="text-xl font-bold">128 Users</div>
                  </div>
                   <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="text-xs text-gray-400 mb-1">Active Shops</div>
                    <div className="text-xl font-bold">14 Stores</div>
                  </div>
                </div>

                {/* Simulated Notification */}
                <div className="mt-6 flex items-center gap-3 bg-violet-600/10 border border-violet-500/20 rounded-xl p-3">
                   <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs">🔔</div>
                   <div className="text-xs">
                      <span className="font-bold text-violet-200">New Commission!</span><br/>
                      Generic Shop sent you $12.50
                   </div>
                </div>
             </div>
             
             {/* Decorative Glow behind */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-violet-600/20 blur-[80px] -z-10 rounded-full"></div>
          </motion.div>
        
        </div>

        {/* SECTION A: How it works (The 4 Steps) */}
        <section id="how-it-works" className="max-w-6xl mx-auto py-16 border-t border-white/5">
           <div className="text-center mb-12">
             <h2 className="text-2xl font-bold mb-2">How it works</h2>
             <p className="text-gray-400">Simple steps to build your income stream</p>
           </div>
           
           <div className="grid md:grid-cols-4 gap-6">
              {[
                { title: "Join", desc: "Create your free account instantly.", icon: "✨" },
                { title: "Share Link", desc: "Share your unique code or products.", icon: "🔗" },
                { title: "Friends Shop", desc: "Your network buys things they love.", icon: "🛍️" },
                { title: "You Earn", desc: "Get automatic commissions forever.", icon: "💸" },
              ].map((step, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                  <div className="text-3xl mb-4">{step.icon}</div>
                  <h3 className="font-bold text-lg mb-2 text-white">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* SECTION B: Why Moondala (The Differentiators) */}
        <section className="max-w-6xl mx-auto py-16">
           <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Shared Value", desc: "Traditional platforms keep 100% of fees. Moondala shares them with you." },
                { title: "Trust-Based", desc: "Growth driven by friends recommending to friends, not by invading privacy." },
                { title: "Transparent", desc: "See exactly where your rewards come from in real-time." },
              ].map((item, i) => (
                <div key={i} className="border border-white/10 rounded-2xl p-8 bg-[#0F172A]">
                   <h3 className="font-bold text-lg mb-3 text-violet-300">{item.title}</h3>
                   <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* SECTION C: Side-by-Side (User & Shop) */}
        <section className="max-w-6xl mx-auto py-16 grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-violet-900/20 to-transparent border border-violet-500/20 rounded-3xl p-8 lg:p-12 relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="text-xs font-bold text-violet-400 tracking-wider uppercase mb-2">For Users</div>
                 <h3 className="text-2xl font-bold mb-4">Earn while you shop</h3>
                 <p className="text-gray-400 mb-6">Stop shopping for free. Turn your influence and network into a passive income stream.</p>
                 <Link to="/login?mode=register" className="text-white font-semibold underline underline-offset-4 decoration-violet-500 hover:decoration-white transition-all">Start as User →</Link>
               </div>
               <div className="absolute right-0 bottom-0 w-32 h-32 bg-violet-600/20 blur-[60px]"></div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-3xl p-8 lg:p-12 relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="text-xs font-bold text-indigo-400 tracking-wider uppercase mb-2">For Shops</div>
                 <h3 className="text-2xl font-bold mb-4">Grow without ads</h3>
                 <p className="text-gray-400 mb-6">Stop burning cash on ads. Let our army of users promote your products for a simple commission.</p>
                 <Link to="/login?mode=register&role=shop" className="text-white font-semibold underline underline-offset-4 decoration-indigo-500 hover:decoration-white transition-all">Open a Shop →</Link>
               </div>
               <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-600/20 blur-[60px]"></div>
            </div>
        </section>

        {/* SECTION D: Final CTA Strip */}
        <section className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Be early. Help shape the future.
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            We are building this with the community. Join the waitlist, start your network, and watch your earnings grow as Moondala expands.
          </p>
          
          <Link
            to="/login?mode=register"
            className="inline-block px-10 py-4 bg-white text-[#0F172A] font-bold text-lg rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-xl shadow-white/5"
          >
            Start Earning Now
          </Link>

          <p className="mt-6 text-xs text-gray-500 font-medium tracking-wide">
            EARLY ACCESS • NEW FEATURES WEEKLY
          </p>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-gray-600 text-xs">
        <div className="flex justify-center gap-6 mb-4">
           <Link to="/legal/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
           <Link to="/legal/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
           <Link to="/legal/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
        </div>
        <p>© {new Date().getFullYear()} Moondala Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

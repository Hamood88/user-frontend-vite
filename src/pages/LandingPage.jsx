import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Assuming framer-motion is available as per tech stack

export default function LandingPage() {
  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-violet-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Moondala Logo Placeholder */}
            <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-lg">M</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Moondala</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/login?mode=register"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-full transition-all shadow-lg shadow-violet-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px]" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight bg-gradient-to-r from-white via-violet-200 to-indigo-200 bg-clip-text text-transparent">
              Social commerce that pays <br className="hidden md:block" />
              users — not just platforms
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Earn automatically when friends shop. The first marketplace where the community owns the growth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/login"
              className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-full shadow-xl shadow-violet-500/25 transition-all w-full sm:w-auto text-center"
            >
              Join / Create account
            </Link>
            <button
              onClick={scrollToHowItWorks}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full border border-white/10 transition-all w-full sm:w-auto"
            >
              How it works
            </button>
          </motion.div>
        </div>
      </header>

      {/* Difference Section */}
      <section className="py-20 px-6 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">What makes Moondala different</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "You Earn", desc: "Get paid automatically when your network shops.", icon: "💸" },
              { title: "Fair Play", desc: "Shops keep more profit, you get lower prices.", icon: "⚖️" },
              { title: "Community First", desc: "We profit together. No gatekeepers.", icon: "🤝" },
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-colors">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Join", desc: "Create your free account in seconds." },
              { step: "02", title: "Shop & Share", desc: "Buy what you love or share products." },
              { step: "03", title: "Friends Buy", desc: "Your network shops using your links." },
              { step: "04", title: "Get Paid", desc: "Earn commissions instantly to your wallet." },
            ].map((item, i) => (
              <div key={i} className="relative p-6">
                <div className="text-6xl font-bold text-white/5 absolute -top-4 -left-2 z-0">{item.step}</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2 text-violet-300">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Shops Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-indigo-900/20 to-transparent border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Are you a Shop Owner?</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Stop paying 30% fees. Join Moondala to reach a community of motivated promoters.
          </p>
          <Link
            to="/shop/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0F172A] font-bold rounded-full hover:bg-gray-200 transition-colors"
          >
            Open Your Shop
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Moondala. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link to="/legal/guidelines" className="hover:text-white transition-colors">Guidelines</Link>
        </div>
      </footer>
    </div>
  );
}

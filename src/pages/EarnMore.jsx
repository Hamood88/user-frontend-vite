import React, { useEffect, useState, useRef, useMemo } from "react";
import { 
  Share2, Copy, Facebook, Twitter, Mail, Zap, Gift, 
  Users, MessageCircle, Send, Smartphone, Download, 
  ChevronRight, Award, TrendingUp, Sparkles, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import { getReferralNetwork } from "../api.jsx";

// Simplified API base logic
const API_BASE_URL = import.meta?.env?.VITE_API_BASE || "https://moondala-backend.onrender.com";

export default function EarnMore() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [referralCode, setReferralCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ totalInvited: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const qrRef = useRef(null);

  // Get user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("me") || localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        setMe(user);
        setReferralCode(user?.referralCode || "");
      }
    } catch (e) {
      console.error("Failed to parse user", e);
    }
  }, []);

  // Generate QR code
  useEffect(() => {
    if (referralCode) {
      const link = activeTab === "users" 
        ? `${window.location.origin}/refer/user/${referralCode}`
        : `${window.location.origin}/refer/shop/${referralCode}`;
        
      QRCode.toDataURL(link, {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCode(url))
        .catch((err) => console.error("QR Code error:", err));
    }
  }, [referralCode, activeTab]);

  // Fetch referral stats
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await getReferralNetwork();
        setStats({
          totalInvited: data.total || 0,
          totalEarned: data.totalEarned || 0,
          levels: data.levels || {},
        });
      } catch (err) {
        console.error("Failed to fetch referral stats:", err);
      } finally {
        setLoading(false);
      }
    }
    if (me) fetchStats();
  }, [me]);

  const levels = useMemo(() => {
    const obj = stats?.levels || {};
    return Object.entries(obj).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [stats]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const userReferralLink = `${window.location.origin}/refer/user/${referralCode}`;
  const shopReferralLink = `${window.location.origin}/refer/shop/${referralCode}`;

  const shareOnSocial = (platform) => {
    const isUser = activeTab === "users";
    const link = isUser ? userReferralLink : shopReferralLink;
    const desc = isUser 
      ? "Join me on Moondala and let's earn rewards together! 🚀" 
      : "Grow your business on Moondala! 📈";
    
    const message = `${desc}\n\nUse my code: ${referralCode}\n${link}`;
    
    // Updated simple share logic
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
      email: `mailto:?subject=Join Moondala!&body=${encodeURIComponent(message)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const downloadQRCode = () => {
    if (qrCode) {
      const link = document.createElement("a");
      link.href = qrCode;
      link.download = `moondala-${activeTab}-${referralCode}.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8 relative z-10">
        {/* Header Hero */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-yellow-200 font-medium text-sm">Refer & Earn Real Cash</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200 drop-shadow-sm leading-tight">
            Grow Your Empire
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Invite friends and shops to Moondala. 
            Build your network and earn passive income every time they trade.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <StatCard 
            label="Total Invited" 
            value={stats.totalInvited} 
            icon={Users} 
            color="bg-blue-500" 
            delay={0.1}
          />
          <StatCard 
            label="Total Earned" 
            value={`$${Number(stats.totalEarned || 0).toFixed(2)}`} 
            icon={Award} 
            color="bg-green-500" 
            delay={0.2}
          />
          <StatCard 
            label="Your Code" 
            value={referralCode} 
            icon={Zap} 
            color="bg-purple-500" 
            delay={0.3}
            isCode
          />
        </div>

        {/* Main Interface */}
        <div className="grid md:grid-cols-12 gap-8">
          {/* Left Column: Controls */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Tab Switcher */}
            <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/10 flex relative backdrop-blur-sm">
              <TabButton 
                isActive={activeTab === "users"} 
                onClick={() => setActiveTab("users")}
                icon={Users}
                label="Invite Users"
              />
              <TabButton 
                isActive={activeTab === "shops"} 
                onClick={() => setActiveTab("shops")}
                icon={Globe}
                label="Invite Shops"
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {activeTab === "users" ? "Invite New Users" : "Onboard Merchants"}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {activeTab === "users" 
                        ? "They get rewards, you get lifetime commissions." 
                        : "Help shops sell online and earn from their revenue."}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br shadow-inner ${activeTab === 'users' ? 'from-blue-500 to-indigo-600' : 'from-purple-500 to-pink-600'}`}>
                    {activeTab === 'users' ? <Users className="w-6 h-6 text-white" /> : <Gift className="w-6 h-6 text-white" />}
                  </div>
                </div>

                {/* Link Copy Section */}
                <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5 group relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Referral Link</span>
                    {copied && <span className="text-xs text-green-400 font-bold animate-pulse">Copied!</span>}
                  </div>
                  <div className="flex gap-3 items-center relative z-10">
                    <code className="text-slate-200 text-sm flex-1 truncate font-mono select-all p-1">
                      {activeTab === "users" ? userReferralLink : shopReferralLink}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(activeTab === "users" ? userReferralLink : shopReferralLink)}
                      className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-colors border border-white/10"
                    >
                      <Copy className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Social Grid */}
                <div>
                   <h3 className="text-sm font-semibold text-slate-400 mb-4">Share instantly via</h3>
                   <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      <SocialBtn icon={Facebook} color="bg-blue-600" onClick={() => shareOnSocial("facebook")} />
                      <SocialBtn icon={Twitter} color="bg-sky-500" onClick={() => shareOnSocial("twitter")} />
                      <SocialBtn icon={MessageCircle} color="bg-green-500" onClick={() => shareOnSocial("whatsapp")} />
                      <SocialBtn icon={Send} color="bg-cyan-500" onClick={() => shareOnSocial("telegram")} />
                      <SocialBtn icon={Mail} color="bg-rose-500" onClick={() => shareOnSocial("email")} />
                      <SocialBtn icon={Gift} color="bg-blue-700" onClick={() => shareOnSocial("linkedin")} />
                   </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: QR & Network */}
          <div className="md:col-span-5 space-y-6">
            {/* QR Card */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />
              <div className="text-center">
                <h3 className="text-slate-900 font-bold text-lg mb-4">Scan to Join</h3>
                <div className="relative mx-auto w-48 h-48 bg-gray-100 rounded-xl p-2 mb-4 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  {qrCode && <img src={qrCode} alt="QR Code" className="w-full h-full object-contain rounded-lg" />}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-lg">
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadQRCode}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Save Image
                </motion.button>
              </div>
            </div>

            {/* Network Widget */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="font-bold text-white">Your Network</h3>
              </div>
              
              <div className="space-y-4">
                {levels.length === 0 ? (
                  <div className="text-center py-8">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                       <Users className="w-6 h-6 text-slate-500" />
                     </div>
                     <p className="text-slate-500 text-sm">No referrals yet.<br/>Start inviting!</p>
                  </div>
                ) : (
                  levels.map(([lvl, count]) => (
                    <NetworkLevelRow key={lvl} level={lvl} count={count} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

function StatCard({ label, value, icon: Icon, color, delay, isCode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-800/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors hover:bg-slate-800/60"
    >
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon className="w-16 h-16" />
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg shadow-black/20`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">{label}</p>
          <p className={`text-2xl font-bold ${isCode ? 'font-mono tracking-wider text-purple-200' : 'text-white'}`}>
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ isActive, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors z-10 ${
        isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="tab-bg"
          className="absolute inset-0 bg-slate-700 rounded-xl shadow-lg z-[-1]"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function SocialBtn({ icon: Icon, color, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`${color} hover:brightness-110 h-10 w-full rounded-lg flex items-center justify-center text-white transition-all shadow-lg shadow-black/20`}
    >
      <Icon className="w-5 h-5" />
    </motion.button>
  );
}

function NetworkLevelRow({ level, count }) {
  // Assuming a max visual cap of 50 users per level for the bar
  const max = 50; 
  const percent = Math.min(100, (count / max) * 100);
  
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">Level {level}</span>
        <span className="text-sm font-bold text-white">{count}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 relative"
        >
             <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>
    </div>
  );
}

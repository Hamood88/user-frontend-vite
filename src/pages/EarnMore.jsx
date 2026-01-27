import React, { useEffect, useState, useRef, useMemo } from "react";
import { 
  Share2, Copy, Facebook, Twitter, Mail, Zap, Gift, 
  Users, MessageCircle, Send, Smartphone, Download, 
  ChevronRight, Award, TrendingUp, Sparkles, Globe, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import { getReferralNetwork } from "../api.jsx";


// Custom Brand Icons
const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const TelegramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0011.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.791 1.657-2.791 3.568v1.23h4.197l-1.029 3.667h-3.168v7.98H9.101Z" />
  </svg>
);

const LinkedInIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const DownloadIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);

const CopyIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);


export default function EarnMore() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [referralCode, setReferralCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ totalInvited: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [customMessage, setCustomMessage] = useState("");
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

  // Update default message when tab changes
  useEffect(() => {
    const isUser = activeTab === "users";
    const defaultMsg = isUser 
      ? "Join me on Moondala and let's earn rewards together! 🚀" 
      : "Grow your business on Moondala! 📈";
    setCustomMessage(defaultMsg);
  }, [activeTab]);

  // Generate QR code
  useEffect(() => {
    if (referralCode) {
      const link = activeTab === "users" 
        ? `${window.location.origin}/r/${referralCode}`
        : `${window.location.origin}/b/${referralCode}`;
        
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

  const allLevels = useMemo(() => {
    const obj = stats?.levels || {};
    return [1, 2, 3, 4, 5].map(lvl => ({
      level: lvl,
      count: obj[lvl] || 0
    }));
  }, [stats]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Short referral links
  const userReferralLink = `${window.location.origin}/r/${referralCode}`;
  const shopReferralLink = `${window.location.origin}/b/${referralCode}`;

  const shareOnSocial = (platform) => {
    const isUser = activeTab === "users";
    const link = isUser ? userReferralLink : shopReferralLink;
    
    // Use custom message if available, otherwise fallback (though customMessage should always be set)
    // Removed explicit code from message as requested, link already has it
    const finalMessage = `${customMessage}\n\n${link}`;
    
    // Updated simple share logic
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(finalMessage)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(finalMessage)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(finalMessage)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
      email: `mailto:?subject=Join Moondala!&body=${encodeURIComponent(finalMessage)}`,
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
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden relative">
      {/* Background Ambience - Lighter in light mode */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 dark:bg-purple-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 dark:bg-blue-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8 relative z-10">
        {/* Header Hero */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2" />
            <span className="text-yellow-700 dark:text-yellow-200 font-medium text-sm">Refer & Earn Real Cash</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-foreground drop-shadow-sm leading-tight">
            Grow Your Empire
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Invite friends and shops to Moondala. 
            Build your network and earn passive income every time they trade.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          <StatCard 
            label="Total Invited" 
            value={stats.totalInvited} 
            icon={Users} 
            color="bg-gradient-to-br from-blue-600 to-cyan-400 text-white" 
            delay={0.1}
          />
          <StatCard 
            label="Total Earned" 
            value={`$${Number(stats.totalEarned || 0).toFixed(2)}`} 
            icon={Award} 
            color="bg-gradient-to-br from-emerald-500 to-lime-500 text-white" 
            delay={0.2}
          />
          <StatCard 
            label="Your Code" 
            value={referralCode} 
            icon={Zap} 
            color="bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white" 
            delay={0.3}
            isCode
          />
        </div>

        {/* Network Graph Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12 md:mb-24 bg-card/60 rounded-3xl md:rounded-[3rem] p-4 md:p-12 border border-border backdrop-blur-md"
        >
          {/* Network Visual Card */}
          <div className="bg-card border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group w-full max-w-md">
             <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-bold text-card-foreground text-xl">Your Network</h3>
              </div>
              
              <div className="space-y-6">
                {allLevels.map(({ level, count }) => (
                  <NetworkLevelRow key={level} level={level} count={count} />
                ))}
              </div>

              {/* Decorative accent */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-colors" />
          </div>
        </motion.div>

        {/* Main Interface */}
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Top Section: Tab Switcher & Invite Card */}
          <div className="space-y-6">
            
            {/* Tab Switcher */}
            <div className="bg-muted p-1.5 rounded-2xl border border-border flex relative backdrop-blur-sm">
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
                className="bg-card rounded-3xl p-6 border border-border shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-br shadow-inner ${activeTab === 'users' ? 'from-blue-500 to-indigo-600' : 'from-purple-500 to-pink-600'}`}>
                      {activeTab === 'users' ? <Users className="w-5 h-5 text-white" /> : <Gift className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-card-foreground leading-none mb-1">
                        {activeTab === "users" ? "Invite New Users" : "Onboard Merchants"}
                      </h2>
                      <p className="text-muted-foreground text-xs text-balance">
                        {activeTab === "users" 
                          ? "Earn lifetime commissions." 
                          : "Earn from their revenue."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Link Copy Section - Compact */}
                <div className="bg-muted/50 rounded-xl p-3 mb-4 border border-border relative overflow-hidden flex items-center gap-3">
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Referral Link</p>
                      <code className="text-foreground text-sm block truncate font-mono select-all">
                        {activeTab === "users" ? userReferralLink : shopReferralLink}
                      </code>
                   </div>
                   <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(activeTab === "users" ? userReferralLink : shopReferralLink)}
                      className="bg-background hover:bg-muted p-2.5 rounded-lg text-foreground transition-colors border border-border flex-shrink-0"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                   </motion.button>
                </div>

                {/* Message Editor */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Customize Message</h3>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full bg-input border border-input rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-ring resize-none placeholder:text-muted-foreground"
                    rows={2}
                    placeholder="Write a message to share..."
                  />
                </div>

                {/* Social Grid - Compact */}
                <div>
                   <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Share instantly</h3>
                   <div className="flex gap-2 justify-between">
                      <SocialBtn icon={FacebookIcon} color="bg-[#1877F2]" onClick={() => shareOnSocial("facebook")} compact />
                      <SocialBtn icon={XIcon} color="bg-black text-white dark:bg-black dark:border-white/20 border-border" onClick={() => shareOnSocial("twitter")} compact />
                      <SocialBtn icon={WhatsAppIcon} color="bg-[#25D366]" onClick={() => shareOnSocial("whatsapp")} compact />
                      <SocialBtn icon={TelegramIcon} color="bg-[#229ED9]" onClick={() => shareOnSocial("telegram")} compact />
                      <SocialBtn icon={Mail} color="bg-rose-500" onClick={() => shareOnSocial("email")} compact />
                   </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Section: QR & Onboarding (Now Stacked Below) */}
          <div className="space-y-6">
            {/* QR Card - Compact */}
            <div className="bg-card rounded-3xl p-6 shadow-xl border border-border relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
              <div className="text-center flex flex-col items-center">
                <div className="mb-4">
                  <h3 className="text-card-foreground font-black text-xl tracking-tight">Personal QR Code</h3>
                  <p className="text-muted-foreground text-xs">Scan to join your network</p>
                </div>

                <div className="w-48 h-48 bg-white rounded-xl p-3 mb-4 shadow-inner border border-gray-100">
                  {qrCode && <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadQRCode}
                  className="w-full max-w-xs py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md text-sm"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Save to Gallery
                </motion.button>
              </div>
            </div>

            {/* Quick Tips - Compact */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    Pro Tip
                 </h4>
                 <p className="text-indigo-100 text-sm leading-snug mb-3">
                   Shops generate higher commissions. Focus on local merchants to grow faster!
                 </p>
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
      className="bg-card/50 backdrop-blur-md border border-border p-5 rounded-2xl relative overflow-hidden group hover:border-border/80 transition-colors hover:bg-card/70"
    >
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon className="w-16 h-16 text-foreground" />
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg shadow-black/20`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-0.5">{label}</p>
          <p className={`text-2xl font-bold ${isCode ? 'font-mono tracking-wider text-purple-600 dark:text-purple-300' : 'text-foreground'}`}>
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
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="tab-bg"
          className="absolute inset-0 bg-background rounded-xl shadow-sm border border-border z-[-1]"
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
      className={`${color} hover:brightness-110 h-10 w-full rounded-lg flex items-center justify-center text-white transition-all shadow-sm`}
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
        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Level {level}</span>
        <span className="text-sm font-bold text-foreground">{count}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
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

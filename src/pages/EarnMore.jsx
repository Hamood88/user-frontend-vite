import React, { useEffect, useState, useRef } from "react";
import { Share2, Copy, Facebook, Twitter, Mail, Zap, Gift, Users as UsersIcon } from "lucide-react";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import { getReferralNetwork } from "../api.jsx";

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
      const userSignupUrl = `${window.location.origin}/refer/user/${referralCode}`;
      QRCode.toDataURL(userSignupUrl, {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCode(url))
        .catch((err) => console.error("QR Code error:", err));
    }
  }, [referralCode]);

  // Fetch referral stats
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await getReferralNetwork();
        setStats({
          totalInvited: data.total || 0,
          totalEarned: data.totalEarned || 0,
        });
      } catch (err) {
        console.error("Failed to fetch referral stats:", err);
      } finally {
        setLoading(false);
      }
    }
    if (me) fetchStats();
  }, [me]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const userReferralLink = `${window.location.origin}/refer/user/${referralCode}`;
  const shopReferralLink = `${window.location.origin}/refer/shop/${referralCode}`;

  const shareOnSocial = (platform) => {
    const message = activeTab === "users"
      ? `Join me on Moondala! Use my referral code ${referralCode} to earn rewards 🎁`
      : `Join my shop on Moondala! Use my referral code ${referralCode} 🏪`;
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${userReferralLink}&quote=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${userReferralLink}`,
      email: `mailto:?subject=Join Moondala&body=${encodeURIComponent(message + " " + userReferralLink)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      const link = document.createElement("a");
      link.href = qrCode;
      link.download = `moondala-referral-${referralCode}.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold">Earn More</h1>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-gray-300 text-lg">Share your referral code and start earning rewards!</p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
              <p className="text-gray-300 text-sm mb-2">People Invited</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.totalInvited}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
              <p className="text-gray-300 text-sm mb-2">Total Earned</p>
              <p className="text-3xl font-bold text-green-400">${Number(stats.totalEarned || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20 col-span-2 md:col-span-1">
              <p className="text-gray-300 text-sm mb-2">Your Referral Code</p>
              <p className="text-2xl font-bold text-purple-400 font-mono">{referralCode}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 bg-white/5 backdrop-blur p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "users"
                ? "bg-gradient-to-r from-yellow-400 to-purple-500 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            <UsersIcon className="w-5 h-5" />
            Invite Users
          </button>
          <button
            onClick={() => setActiveTab("shops")}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "shops"
                ? "bg-gradient-to-r from-yellow-400 to-purple-500 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            <Gift className="w-5 h-5" />
            Invite Shops
          </button>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-purple-950/60 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-purple-700/30 p-8 mb-8">
          {activeTab === "users" ? (
            <div className="space-y-8">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Invite Users to Moondala</h2>
                <p className="text-gray-300">
                  Share your referral code with friends and family. They'll earn rewards, and so will you!
                </p>
              </div>

              {/* QR Code Section */}
              <div className="bg-white/5 backdrop-blur rounded-lg p-8 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Scan or Share QR Code</h3>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 flex justify-center">
                    {qrCode && (
                      <img
                        ref={qrRef}
                        src={qrCode}
                        alt="QR Code"
                        className="w-48 h-48 rounded-lg border-4 border-white/20 bg-white p-2"
                      />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-gray-300">Your unique QR code points to:</p>
                    <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                      <p className="text-sm text-gray-300 break-all font-mono">{userReferralLink}</p>
                    </div>
                    <button
                      onClick={downloadQRCode}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                    >
                      📥 Download QR Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Referral Code */}
              <div className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Referral Code</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 bg-black/30 border border-white/20 text-white rounded-lg px-4 py-3 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(referralCode)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Copy className="w-5 h-5" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Social Share */}
              <div className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Share on Social Media</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => shareOnSocial("facebook")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Facebook className="w-5 h-5" />
                    <span className="hidden sm:inline">Facebook</span>
                  </button>
                  <button
                    onClick={() => shareOnSocial("twitter")}
                    className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Twitter className="w-5 h-5" />
                    <span className="hidden sm:inline">Twitter</span>
                  </button>
                  <button
                    onClick={() => shareOnSocial("email")}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="hidden sm:inline">Email</span>
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Direct Signup Link</h3>
                <div className="bg-black/30 rounded-lg p-4 border border-white/10 mb-4">
                  <p className="text-sm text-gray-300 break-all font-mono">{userReferralLink}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(userReferralLink)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  Copy Link
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Invite Shop Owners to Moondala</h2>
                <p className="text-gray-300">
                  Help shop owners grow their business on Moondala. Earn commission on their transactions!
                </p>
              </div>

              {/* QR Code Section */}
              <div className="bg-white/5 backdrop-blur rounded-lg p-8 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Share Shop QR Code</h3>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 flex justify-center">
                    {qrCode && (
                      <img
                        ref={qrRef}
                        src={qrCode}
                        alt="QR Code"
                        className="w-48 h-48 rounded-lg border-4 border-white/20 bg-white p-2"
                      />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-gray-300">Your unique QR code points to:</p>
                    <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                      <p className="text-sm text-gray-300 break-all font-mono">{shopReferralLink}</p>
                    </div>
                    <button
                      onClick={downloadQRCode}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                    >
                      📥 Download QR Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Referral Code */}
              <div className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Referral Code</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 bg-black/30 border border-white/20 text-white rounded-lg px-4 py-3 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(referralCode)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Copy className="w-5 h-5" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Social Share */}
              <div className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Share on Social Media</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => shareOnSocial("facebook")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Facebook className="w-5 h-5" />
                    <span className="hidden sm:inline">Facebook</span>
                  </button>
                  <button
                    onClick={() => shareOnSocial("twitter")}
                    className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Twitter className="w-5 h-5" />
                    <span className="hidden sm:inline">Twitter</span>
                  </button>
                  <button
                    onClick={() => shareOnSocial("email")}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="hidden sm:inline">Email</span>
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Shop Signup Link</h3>
                <div className="bg-black/30 rounded-lg p-4 border border-white/10 mb-4">
                  <p className="text-sm text-gray-300 break-all font-mono">{shopReferralLink}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(shopReferralLink)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

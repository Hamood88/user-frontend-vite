import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, TrendingUp, HelpCircle, X } from "lucide-react";
import { toAbsUrl, apiGet } from "../api";

export default function TopInvitersList({ 
  limit = 5, 
  title = "Top Inviters",
  compact = false 
}) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    console.log("TopInvitersList v3.0 mounting - Enhanced debugging");
    
    async function loadInviters() {
      try {
        // Direct API call to avoid import bundling issues with getTopInviters
        const data = await apiGet(`/api/users/top-inviters?limit=${limit}`);
        console.log("Top Inviters API Response:", data);
        
        const result = Array.isArray(data?.topInviters) ? data.topInviters : Array.isArray(data) ? data : [];
        console.log(`Top Inviters count: ${result.length}`, result);
        
        if (mounted) {
          setList(result);
          setLoading(false);
        }
      } catch (err) {
        console.error('TopInvitersList error:', err);
        if (mounted) setLoading(false);
      }
    }
    
    loadInviters();
    return () => { mounted = false; };
  }, [limit]);

  return (
    <>
      <div className={`glass-card rounded-2xl ${compact ? "p-4" : "p-5"}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-display font-bold text-foreground flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
            <Users className={compact ? "w-4 h-4" : "w-5 h-5"} />
            {title}
          </h2>
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-1.5 rounded-full hover:bg-muted/60 transition-colors group"
            title="How to become a top inviter"
          >
            <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      
        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading leaderboard...</div>
        ) : list.length === 0 ? (
          <div className="text-sm text-muted-foreground">No top inviters yet.</div>
        ) : (
          <div className="space-y-3">
            {list.map((inviter, index) => (
              <Link
                to={`/feed/user/${inviter._id}`}
                key={inviter._id}
                className={`flex items-center gap-3 rounded-xl bg-muted/40 hover:bg-muted/80 ring-1 ring-border/10 transition-all cursor-pointer group ${compact ? "p-2" : "p-3"}`}
              >
                <div className="relative">
                  <div className={`rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden group-hover:opacity-80 transition-opacity ${compact ? "w-10 h-10" : "w-12 h-12"}`}>
                    {inviter.avatarUrl ? (
                      <img
                        src={toAbsUrl(inviter.avatarUrl)}
                        alt={inviter.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className={`font-bold text-primary ${compact ? "text-sm" : "text-lg"}`}>
                        {(inviter.displayName || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-black border-2 border-background">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-foreground truncate group-hover:underline ${compact ? "text-sm" : "text-base"}`}>
                    {inviter.displayName}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {inviter.totalReferrals} REFERRALS
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted/60 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">How to Become a Top Inviter</h3>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="leading-relaxed">
                Join the leaderboard by inviting friends and shops to Moondala! 
                The more people you invite, the higher you rank.
              </p>

              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Get Your Referral Link</p>
                    <p className="text-xs">Visit the <Link to="/earn-more" className="text-primary hover:underline font-medium">Earn More</Link> page to find your unique referral link.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Share Your Link</p>
                    <p className="text-xs">Share via social media, QR code, or direct messaging. You can invite both users and shops!</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Watch Your Rank Rise</p>
                    <p className="text-xs">Every successful referral counts! Plus, you earn commission on their purchases.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/earn-more"
                onClick={() => setShowInfoModal(false)}
                className="block w-full text-center py-3 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Go to Earn More Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

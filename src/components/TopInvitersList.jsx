import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, TrendingUp } from "lucide-react";
import { getTopInviters, toAbsUrl } from "../api";

export default function TopInvitersList({ 
  limit = 5, 
  title = "Top Inviters",
  compact = false 
}) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getTopInviters(limit).then((data) => {
      if (mounted) {
        setList(data || []);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [limit]);

  return (
    <div className={`glass-card rounded-2xl ${compact ? "p-4" : "p-5"}`}>
      <h2 className={`font-display font-bold text-white flex items-center gap-2 ${compact ? "text-base mb-3" : "text-lg mb-4"}`}>
        <Users className={compact ? "w-4 h-4" : "w-5 h-5"} />
        {title}
      </h2>
      
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
              className={`flex items-center gap-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group ${compact ? "p-2" : "p-3"}`}
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
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-black border border-[#0f172a]">
                  {index + 1}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-white truncate group-hover:underline ${compact ? "text-sm" : "text-base"}`}>
                  {inviter.displayName}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {inviter.totalReferrals} REFERRALS
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

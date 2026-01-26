import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Wallet,
  Copy,
  Check,
} from "lucide-react";

import { apiGet, getMe, getMyFriends, pickId } from "../api.jsx";
import TopInvitersList from "../components/TopInvitersList";
import "../styles/dashboardModern.css";

/* =========================
   Helpers
   ========================= */
function formatMoney(n, currency = "USD") {
  const x = Number(n || 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(x) ? x : 0);
  } catch {
    return `$${(Number.isFinite(x) ? x : 0).toFixed(2)}`;
  }
}

function safeDate(d) {
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "";
  return t.toLocaleDateString();
}

function s(v) {
  return String(v || "").trim();
}

function sumObjValues(obj) {
  if (!obj || typeof obj !== "object") return 0;
  return Object.values(obj).reduce((a, b) => a + Number(b || 0), 0);
}

/**
 * Attempt to fetch earnings/commissions from any common endpoint.
 * This makes the dashboard work even if your backend route name differs.
 */
async function fetchEarningsFlexible() {
  const tries = [
    "/api/earnings/me",
    "/api/earnings/mine",
    "/api/earnings",
    "/api/commissions/me",
    "/api/commissions/mine",
    "/api/commissions/earnings",
  ];

  let lastErr = null;
  for (const p of tries) {
    try {
      const d = await apiGet(p);
      return d;
    } catch (e) {
      lastErr = e;
      if (e?.status === 404) continue;
      throw e;
    }
  }
  throw new Error(lastErr?.message || "Earnings endpoint not found on backend.");
}

/**
 * Normalize whatever the backend returns into:
 * {
 *   currency, total, totals:{available,pending}, levels:{1:0..}, items:[...]
 * }
 */
function normalizeEarnings(raw) {
  // common shapes:
  // { totals:{...}, items:[...], levels:{...} }
  // { earnings:{...} }
  // { commissions:[...], totals:{...} }
  const data = raw?.earnings || raw?.data || raw || {};

  const currency =
    s(data?.currency) ||
    s(raw?.currency) ||
    "USD";

  const totals =
    data?.totals && typeof data.totals === "object"
      ? data.totals
      : {
          available: Number(data?.available ?? data?.availableBalance ?? 0),
          pending: Number(data?.pending ?? data?.pendingBalance ?? 0),
        };

  const items =
    Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.commissions)
      ? data.commissions
      : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw?.commissions)
      ? raw.commissions
      : [];

  const levels =
    data?.levels && typeof data.levels === "object"
      ? data.levels
      : raw?.levels && typeof raw.levels === "object"
      ? raw.levels
      : {}; // if you don't have levels yet, it will stay empty

  const total =
    Number(data?.total ?? raw?.total ?? 0) ||
    Number(totals?.available || 0) + Number(totals?.pending || 0);

  return {
    currency,
    total: Number(total || 0),
    totals: {
      available: Number(totals?.available || 0),
      pending: Number(totals?.pending || 0),
    },
    levels,
    items,
  };
}

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(null);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // network size fallback (if backend doesn't return levels yet)
  const [networkSize, setNetworkSize] = useState(0);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const [meRes, earnRaw] = await Promise.all([
          getMe(), // /api/auth/me
          fetchEarningsFlexible(),
        ]);

        const me = meRes?.user || meRes?.me || meRes || null;
        const normalized = normalizeEarnings(earnRaw);

        if (!alive) return;
        setUser(me);
        setEarnings(normalized);

        // If levels missing, compute network size from friends endpoint as a simple fallback
        if (!normalized.levels || Object.keys(normalized.levels).length === 0) {
          try {
            const fr = await getMyFriends();
            const list =
              fr?.accepted ||
              fr?.acceptedFriends ||
              (Array.isArray(fr?.friends) ? fr.friends : []) ||
              [];
            const unwrap = (x) => x?.user || x?.fromUser || x?.toUser || x;
            const acceptedUsers = (Array.isArray(list) ? list : [])
              .map(unwrap)
              .filter(Boolean);
            if (!alive) return;
            setNetworkSize(acceptedUsers.length);
          } catch {
            setNetworkSize(0);
          }
        } else {
          setNetworkSize(sumObjValues(normalized.levels));
        }
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load dashboard.");
        setUser(null);
        setEarnings(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const referralCode = useMemo(() => {
    return (
      s(user?.referralCode) ||
      s(user?.refCode) ||
      s(user?.myReferralCode) ||
      s(user?.code) ||
      ""
    );
  }, [user]);

  const money = useMemo(() => {
    const cur = earnings?.currency || "USD";
    return {
      total: formatMoney(earnings?.total || 0, cur),
      available: formatMoney(earnings?.totals?.available || 0, cur),
      pending: formatMoney(earnings?.totals?.pending || 0, cur),
    };
  }, [earnings]);

  const levels = useMemo(() => {
    const obj = earnings?.levels || {};
    // sort levels 1..n
    const entries = Object.entries(obj).sort(
      (a, b) => Number(a[0]) - Number(b[0])
    );
    return entries;
  }, [earnings]);

  const items = useMemo(() => {
    const arr = Array.isArray(earnings?.items) ? earnings.items : [];
    // newest first
    const sorted = [...arr].sort((a, b) => {
      const ta = new Date(a?.createdAt || a?.date || 0).getTime();
      const tb = new Date(b?.createdAt || b?.date || 0).getTime();
      return tb - ta;
    });
    // Show 0 by default, 5 if expanded
    return showAllTransactions ? sorted.slice(0, 5) : [];
  }, [earnings, showAllTransactions]);

  // Preview: show last transaction when collapsed if there are any
  const previewTransaction = useMemo(() => {
    if (showAllTransactions || items.length > 0) return null;
    const arr = Array.isArray(earnings?.items) ? earnings.items : [];
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => {
      const ta = new Date(a?.createdAt || a?.date || 0).getTime();
      const tb = new Date(b?.createdAt || b?.date || 0).getTime();
      return tb - ta;
    });
    return sorted[0] || null;
  }, [earnings, showAllTransactions, items.length]);

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse text-muted-foreground">
        Loading dashboard data...
      </div>
    );
  }

  if (err) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="text-foreground font-bold mb-2">Dashboard error</div>
        <div className="text-muted-foreground">{err}</div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-border text-muted-foreground">
        No earnings data yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Welcome back,
          </h1>
          <p className="text-muted-foreground">
            Track your commissions and network growth.
          </p>
        </div>

        {referralCode ? (
          <div className="glass-card px-4 py-2 rounded-full flex items-center gap-3 border-primary/20 bg-primary/5">
            <span className="text-sm font-medium text-primary">Share Link</span>
            <code className="font-mono font-bold text-foreground">{referralCode}</code>
            <button
              onClick={copyCode}
              className="text-muted-foreground hover:text-foreground transition-colors"
              type="button"
              title="Copy"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : null}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Earnings" value={money.total} icon={DollarSign} trend="+"
          color="violet"
        />
        <KpiCard
          title="Available"
          value={money.available}
          icon={Wallet}
          subValue="Ready to withdraw"
          color="emerald"
        />
        <KpiCard
          title="Pending"
          value={money.pending}
          icon={TrendingUp}
          subValue="Clears after hold period"
          color="amber"
        />
        <KpiCard
          title="Network Size"
          value={Number(networkSize || 0)}
          icon={ArrowUpRight}
          subValue="Active members"
          color="cyan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-foreground">
              Recent Activity
            </h2>
            <button
              type="button"
              onClick={() => setShowAllTransactions(!showAllTransactions)}
              className="md-btn md-btn-ghost text-sm"
            >
              {showAllTransactions ? "Hide" : "Show"}
            </button>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6">Description</div>
              <div className="col-span-3 text-right">Date</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>

            <div className="divide-y divide-border">
              {items.length === 0 && !previewTransaction ? (
                <div className="p-6 text-muted-foreground">No transactions yet.</div>
              ) : items.length === 0 && previewTransaction ? (
                // Show preview of last transaction when collapsed
                <TransactionRow it={previewTransaction} earnings={earnings} />
              ) : (
                items.map((it, idx) => (
                  <TransactionRow key={it._id || idx} it={it} earnings={earnings} />
                ))

              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <TopInvitersList limit={5} compact={true} title="Top Inviters" />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, subValue, trend, color = "violet" }) {
  const colors = {
    violet: "from-violet-500 to-purple-600",
    emerald: "from-emerald-400 to-teal-500",
    amber: "from-amber-400 to-orange-500",
    cyan: "from-cyan-400 to-blue-500",
  };

  // Cleaner look: White/Dark card background with colored border and shadow
  const themeClasses = {
    violet: "bg-card border-violet-500/30 shadow-sm hover:shadow-violet-500/10",
    emerald: "bg-card border-emerald-500/30 shadow-sm hover:shadow-emerald-500/10",
    amber: "bg-card border-amber-500/30 shadow-sm hover:shadow-amber-500/10",
    cyan: "bg-card border-cyan-500/30 shadow-sm hover:shadow-cyan-500/10",
  };

  const isNumber = typeof value === "number";
  const display = isNumber ? String(value) : value;

  return (
    <div
      className={`rounded-2xl p-6 border backdrop-blur-md relative overflow-hidden group transition-all duration-300 ${themeClasses[color]}`}
    >
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${colors[color]} opacity-10 group-hover:opacity-20 transition-opacity blur-2xl`}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground transition-colors group-hover:bg-secondary">
            <Icon className="w-5 h-5" />
          </div>
          {trend ? (
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {trend}
            </span>
          ) : null}
        </div>

        <div className="text-muted-foreground text-sm font-semibold mb-1 tracking-wide">
          {title}
        </div>
        <div className="text-3xl font-bold text-foreground tracking-tight">
          {display}
        </div>
        {subValue ? (
          <div className="text-xs text-muted-foreground mt-2 font-medium">{subValue}</div>
        ) : null}
      </div>
    </div>
  );
}

function TransactionRow({ it, earnings }) {
  const id = s(it?._id || it?.id || "preview");
  const status = s(it?.status || it?.state || "PENDING").toUpperCase();
  const label =
    s(it?.label) ||
    s(it?.title) ||
    s(it?.description) ||
    "Commission";

  const amount = Number(it?.amount ?? it?.value ?? 0);
  const createdAt = it?.createdAt || it?.date || it?.created || null;

  const isReleased = status.includes("RELEASE") || status.includes("AVAILABLE") || status === "PAID";
  const isLocked = status.includes("LOCK") || status.includes("PENDING") || status.includes("HOLD");

  return (
    <div
      key={id}
      className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors"
    >
      <div className="col-span-6 flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center
          ${
            isReleased
              ? "bg-emerald-500/10 text-emerald-400"
              : isLocked
              ? "bg-amber-500/10 text-amber-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {isReleased ? (
            <ArrowDownLeft className="w-4 h-4" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
        </div>
        <div>
          <div className="font-medium text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{status}</div>
        </div>
      </div>

      <div className="col-span-3 text-right text-sm text-muted-foreground">
        {safeDate(createdAt) || "-"}
      </div>

      <div className="col-span-3 text-right font-medium font-mono text-foreground">
        {formatMoney(amount, earnings.currency || "USD")}
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  MessageCircle,
  MoreHorizontal,
  Check,
  X,
  Eye,
} from "lucide-react";

import {
  apiGet,
  sendFriendRequest,
  getFriendRequests,
  respondFriendRequest,
  getFollowedShops,
} from "../api.jsx";

import "../styles/friendsModern.css";

/* ========= helpers ========= */
function s(v) {
  return String(v || "").trim();
}
function pickId(x) {
  return s(x?._id || x?.id || x?.userId || x?.entityId);
}
function displayName(u) {
  if (!u) return "User";
  const dn = s(u.displayName);
  if (dn) return dn;
  const fn = s(u.firstName);
  const ln = s(u.lastName);
  const nm = `${fn} ${ln}`.trim();
  return nm || s(u.name) || "User";
}
function avatarUrl(u) {
  const a = s(u?.avatarUrl || u?.avatar || u?.photoUrl || u?.profilePic);
  return a || "";
}

export default function Friends() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // all | requests | suggestions | shops

  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [suggestions, setSuggestions] = useState([]); // optional if backend supports
  const [shops, setShops] = useState([]); // followed shops

  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  async function loadAll() {
    setLoading(true);
    setMsg("");
    try {
      // ✅ Accepted friends list (your backend)
      const mine = await apiGet("/api/friends/mine");
      const accepted =
        mine?.accepted ||
        mine?.acceptedFriends ||
        (Array.isArray(mine?.friends)
          ? mine.friends.filter((x) => x?.relation === "accepted")
          : []) ||
        [];

      const unwrap = (x) => x?.user || x?.fromUser || x?.toUser || x;
      const acceptedUsers = (Array.isArray(accepted) ? accepted : [])
        .map(unwrap)
        .filter(Boolean);

      setFriends(acceptedUsers);

      // ✅ Incoming requests
      const req = await getFriendRequests();
      setIncoming(Array.isArray(req?.incoming) ? req.incoming : []);

      // ✅ Suggestions (optional)
      // If you don't have this endpoint, it will safely fail.
      try {
        const sug = await apiGet("/api/friends/suggestions");
        const list = Array.isArray(sug?.users) ? sug.users : Array.isArray(sug) ? sug : [];
        setSuggestions(list);
      } catch {
        setSuggestions([]);
      }

      // ✅ Followed shops
      try {
        console.log("🔵 Fetching followed shops...");
        const shopList = await getFollowedShops();
        console.log("✅ Received followed shops:", shopList);
        setShops(Array.isArray(shopList) ? shopList : []);
      } catch (err) {
        console.error("❌ Failed to fetch followed shops:", err);
        setShops([]);
      }
    } catch (e) {
      setMsg(e?.message || "Failed to load friends.");
      setFriends([]);
      setIncoming([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    const query = s(q).toLowerCase();
    const list =
      tab === "requests"
        ? incoming.map((r) => r?.fromUser || r?.from || r?.sender || r).filter(Boolean)
        : tab === "suggestions"
        ? suggestions
        : tab === "shops"
        ? shops
        : friends;

    if (!query) return list;

    return (Array.isArray(list) ? list : []).filter((u) => {
      const name = displayName(u).toLowerCase();
      const email = s(u?.email).toLowerCase();
      const handle = s(u?.handle || u?.username).toLowerCase();
      return name.includes(query) || email.includes(query) || handle.includes(query);
    });
  }, [q, tab, friends, incoming, suggestions]);

  async function onInvite(userId) {
    const id = s(userId);
    if (!id) return;
    try {
      setBusy(true);
      setMsg("");
      await sendFriendRequest(id, "Let’s connect on Moondala 🤝");
      setMsg("✅ Friend request sent!");
      await loadAll();
    } catch (e) {
      setMsg(e?.message || "Failed to send request.");
    } finally {
      setBusy(false);
    }
  }

  async function onRespond(requestId, action) {
    const rid = s(requestId);
    if (!rid) return;
    const act = action === "accept" ? "accept" : "decline";

    try {
      setBusy(true);
      setMsg("");
      await respondFriendRequest(rid, act);
      setMsg(act === "accept" ? "✅ Request accepted!" : "✅ Request declined.");
      await loadAll();
    } catch (e) {
      setMsg(e?.message || "Failed to respond.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Community
          </h1>
          <p className="text-muted-foreground">
            Connect with other moon walkers.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Find people..."
              className="md-input"
            />
          </div>

          <button
            type="button"
            className="md-btn md-btn-primary"
            onClick={() => nav("/feed/friends")}
            title="Open Friends list"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/5">
        {[
          { id: "all", label: `All Friends (${friends.length})` },
          { id: "requests", label: `Requests (${incoming.length})` },
          { id: "suggestions", label: `Suggestions (${suggestions.length})` },
          { id: "shops", label: `Shops (${shops.length})` },
        ].map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 text-sm font-medium transition-all relative ${
                isActive ? "text-white" : "text-muted-foreground hover:text-white"
              }`}
              type="button"
            >
              {t.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_hsl(265_89%_66%)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {msg ? <div className="md-info">{msg}</div> : null}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card h-48 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-6 rounded-2xl text-muted-foreground">
          Nothing here yet.
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((u, idx) => {
            const id = pickId(u);
            
            // Check if this is a shop or user
            const isShop = tab === "shops";
            
            if (isShop) {
              // Shop card
              const shopName = u?.shopName || u?.name || "Shop";
              const shopLogo = s(u?.logoUrl || u?.logo || "");
              
              return (
                <motion.div
                  key={`shop-${id || shopName}-${idx}`}
                  variants={item}
                  className="glass-card p-4 rounded-xl group relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => nav(`/shop/${id}/feed`)}
                >
                  <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                  <div className="relative flex flex-col items-center text-center">
                    <div className="md-avatarRingSmall">
                      {shopLogo ? (
                        <img
                          src={shopLogo}
                          alt={shopName}
                          className="md-avatarImg object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <div className="md-avatarFallback">
                          {shopName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-white mb-0.5">{shopName}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                      {u?.bio || "Visit our shop"}
                    </p>

                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        className="md-btn md-btn-primary flex-1 text-xs py-2 h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          nav(`/shop/${id}/feed`);
                        }}
                      >
                        Visit Shop
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }
            
            // User card (existing logic)
            const name = displayName(u);
            const handle = s(u?.handle || (u?.email ? "@" + u.email.split("@")[0] : ""));
            const av = avatarUrl(u);

            // If we're in requests tab, we need request id to accept/decline
            const req =
              tab === "requests"
                ? incoming.find((r) => pickId(r?.fromUser || r?.from || r?.sender || r) === id)
                : null;
            const reqId = s(req?._id || req?.id);

            return (
              <motion.div
                key={`${id || name}-${idx}`}
                variants={item}
                className="glass-card p-4 rounded-xl group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                <div className="relative flex flex-col items-center text-center">
                  <div className="md-avatarRingSmall">
                    {av ? (
                      <img
                        src={av}
                        alt={name}
                        className="md-avatarImg"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div className="md-avatarFallback">
                        {name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white mb-0.5">{name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {handle || "@" + name.toLowerCase().replace(/\s+/g, "")}
                  </p>

                  {tab === "requests" ? (
                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        className="md-btn md-btn-primary flex-1 text-xs py-2 h-8"
                        disabled={busy || !reqId}
                        onClick={() => onRespond(reqId, "accept")}
                      >
                        <Check className="w-3 h-3" />
                        Accept
                      </button>
                      <button
                        type="button"
                        className="md-btn md-btn-ghost flex-1 text-xs py-2 h-8"
                        disabled={busy || !reqId}
                        onClick={() => onRespond(reqId, "decline")}
                      >
                        <X className="w-3 h-3" />
                        Decline
                      </button>
                    </div>
                  ) : tab === "suggestions" ? (
                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        className="md-btn md-btn-primary flex-1 text-xs py-2 h-8"
                        disabled={busy || !id}
                        onClick={() => onInvite(id)}
                      >
                        <UserPlus className="w-3 h-3" />
                        Add
                      </button>
                      <button
                        type="button"
                        className="md-btn md-btn-ghost h-8 w-8 p-0"
                        onClick={() => id && nav(`/feed/user/${encodeURIComponent(id)}`)}
                        title="View"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        className="md-btn md-btn-ghost flex-1 text-xs py-2 h-8"
                        onClick={() => id && nav(`/messages/user/${encodeURIComponent(id)}`)}
                      >
                        <MessageCircle className="w-3 h-3" />
                        Message
                      </button>
                      <button
                        type="button"
                        className="md-btn md-btn-ghost h-8 w-8 p-0"
                        onClick={() => id && nav(`/feed/user/${encodeURIComponent(id)}`)}
                        title="View Feed"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

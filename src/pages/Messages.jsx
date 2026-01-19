// user-frontend-vite/src/pages/Messages.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  API_BASE,
  getMyFriends,
  getMyOrders,
  getUserConversations,
  getConversationMessages,
  getOrCreateConversation,
  startShopConversation,
  sendConversationMessage,

  // ✅ NEW (from our api.jsx fix)
  markConversationMessageNotificationsRead,
  toAbsUrl,
} from "../api.jsx";

/* =========================
  Helpers
  ========================= */
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

// Use the centralized toAbsUrl from api.jsx (kept as absUrl for backwards compatibility)
const absUrl = toAbsUrl;

function isImage(m) {
  const s = String(m || "").toLowerCase();
  return s.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(s);
}
function isVideo(m) {
  const s = String(m || "").toLowerCase();
  return s.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(s);
}

function safeName(x) {
  return String(x || "").trim() || "Unknown";
}

// ✅ robust id extractor (fixes ObjectId('...'), "$oid", and messy strings)
function extractId(v) {
  if (!v) return "";
  if (typeof v === "string") {
    const s = v.trim();
    if (/^[a-f0-9]{24}$/i.test(s)) return s;
    const m = s.match(/ObjectId\(['"]([a-f0-9]{24})['"]\)/i);
    if (m?.[1]) return m[1];
    const m2 = s.match(/([a-f0-9]{24})/i);
    if (m2?.[1]) return m2[1];
    return "";
  }
  if (typeof v === "object") {
    if (v.$oid && /^[a-f0-9]{24}$/i.test(String(v.$oid))) return String(v.$oid);
    const raw = v._id || v.id || v.entityId || v.userId || v.shopId;
    return extractId(raw);
  }
  return "";
}

function safeId(x) {
  return extractId(x?._id || x?.id || x?.userId || x?.shopId || x?.email || x);
}

function displayNameFromEntity(x) {
  if (!x) return "Unknown";
  const full = `${x?.firstName || ""} ${x?.lastName || ""}`.trim();
  return (
    full ||
    x?.displayName ||
    x?.shopName ||
    x?.name ||
    x?.username ||
    x?.email ||
    x?.shopEmail ||
    "Unknown"
  );
}

function normalizeConversation(c, meId) {
  const id = String(c?._id || c?.id || "");
  const topic = String(c?.topic || c?.conversationTopic || "general");

  const participants = Array.isArray(c?.participants) ? c.participants : [];

  let otherType = String(c?.otherType || c?.participantType || "").toLowerCase().trim();
  let otherId = extractId(c?.otherId || c?.participantId || "");

  // preferred: backend "other" preview (if you ever add it)
  if (c?.other?.type && (c?.other?._id || c?.other?.id)) {
    otherType = String(c.other.type).toLowerCase().trim();
    otherId = extractId(c.other._id || c.other.id);
  }

  // participants array fallback
  if ((!otherId || !otherType) && participants.length > 0) {
    const normP = participants.map((p) => {
      const t = String(p?.type || p?.participantType || p?.kind || "")
        .toLowerCase()
        .trim();
      const pid = extractId(p?.entityId || p?.participantId || p?.id || p?._id || "");
      return { t, pid };
    });

    let other = null;
    for (const p of normP) {
      if (p.t === "user" && meId && String(p.pid) === String(meId)) continue;
      other = p;
      break;
    }
    if (other) {
      otherType = other.t || otherType;
      otherId = other.pid || otherId;
    }
  }

  const otherName =
    c?.otherName || c?.otherParticipantName || c?.other?.name || c?.title || "Conversation";

  const otherAvatarUrl =
    c?.otherAvatarUrl || c?.otherAvatar || c?.other?.avatarUrl || c?.other?.avatar || "";

  const lastText =
    c?.lastText ||
    c?.lastMessage?.text ||
    c?.lastMessageText ||
    (typeof c?.lastMessage === "string" ? c.lastMessage : "") ||
    "";

  const unreadCount = Number(c?.unreadCount || c?.unread || 0) || 0;

  const pp = c?.productPreview || c?.productSnapshot || c?.product || c?.productInfo || null;

  const productPreview =
    pp && (pp.productId || pp._id)
      ? {
          productId: String(pp.productId || pp._id || ""),
          title: safeName(pp.title || pp.name || ""),
          imageUrl: pp.imageUrl
            ? absUrl(pp.imageUrl)
            : absUrl(pp.image || (Array.isArray(pp.images) ? pp.images[0] : "")),
        }
      : null;

  return {
    _id: id,
    topic,
    otherType: otherType || "user",
    otherId,
    otherName,
    otherAvatarUrl,
    lastText,
    unreadCount,
    productPreview,
    raw: c,
  };
}

/* =========================
  Product preview fetch (best effort)
  ========================= */
async function fetchProductPreview(productId) {
  const pid = String(productId || "").trim();
  if (!pid) return null;

  const endpoints = [
    `/api/products/${encodeURIComponent(pid)}`,
    `/api/public/products/${encodeURIComponent(pid)}`,
    `/api/mall/products/${encodeURIComponent(pid)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(absUrl(url), { method: "GET" });
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json().catch(() => ({})) : {};
      if (!res.ok) continue;

      const p = data?.product || data?.data?.product || data?.data || data;
      if (!p?._id && !p?.id) continue;

      const title = safeName(p?.title || p?.name || "Product");
      const img =
        p?.imageUrl ||
        p?.image ||
        (Array.isArray(p?.images) && p.images[0]) ||
        (Array.isArray(p?.displayImages) && p.displayImages[0]) ||
        "";

      return {
        productId: String(p?._id || p?.id || pid),
        title,
        imageUrl: img ? absUrl(img) : "",
      };
    } catch {
      // try next
    }
  }
  return null;
}

/* =========================
  Normalize API results (array OR object)
  ========================= */
function pickArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  for (const k of keys) {
    if (Array.isArray(payload?.[k])) return payload[k];
  }
  return [];
}

export default function Messages() {
  const nav = useNavigate();
  const params = useParams();
  const query = useQuery();

  // ✅ Mobile responsive detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ support:
  //   /messages/:conversationId
  //   /messages?conversationId=...
  // ✅ FIX: force ID extraction (prevents [object Object])
  const conversationId =
    extractId(params.conversationId || "") || extractId(query.get("conversationId") || "");

  // ✅ support older route:
  //   /messages/user/:userId   (auto-start a user chat)
  const toUserIdFromRoute = extractId(params.userId || "");

  // ✅ deep links:
  //   /messages?toUserId=...&productId=...
  const toUserIdFromUrl = extractId(query.get("toUserId") || "");
  const productIdFromUrl = extractId(query.get("productId") || "");

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const meId = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "";
      const u = JSON.parse(raw);
      return extractId(u?._id || u?.id || "");
    } catch {
      return "";
    }
  }, []);

  // inbox
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [inboxErr, setInboxErr] = useState("");
  const [conversations, setConversations] = useState([]);

  // chat
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatErr, setChatErr] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  // composer
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);

  // ✅ message filter tabs: all | friends | shop | user-asking
  const [messageFilter, setMessageFilter] = useState("all");

  // new chat modal
  const [openNew, setOpenNew] = useState(false);
  const [newTab, setNewTab] = useState("friend"); // friend | shop

  // friend picker
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendsErr, setFriendsErr] = useState("");
  const [friends, setFriends] = useState([]);
  const [pickedFriendId, setPickedFriendId] = useState("");

  // friends set for quick lookup
  const friendSet = useMemo(() => {
    const set = new Set();
    (Array.isArray(friends) ? friends : []).forEach((f) => {
      const id = safeId(f);
      if (id) set.add(String(id));
    });
    return set;
  }, [friends]);

  // shop picker (orders)
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersErr, setOrdersErr] = useState("");
  const [myOrders, setMyOrders] = useState([]);

  const [pickedShopId, setPickedShopId] = useState("");
  const [pickedTopic, setPickedTopic] = useState("product"); // product | general
  const [pickedProductId, setPickedProductId] = useState("");

  // prefill once
  const [prefillDone, setPrefillDone] = useState(false);

  // group orders by shop -> products
  const ordersByShop = useMemo(() => {
    const map = new Map();
    const orders = Array.isArray(myOrders) ? myOrders : [];

    for (const o of orders) {
      const shopId = extractId(o?.shopId || o?.shop?._id || o?.shop || "");
      if (!shopId) continue;

      const shopName =
        o?.shopName ||
        o?.shop?.shopName ||
        o?.shop?.name ||
        o?.shopEmail ||
        o?.shop?.shopEmail ||
        "Shop";

      const productId = extractId(o?.productId || o?.product?._id || o?.product || "");
      const productTitle = o?.productTitle || o?.product?.title || o?.title || "Product";

      const img =
        o?.productImage ||
        o?.product?.imageUrl ||
        o?.product?.image ||
        (Array.isArray(o?.product?.images) && o.product.images[0]) ||
        (Array.isArray(o?.images) && o.images[0]) ||
        "";

      if (!map.has(shopId)) map.set(shopId, { shopId, shopName, products: [] });

      if (productId) {
        const entry = map.get(shopId);
        const exists = entry.products.some((p) => String(p.productId) === String(productId));
        if (!exists) {
          entry.products.push({
            productId,
            title: productTitle,
            imageUrl: img ? absUrl(img) : "",
          });
        }
      }
    }

    for (const v of map.values()) {
      v.products.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    }

    return Array.from(map.values()).sort((a, b) =>
      String(a.shopName).localeCompare(String(b.shopName))
    );
  }, [myOrders]);

  const selectedShop = useMemo(() => {
    return ordersByShop.find((s) => String(s.shopId) === String(pickedShopId)) || null;
  }, [ordersByShop, pickedShopId]);

  /* =========================
    Load inbox
    ========================= */
  const loadInbox = useCallback(async () => {
    setLoadingInbox(true);
    setInboxErr("");

    try {
      const res = await getUserConversations();
      const arr = pickArray(res, ["conversations", "items", "data"]);
      const normalized = arr.map((c) => normalizeConversation(c, meId));

      const seen = new Set();
      const unique = [];
      for (const c of normalized) {
        if (!c?._id) continue;
        if (seen.has(c._id)) continue;
        seen.add(c._id);
        unique.push(c);
      }
      setConversations(unique);
    } catch (e) {
      setInboxErr(e?.message || "Failed to load conversations");
      setConversations([]);
    } finally {
      setLoadingInbox(false);
    }
  }, [meId]);

  /* =========================
    Load chat (also clears unread + message notifications)
    ✅ FIX: NEVER fallback to String(object) => prevents /[object Object]/messages
    ========================= */
  const loadChat = useCallback(
    async (cid) => {
      const cleanCid = extractId(cid);

      if (!cleanCid) {
        setMessages([]);
        setActiveConversation(null);
        setChatErr("Invalid conversation id (bad value).");
        return;
      }

      setLoadingChat(true);
      setChatErr("");

      try {
        const res = await getConversationMessages(cleanCid);
        const msgs = pickArray(res, ["messages", "items", "data"]);

        const row = conversations.find((c) => String(c._id) === String(cleanCid)) || null;
        setActiveConversation(row || null);

        const normalizedMsgs = (msgs || []).map((m) => {
          const atts = Array.isArray(m?.attachments) ? m.attachments : [];

          const fixed = atts.map((a) => ({
            ...(typeof a === "object" && a ? a : {}),
            url: absUrl(
              (a && (a.url || a.path || a.fileUrl)) || (typeof a === "string" ? a : "") || ""
            ),
            type: (a && (a.type || a.mimeType || a.mimetype)) || "",
            name: (a && (a.name || a.originalName || a.filename)) || "file",
          }));

          return { ...m, attachments: fixed };
        });

        setMessages(normalizedMsgs);

        // ✅ Clear message-type notifications for this conversation
        try {
          await markConversationMessageNotificationsRead(cleanCid);
        } catch {
          // don't block UI
        }

        // ✅ clear unread badge locally
        setConversations((prev) =>
          (Array.isArray(prev) ? prev : []).map((c) =>
            String(c?._id) === String(cleanCid) ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch (e) {
        setChatErr(e?.message || "Failed to load messages");
        setMessages([]);
        setActiveConversation(null);
      } finally {
        setLoadingChat(false);
      }
    },
    [conversations]
  );

  /* =========================
    Load friends
    ========================= */
  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    setFriendsErr("");
    try {
      const res = await getMyFriends();
      const arr = pickArray(res, ["friends", "users", "items", "data"]);
      setFriends(arr);
    } catch (e) {
      setFriendsErr(e?.message || "Failed to load friends");
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  /* =========================
    Mount
    ========================= */
  useEffect(() => {
    loadInbox();
    loadFriends();
  }, [loadInbox, loadFriends]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setActiveConversation(null);
      setChatErr("");
      return;
    }
    loadChat(conversationId);
  }, [conversationId, loadChat]);

  useEffect(() => {
    if (!conversationId) return;
    const t = setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      60
    );
    return () => clearTimeout(t);
  }, [messages, conversationId]);

  /* =========================
    Deep link handler:
      /messages/user/:userId
      /messages?toUserId=...&productId=...
  ========================= */
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (conversationId) return;

      const targetUserId = toUserIdFromRoute || toUserIdFromUrl;
      if (!targetUserId) return;

      if (meId && String(meId) === String(targetUserId)) return;

      try {
        const topic = productIdFromUrl ? "ask-buyer" : "general";

        const data = await getOrCreateConversation({
          participantType: "user",
          participantId: targetUserId,
          topic,
          productId: productIdFromUrl || null,
          shopId: null,
        });

        const convo = data?.conversation || data;
        const cid = extractId(convo?._id || convo?.id || data?._id || data?.id || "");
        if (!cid) throw new Error("Conversation not created");

        if (cancelled) return;

        const qp = productIdFromUrl
          ? `?productId=${encodeURIComponent(productIdFromUrl)}&toUserId=${encodeURIComponent(
              targetUserId
            )}`
          : targetUserId
          ? `?toUserId=${encodeURIComponent(targetUserId)}`
          : "";

        nav(`/messages/${cid}${qp}`, { replace: true });
      } catch (e) {
        if (!cancelled) setInboxErr(e?.message || "Failed to open conversation");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [conversationId, toUserIdFromRoute, toUserIdFromUrl, productIdFromUrl, meId, nav]);

  /* =========================
    Composer
    ========================= */
  function onPickFiles(e) {
    const picked = Array.from(e.target.files || []);
    setFiles(picked.slice(0, 10));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSend(e) {
    e.preventDefault();

    const cleanCid = extractId(conversationId);
    if (!cleanCid) {
      setChatErr("Invalid conversation id (cannot send).");
      return;
    }

    const msg = String(text || "").trim();
    if (!msg && files.length === 0) return;

    setChatErr("");
    setSending(true);

    const currentFiles = files;
    setText("");
    setFiles([]);

    try {
      await sendConversationMessage(cleanCid, {
        text: msg,
        files: currentFiles,
      });

      await loadChat(cleanCid);
      await loadInbox();
    } catch (e2) {
      setChatErr(e2?.message || "Failed to send message");
      setText(msg);
      setFiles(currentFiles);
    } finally {
      setSending(false);
    }
  }

  /* =========================
    Prefill message if coming from ask-buyer flow
    ========================= */
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!conversationId) return;
      if (prefillDone) return;

      const tu = extractId(query.get("toUserId") || "");
      const pid = extractId(query.get("productId") || "");
      if (!tu || !pid) return;

      if (String(text || "").trim()) {
        setPrefillDone(true);
        return;
      }

      const preview = await fetchProductPreview(pid);
      if (cancelled) return;

      const msg = preview
        ? `Hi 👋 I saw you bought "${preview.title}". Can I ask you a quick question about it?`
        : `Hi 👋 I saw you bought this product. Can I ask you a quick question about it?`;

      setText(msg);
      setPrefillDone(true);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [conversationId, query, prefillDone, text]);

  /* =========================
    New chat modal open
    ========================= */
  async function openNewChat() {
    setOpenNew(true);
    setNewTab("friend");

    setFriendsErr("");
    setOrdersErr("");

    setPickedFriendId("");
    setPickedShopId("");
    setPickedTopic("product");
    setPickedProductId("");

    await loadFriends();

    setLoadingOrders(true);
    try {
      const res = await getMyOrders();
      const arr = pickArray(res, ["orders", "items", "data"]);
      setMyOrders(arr);
    } catch (e) {
      setOrdersErr(e?.message || "Failed to load your orders");
      setMyOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }

  /* =========================
    Create conversation (friend)
    ========================= */
  async function createFriendConversation() {
    const fid = extractId(pickedFriendId);
    if (!fid) {
      setFriendsErr("Please select a friend.");
      return;
    }

    setFriendsErr("");
    try {
      const data = await getOrCreateConversation({
        participantType: "user",
        participantId: fid,
        topic: "general",
        productId: null,
        shopId: null,
      });

      const convo = data?.conversation || data;
      const cid = extractId(convo?._id || convo?.id || data?._id || data?.id || "");
      if (!cid) throw new Error("Conversation not created");

      setOpenNew(false);
      await loadInbox();
      nav(`/messages/${cid}`);
    } catch (e) {
      setFriendsErr(e?.message || "Failed to start conversation");
    }
  }

  /* =========================
    Create conversation (shop)
    ========================= */
  async function createShopConversation() {
    const sid = extractId(pickedShopId);
    const pid = extractId(pickedProductId);

    if (!sid) {
      setOrdersErr("Please select a shop.");
      return;
    }
    if (pickedTopic === "product" && !pid) {
      setOrdersErr("Please select a product you bought, or choose Others.");
      return;
    }

    setOrdersErr("");
    try {
      const data = await startShopConversation({
        shopId: sid,
        topic: pickedTopic === "product" ? "product" : "general",
        productId: pickedTopic === "product" ? pid : null,
      });

      const convo = data?.conversation || data;
      const cid = extractId(convo?._id || convo?.id || data?._id || data?.id || "");
      if (!cid) throw new Error("Conversation not created");

      setOpenNew(false);
      await loadInbox();
      nav(`/messages/${cid}`);
    } catch (e) {
      setOrdersErr(e?.message || "Failed to start conversation");
    }
  }

  /* =========================
    UI helpers
    ========================= */
  const activeRow = useMemo(() => {
    if (!conversationId) return null;
    return conversations.find((c) => String(c._id) === String(conversationId)) || null;
  }, [conversations, conversationId]);

  const [urlProductPreview, setUrlProductPreview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const pid = extractId(query.get("productId") || "");
      if (!pid) {
        setUrlProductPreview(null);
        return;
      }
      const preview = await fetchProductPreview(pid);
      if (!cancelled) setUrlProductPreview(preview);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const headerProduct = useMemo(() => {
    const conv = activeConversation || activeRow;
    const topic = String(conv?.topic || "").toLowerCase();

    if (topic === "product" || topic === "ask-buyer") {
      const prev =
        conv?.productPreview ||
        conv?.raw?.productSnapshot ||
        conv?.raw?.productPreview ||
        null;

      if (prev?.productId || prev?._id) {
        const pid = String(prev.productId || prev._id || "");
        return {
          productId: pid,
          title: safeName(prev.title || prev.name || "Product"),
          imageUrl: absUrl(
            prev.imageUrl || prev.image || (Array.isArray(prev.images) ? prev.images[0] : "")
          ),
        };
      }
    }

    if (urlProductPreview?.productId) return urlProductPreview;
    return null;
  }, [activeConversation, activeRow, urlProductPreview]);

  function mineMessage(m) {
    const st = String(m?.senderType || "").toLowerCase().trim();
    const sid = extractId(m?.senderEntityId || "");
    if (!st || !sid) return false;
    return st === "user" && meId && String(sid) === String(meId);
  }

  function convoLabel(c) {
    const otherType = String(c?.otherType || "user").toLowerCase().trim();
    if (otherType === "shop") return "Shop";
    const otherId = String(extractId(c?.otherId || "") || "");
    return otherId && friendSet.has(otherId) ? "Friend" : "User";
  }

  /* =========================
    Filter conversations by category
    ========================= */
  const filteredConversations = useMemo(() => {
    if (messageFilter === "all") return conversations;

    const filtered = conversations.filter((c) => {
      const label = convoLabel(c);
      if (messageFilter === "friends") return label === "Friend";
      if (messageFilter === "shop") return label === "Shop";
      if (messageFilter === "user-asking") return label === "User";
      return true;
    });

    return filtered;
  }, [conversations, messageFilter, friendSet]);

  const categoryCounts = useMemo(
    () => ({
      friends: conversations.filter((c) => convoLabel(c) === "Friend").length,
      shop: conversations.filter((c) => convoLabel(c) === "Shop").length,
      user: conversations.filter((c) => convoLabel(c) === "User").length,
      total: conversations.length,
    }),
    [conversations, friendSet]
  );

  function messageSenderBadge(m) {
    const mine = mineMessage(m);
    if (mine) return { text: "ME", kind: "me" };

    const st = String(m?.senderType || "").toLowerCase().trim();
    const sid = extractId(m?.senderEntityId || "");

    if (st === "shop") return { text: "SHOP", kind: "shop" };
    if (st === "user")
      return friendSet.has(String(sid))
        ? { text: "FRIEND", kind: "friend" }
        : { text: "USER", kind: "user" };
    return { text: "UNKNOWN", kind: "user" };
  }

  /* =========================
    THEME
    ========================= */
  const theme = {
    text: "#e5e7eb",
    muted: "#94a3b8",
    border: "rgba(255,255,255,0.08)",
    panel: "rgba(255,255,255,0.04)",
    panel2: "rgba(255,255,255,0.06)",
    hover: "rgba(59,130,246,0.18)",
    active: "rgba(59,130,246,0.28)",
    accent: "#3b82f6",
    dangerBg: "rgba(239,68,68,0.14)",
    dangerBorder: "rgba(239,68,68,0.25)",
    dangerText: "#fecaca",
    inputBg: "rgba(0,0,0,0.30)",

    // badges
    badgeMeBg: "rgba(59,130,246,0.22)",
    badgeMeBd: "rgba(59,130,246,0.45)",
    badgeShopBg: "rgba(168,85,247,0.18)",
    badgeShopBd: "rgba(168,85,247,0.45)",
    badgeFriendBg: "rgba(34,197,94,0.18)",
    badgeFriendBd: "rgba(34,197,94,0.45)",
    badgeUserBg: "rgba(148,163,184,0.14)",
    badgeUserBd: "rgba(148,163,184,0.35)",
  };

  // Mobile: show only chat when conversation is selected, else show inbox
  const showInboxOnMobile = isMobile && !conversationId;
  const showChatOnMobile = isMobile && conversationId;

  return (
    <div style={isMobile ? styles.wrapMobile : styles.wrap}>
      {/* LEFT: Inbox - hide on mobile when chat is open */}
      {(!isMobile || showInboxOnMobile) && (
      <div style={isMobile ? styles.leftMobile(theme) : styles.left(theme)}>
        <div style={styles.leftTop(theme)}>
          <div style={styles.h(theme)}>Messages</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={loadInbox}
              style={styles.btnGhost(theme)}
              type="button"
              disabled={loadingInbox}
            >
              {loadingInbox ? "..." : "↻"}
            </button>
            <button onClick={openNewChat} style={styles.btnPrimary(theme)} type="button">
              + New
            </button>
          </div>
        </div>

        {inboxErr ? <div style={styles.errBox(theme)}>{inboxErr}</div> : null}
        {loadingInbox ? <div style={styles.muted(theme)}>Loading inbox…</div> : null}

        {/* ✅ FILTER TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setMessageFilter("all")}
            style={styles.filterTab(theme, messageFilter === "all")}
          >
            All {categoryCounts.total > 0 && `(${categoryCounts.total})`}
          </button>
          <button
            type="button"
            onClick={() => setMessageFilter("friends")}
            style={styles.filterTab(theme, messageFilter === "friends")}
          >
            Friends {categoryCounts.friends > 0 && `(${categoryCounts.friends})`}
          </button>
          <button
            type="button"
            onClick={() => setMessageFilter("shop")}
            style={styles.filterTab(theme, messageFilter === "shop")}
          >
            Shop {categoryCounts.shop > 0 && `(${categoryCounts.shop})`}
          </button>
          <button
            type="button"
            onClick={() => setMessageFilter("user-asking")}
            style={styles.filterTab(theme, messageFilter === "user-asking")}
          >
            User Asking {categoryCounts.user > 0 && `(${categoryCounts.user})`}
          </button>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {filteredConversations.map((c, i) => {
            const active = conversationId && String(c._id) === String(conversationId);

            const topic = String(c?.topic || "general").toLowerCase();
            const otherName = c?.otherName || "Conversation";
            const lastText = c?.lastText || "";

            const label = convoLabel(c);
            const previewImg =
              topic === "product" || topic === "ask-buyer"
                ? absUrl(c?.productPreview?.imageUrl || "")
                : "";

            return (
              <button
                key={String(c?._id || `row-${i}`)}
                type="button"
                onClick={() => {
                  // ✅ clear badge instantly on click
                  setConversations((prev) =>
                    (Array.isArray(prev) ? prev : []).map((x) =>
                      String(x?._id) === String(c?._id) ? { ...x, unreadCount: 0 } : x
                    )
                  );
                  nav(`/messages/${c._id}`);
                }}
                style={styles.convBtn(theme, active)}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {previewImg ? (
                    <img
                      src={previewImg}
                      alt=""
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        objectFit: "cover",
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                  ) : c?.otherAvatarUrl ? (
                    <img
                      src={absUrl(c.otherAvatarUrl)}
                      alt={otherName}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        objectFit: "cover",
                        border: `1px solid ${theme.border}`,
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  {!previewImg && !c?.otherAvatarUrl && (
                    <div style={styles.avatar(theme)}>
                      {(otherName?.[0] || "C").toUpperCase?.() || "C"}
                    </div>
                  )}

                  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, color: theme.text }}>
                      {otherName}{" "}
                      <span style={{ fontSize: 12, color: theme.muted, fontWeight: 900 }}>
                        • {label} •{" "}
                        {topic === "product"
                          ? "Product"
                          : topic === "ask-buyer"
                          ? "Ask Buyer"
                          : "General"}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: theme.muted,
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {lastText ? (lastText.length > 80 ? lastText.slice(0, 80) + "…" : lastText) : "—"}
                    </div>
                  </div>

                  {Number(c?.unreadCount || 0) > 0 ? (
                    <div style={styles.badge(theme)}>{Number(c.unreadCount)}</div>
                  ) : null}
                </div>
              </button>
            );
          })}

          {!loadingInbox && conversations.length === 0 ? (
            <div style={styles.muted(theme)}>
              No conversations yet. Click <b>+ New</b> to message a friend or a shop.
            </div>
          ) : null}
        </div>
      </div>
      )}

      {/* RIGHT: Chat - hide on mobile when no conversation selected */}
      {(!isMobile || showChatOnMobile) && (
      <div style={isMobile ? styles.rightMobile(theme) : styles.right(theme)}>
        {!conversationId ? (
          <div style={styles.centerEmpty(theme)}>
            <div style={{ fontWeight: 900, fontSize: 18, color: theme.text }}>
              Select a conversation
            </div>
            <div style={{ color: theme.muted, marginTop: 6 }}>
              Or click <b>+ New</b> to start a chat.
            </div>
          </div>
        ) : (
          <>
            <div style={styles.chatTop(theme)}>
              {/* Mobile back button */}
              {isMobile && (
                <button
                  type="button"
                  style={{ ...styles.btnGhost(theme), marginRight: 8 }}
                  onClick={() => nav('/messages')}
                >
                  ← Back
                </button>
              )}
              <div style={{ fontWeight: 900, color: theme.text, flex: 1 }}>
                {activeRow?.otherName || "Chat"}
              </div>

              <button
                type="button"
                style={styles.btnGhost(theme)}
                onClick={() => loadChat(conversationId)}
                disabled={loadingChat}
              >
                {loadingChat ? "..." : "↻"}
              </button>
            </div>

            {/* Product header */}
            {headerProduct ? (
              <button
                type="button"
                style={styles.productBar(theme)}
                onClick={() => nav(`/product/${encodeURIComponent(headerProduct.productId)}`)}
                title="Open product"
              >
                {headerProduct.imageUrl ? (
                  <img
                    src={headerProduct.imageUrl}
                    alt={headerProduct.title}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      objectFit: "cover",
                      border: `1px solid ${theme.border}`,
                    }}
                  />
                ) : (
                  <div style={styles.prodAvatar(theme)}>🛍️</div>
                )}

                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 900, color: theme.text }}>{headerProduct.title}</div>
                  <div style={{ fontSize: 12, color: theme.muted, fontWeight: 800 }}>
                    Click to open product
                  </div>
                </div>
              </button>
            ) : null}

            {loadingChat ? <div style={styles.muted(theme)}>Loading chat…</div> : null}
            {chatErr ? <div style={styles.errBox(theme)}>{chatErr}</div> : null}

            <div style={styles.chatBody(theme)}>
              {messages.map((m, idx) => {
                const mine = mineMessage(m);
                const atts = Array.isArray(m?.attachments) ? m.attachments : [];
                const badge = messageSenderBadge(m);

                return (
                  <div
                    key={String(m?._id || `msg-${idx}`)}
                    style={{
                      ...styles.bubbleRow,
                      justifyContent: mine ? "flex-end" : "flex-start",
                      alignItems: "flex-end",
                      gap: 8,
                    }}
                  >
                    {/* Avatar for other person's messages */}
                    {!mine && (
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: theme.panel,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                        border: `1px solid ${theme.border}`,
                      }}>
                        {m?.sender?.avatarUrl ? (
                          <img
                            src={m.sender.avatarUrl.startsWith('http') ? m.sender.avatarUrl : `${absUrl(m.sender.avatarUrl)}`}
                            alt={m?.sender?.firstName || "User"}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>
                            {(m?.sender?.firstName?.[0] || "U").toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}

                    <div style={styles.bubble(theme, mine)}>
                      <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                        <span style={styles.senderBadge(theme, badge.kind)}>{badge.text}</span>
                      </div>

                      {m?.text ? <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{m.text}</div> : null}

                      {atts.length > 0 ? (
                        <div style={{ marginTop: m?.text ? 10 : 6, display: "grid", gap: 10 }}>
                          {atts.map((a, aidx) => {
                            const mime = a?.type || "";
                            const url = absUrl(a?.url || "");
                            const label = a?.name || "file";

                            if (isImage(mime) || isImage(url)) {
                              return (
                                <a key={aidx} href={url} target="_blank" rel="noreferrer">
                                  <img
                                    src={url}
                                    alt={label}
                                    style={{
                                      maxWidth: 320,
                                      width: "100%",
                                      borderRadius: 14,
                                      border: `1px solid ${theme.border}`,
                                    }}
                                  />
                                </a>
                              );
                            }

                            if (isVideo(mime) || isVideo(url)) {
                              return (
                                <video
                                  key={aidx}
                                  src={url}
                                  controls
                                  style={{
                                    maxWidth: 380,
                                    width: "100%",
                                    borderRadius: 14,
                                    border: `1px solid ${theme.border}`,
                                    background: "#000",
                                  }}
                                />
                              );
                            }

                            return (
                              <a
                                key={aidx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: mine ? "#fff" : theme.text,
                                  textDecoration: "underline",
                                  fontWeight: 900,
                                  wordBreak: "break-word",
                                }}
                              >
                                📎 {label}
                              </a>
                            );
                          })}
                        </div>
                      ) : null}

                      <div style={styles.time(theme)}>
                        {m?.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* selected files preview */}
            {files.length > 0 ? (
              <div style={styles.filesBar(theme)}>
                {files.map((f, idx) => (
                  <div key={idx} style={styles.fileChip(theme)}>
                    <span style={{ fontWeight: 900, fontSize: 12, color: theme.text }}>
                      {f.name.length > 26 ? f.name.slice(0, 26) + "…" : f.name}
                    </span>
                    <button type="button" onClick={() => removeFile(idx)} style={styles.xBtn(theme)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <form onSubmit={onSend} style={styles.chatForm(theme)}>
              <label style={styles.attachBtn(theme)} title="Attach files">
                📎
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={onPickFiles}
                  style={{ display: "none" }}
                  accept="image/*,video/*,.pdf,.txt,.doc,.docx,.zip"
                />
              </label>

              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                style={styles.chatInput(theme)}
                disabled={sending}
              />

              <button type="submit" style={styles.sendBtn(theme)} disabled={sending}>
                {sending ? "..." : "Send"}
              </button>
            </form>
          </>
        )}
      </div>
      )}

      {/* NEW CHAT MODAL */}
      {openNew ? (
        <div style={styles.modalOverlay} onMouseDown={() => setOpenNew(false)}>
          <div style={styles.modal(theme)} onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 900, fontSize: 16, color: theme.text }}>New message</div>
              <button style={styles.closeBtn(theme)} type="button" onClick={() => setOpenNew(false)}>
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button type="button" onClick={() => setNewTab("friend")} style={styles.pill(theme, newTab === "friend")}>
                Friend
              </button>
              <button type="button" onClick={() => setNewTab("shop")} style={styles.pill(theme, newTab === "shop")}>
                Shop
              </button>
            </div>

            {/* FRIEND TAB */}
            {newTab === "friend" ? (
              <div style={{ marginTop: 12 }}>
                {loadingFriends ? <div style={styles.muted(theme)}>Loading friends…</div> : null}
                {friendsErr ? <div style={styles.errBox(theme)}>{friendsErr}</div> : null}

                <div style={styles.label(theme)}>Select friend</div>
                <select
                  value={pickedFriendId}
                  onChange={(e) => {
                    setPickedFriendId(e.target.value);
                    setFriendsErr("");
                  }}
                  style={styles.select(theme)}
                >
                  <option value="">-- choose --</option>
                  {(Array.isArray(friends) ? friends : []).map((f) => {
                    const fid = safeId(f);
                    const nm = displayNameFromEntity(f);
                    return (
                      <option key={fid || nm} value={fid}>
                        {nm} {f?.email ? `• ${f.email}` : ""}
                      </option>
                    );
                  })}
                </select>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 10 }}>
                  <button type="button" style={styles.secondaryBtn(theme)} onClick={() => setOpenNew(false)}>
                    Cancel
                  </button>
                  <button type="button" style={styles.primaryBtn(theme)} onClick={createFriendConversation}>
                    Start
                  </button>
                </div>
              </div>
            ) : null}

            {/* SHOP TAB */}
            {newTab === "shop" ? (
              <div style={{ marginTop: 12 }}>
                {loadingOrders ? <div style={styles.muted(theme)}>Loading your orders…</div> : null}
                {ordersErr ? <div style={styles.errBox(theme)}>{ordersErr}</div> : null}

                {!loadingOrders && ordersByShop.length === 0 ? (
                  <div style={styles.muted(theme)}>
                    No orders found. You can message a shop only after buying from it.
                  </div>
                ) : null}

                <div style={{ marginTop: 12 }}>
                  <div style={styles.label(theme)}>Select shop</div>
                  <select
                    value={pickedShopId}
                    onChange={(e) => {
                      setPickedShopId(e.target.value);
                      setPickedProductId("");
                      setOrdersErr("");
                    }}
                    style={styles.select(theme)}
                  >
                    <option value="">-- choose --</option>
                    {ordersByShop.map((s) => (
                      <option key={s.shopId} value={s.shopId}>
                        {s.shopName}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={styles.label(theme)}>Topic</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setPickedTopic("product")}
                      style={styles.pill(theme, pickedTopic === "product")}
                    >
                      Product I bought
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPickedTopic("general");
                        setPickedProductId("");
                      }}
                      style={styles.pill(theme, pickedTopic !== "product")}
                    >
                      Others
                    </button>
                  </div>
                </div>

                {pickedTopic === "product" ? (
                  <div style={{ marginTop: 12 }}>
                    <div style={styles.label(theme)}>Select bought product</div>
                    <select
                      value={pickedProductId}
                      onChange={(e) => {
                        setPickedProductId(e.target.value);
                        setOrdersErr("");
                      }}
                      style={styles.select(theme)}
                      disabled={!pickedShopId}
                    >
                      <option value="">{pickedShopId ? "-- choose product --" : "Select a shop first"}</option>
                      {(selectedShop?.products || []).map((p) => (
                        <option key={p.productId} value={p.productId}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 10 }}>
                  <button type="button" style={styles.secondaryBtn(theme)} onClick={() => setOpenNew(false)}>
                    Cancel
                  </button>
                  <button type="button" style={styles.primaryBtn(theme)} onClick={createShopConversation}>
                    Start
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* =========================
  Styles (Dark Glass)
  ========================= */
const styles = {
  wrap: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 380px) 1fr",
    gap: 12,
    padding: 14,
    maxWidth: "100vw",
    boxSizing: "border-box",
  },

  wrapMobile: {
    display: "flex",
    flexDirection: "column",
    padding: 8,
    maxWidth: "100vw",
    boxSizing: "border-box",
    height: "calc(100dvh - 80px)",
  },

  left: (t) => ({
    border: `1px solid ${t.border}`,
    borderRadius: 16,
    padding: 12,
    background: t.panel,
    height: "calc(100vh - 110px)",
    maxHeight: "calc(100dvh - 110px)",
    overflow: "auto",
    backdropFilter: "blur(12px)",
  }),

  leftMobile: (t) => ({
    border: `1px solid ${t.border}`,
    borderRadius: 16,
    padding: 10,
    background: t.panel,
    flex: 1,
    overflow: "auto",
    backdropFilter: "blur(12px)",
  }),

  leftTop: (t) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
    paddingBottom: 10,
    borderBottom: `1px solid ${t.border}`,
  }),

  h: (t) => ({ fontWeight: 900, fontSize: 18, color: t.text }),

  convBtn: (t, active) => ({
    border: `1px solid ${active ? "rgba(59,130,246,0.55)" : t.border}`,
    borderRadius: 14,
    padding: 10,
    cursor: "pointer",
    textAlign: "left",
    background: active ? t.active : t.panel2,
    transition: "all 0.15s ease",
  }),

  avatar: (t) => ({
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    border: `1px solid ${t.border}`,
    fontWeight: 900,
    background: "rgba(0,0,0,0.25)",
    color: t.text,
  }),

  badge: (t) => ({
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    background: t.accent,
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 12,
    padding: "0 7px",
  }),

  right: (t) => ({
    border: `1px solid ${t.border}`,
    borderRadius: 16,
    background: t.panel,
    height: "calc(100vh - 110px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backdropFilter: "blur(14px)",
  }),

  rightMobile: (t) => ({
    border: `1px solid ${t.border}`,
    borderRadius: 16,
    background: t.panel,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backdropFilter: "blur(14px)",
  }),

  chatTop: (t) => ({
    padding: 12,
    borderBottom: `1px solid ${t.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  }),

  productBar: (t) => ({
    border: "none",
    borderBottom: `1px solid ${t.border}`,
    background: "rgba(0,0,0,0.12)",
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
  }),

  prodAvatar: (t) => ({
    width: 46,
    height: 46,
    borderRadius: 14,
    border: `1px solid ${t.border}`,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    background: "rgba(0,0,0,0.25)",
    color: t.text,
  }),

  chatBody: (t) => ({
    padding: 12,
    overflow: "auto",
    flex: 1,
    background: "rgba(0,0,0,0.10)",
  }),

  bubbleRow: { display: "flex", marginBottom: 10 },

  bubble: (t, mine) => ({
    maxWidth: "78%",
    padding: "10px 12px",
    borderRadius: 14,
    fontWeight: 700,
    lineHeight: 1.35,
    background: mine ? t.accent : "rgba(255,255,255,0.08)",
    color: mine ? "#fff" : t.text,
    border: mine ? "none" : `1px solid ${t.border}`,
  }),

  senderBadge: (t, kind) => {
    const base = {
      fontSize: 11,
      fontWeight: 900,
      padding: "3px 8px",
      borderRadius: 999,
      letterSpacing: 0.3,
      display: "inline-block",
      userSelect: "none",
    };

    if (kind === "me")
      return { ...base, background: t.badgeMeBg, border: `1px solid ${t.badgeMeBd}`, color: t.text };
    if (kind === "shop")
      return { ...base, background: t.badgeShopBg, border: `1px solid ${t.badgeShopBd}`, color: t.text };
    if (kind === "friend")
      return { ...base, background: t.badgeFriendBg, border: `1px solid ${t.badgeFriendBd}`, color: t.text };
    return { ...base, background: t.badgeUserBg, border: `1px solid ${t.badgeUserBd}`, color: t.text };
  },

  time: (t) => ({
    marginTop: 8,
    fontSize: 11,
    color: t.muted,
    fontWeight: 700,
  }),

  chatForm: (t) => ({
    padding: 12,
    borderTop: `1px solid ${t.border}`,
    display: "flex",
    gap: 10,
    alignItems: "center",
    background: "rgba(0,0,0,0.12)",
  }),

  attachBtn: (t) => ({
    width: 44,
    height: 44,
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    userSelect: "none",
    fontWeight: 900,
    color: t.text,
    background: "rgba(0,0,0,0.25)",
  }),

  chatInput: (t) => ({
    flex: 1,
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    outline: "none",
    background: t.inputBg,
    color: t.text,
  }),

  sendBtn: (t) => ({
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: t.accent,
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  }),

  filesBar: (t) => ({
    padding: "10px 12px",
    borderTop: `1px solid ${t.border}`,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    background: "rgba(0,0,0,0.10)",
  }),

  fileChip: (t) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 999,
    border: `1px solid ${t.border}`,
    background: "rgba(255,255,255,0.06)",
  }),

  xBtn: (t) => ({
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 900,
    color: t.text,
  }),

  btnGhost: (t) => ({
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid ${t.border}`,
    background: "rgba(0,0,0,0.20)",
    color: t.text,
    fontWeight: 900,
    cursor: "pointer",
  }),

  btnPrimary: (t) => ({
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid rgba(59,130,246,0.55)`,
    background: t.accent,
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  }),

  muted: (t) => ({
    color: t.muted,
    marginBottom: 10,
    padding: "0 12px",
    fontWeight: 700,
  }),

  errBox: (t) => ({
    background: t.dangerBg,
    border: `1px solid ${t.dangerBorder}`,
    color: t.dangerText,
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 800,
    marginBottom: 10,
  }),

  centerEmpty: (t) => ({
    padding: 18,
    display: "grid",
    placeItems: "center",
    height: "100%",
    textAlign: "center",
  }),

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "grid",
    placeItems: "center",
    zIndex: 999,
    padding: 14,
  },

  modal: (t) => ({
    width: "min(560px, 95vw)",
    background: "rgba(2,6,23,0.92)",
    borderRadius: 16,
    border: `1px solid ${t.border}`,
    padding: 14,
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    backdropFilter: "blur(14px)",
  }),

  closeBtn: (t) => ({
    border: `1px solid ${t.border}`,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    width: 36,
    height: 36,
    cursor: "pointer",
    fontWeight: 900,
    color: t.text,
  }),

  label: (t) => ({
    fontWeight: 900,
    fontSize: 12,
    color: t.muted,
    marginBottom: 6,
    marginTop: 10,
  }),

  select: (t) => ({
    width: "100%",
    padding: 10,
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    background: "rgba(0,0,0,0.35)",
    color: t.text,
    outline: "none",
  }),

  pill: (t, active) => ({
    border: `1px solid ${active ? "rgba(59,130,246,0.55)" : t.border}`,
    borderRadius: 999,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 900,
    background: active ? t.accent : "rgba(255,255,255,0.06)",
    color: active ? "#fff" : t.text,
  }),

  secondaryBtn: (t) => ({
    padding: "10px 14px",
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    background: "rgba(255,255,255,0.06)",
    color: t.text,
    fontWeight: 900,
    cursor: "pointer",
  }),

  primaryBtn: (t) => ({
    padding: "10px 14px",
    borderRadius: 12,
    border: `1px solid rgba(59,130,246,0.55)`,
    background: t.accent,
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  }),

  filterTab: (t, active) => ({
    padding: "6px 10px",
    borderRadius: 8,
    border: `1px solid ${active ? "rgba(59,130,246,0.55)" : t.border}`,
    background: active ? t.accent : "rgba(255,255,255,0.06)",
    color: active ? "#fff" : t.text,
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.15s ease",
  }),};
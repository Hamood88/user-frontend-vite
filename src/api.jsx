// user-frontend-vite/src/api.jsx
/* =========================================================
   ✅ USER FRONTEND API (Vite-safe) — COMPLETE for Moondala
   - Prevents /api/api bugs
   - Supports paths with or without "/api"
   - Supports public routes: /api/public/*
   - Uses ONLY userToken (no shop/admin collision)
   ========================================================= */

const DEFAULT_BASE = "https://moondala-backend.onrender.com";

// If running in the browser on the production domain, prefer the
// official API subdomain so the site works even if Vite env vars
// were not set during deployment. This helps quick fixes when
// the frontend is deployed but envs were missed.
function detectProdApiBaseFallback() {
  try {
    if (typeof window === "undefined") return null;
    const host = (window.location && window.location.hostname) || "";
    if (!host) return null;
    // If frontend hosted at moondala.one or www.moondala.one
    // Prefer the currently deployed backend host (Render) which is reachable
    // even when `api.moondala.one` DNS is not configured yet.
    if (host === "moondala.one" || host === "www.moondala.one") {
      return "https://moondala-backend.onrender.com";
    }
    return null;
  } catch {
    return null;
  }
}

/* =========================================
   ✅ API BASE (Vite-safe)
   ========================================= */
function readEnv(name) {
  try {
    return import.meta?.env?.[name];
  } catch {
    return undefined;
  }
}

function normalizeBase(u) {
  const s = String(u || "").trim();
  if (!s) return DEFAULT_BASE;
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

export const API_BASE = normalizeBase(
  readEnv("VITE_API_BASE") ||
    readEnv("VITE_API_URL") ||
    readEnv("VITE_BACKEND_URL") ||
    readEnv("REACT_APP_API_URL") ||
    readEnv("REACT_APP_BACKEND_URL") ||
    detectProdApiBaseFallback() ||
    DEFAULT_BASE
);

// ✅ API root always ends with /api
const API_ROOT = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;

/* ================================
   ✅ IMAGE URL HELPER
   ================================ */
/**
 * Convert relative image paths to absolute URLs
 * Handles uploads from backend (/uploads/...) and fixes localhost URLs
 */
export function toAbsUrl(url) {
  if (!url) return "";
  const s = String(url);
  
  // Fix localhost URLs to use production API_BASE
  if (s.includes("localhost:5000")) return s.replace(/http:\/\/localhost:5000/g, API_BASE);
  if (s.includes("127.0.0.1:5000")) return s.replace(/http:\/\/127\.0\.0\.1:5000/g, API_BASE);
  
  // Already absolute URL
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // ROBUST CLOUDINARY DETECTION (Fixes /uploads/cloudname/... paths)
  const cloudMatch = s.match(/(?:^|\/)([a-z0-9_-]+)\/(image|video)\/upload\/(.+)/i);
  if (cloudMatch) {
    const cloudName = cloudMatch[1];
    const type = cloudMatch[2].toLowerCase();
    const rest = cloudMatch[3];
    if (cloudName !== 'uploads') {
       return `https://res.cloudinary.com/${cloudName}/${type}/upload/${rest}`;
    }
  }

  // Cloudinary-style path (legacy check)
  try {
    const pathNoSlash = s.replace(/^\/+/, "");
    if (/^[a-z0-9_-]+\/(?:image|video)\/upload\//i.test(pathNoSlash)) {
      return `https://res.cloudinary.com/${pathNoSlash}`;
    }
  } catch {}
  
  // Relative path - add API_BASE
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  return `${API_BASE}/${s}`;
}

// Aliases for backward compatibility
export const absUrl = toAbsUrl;
export const fixImageUrl = toAbsUrl;
export const safeImageUrl = (url, fallbackType = 'avatar', user = {}) => {
  if (!url) {
    return fallbackType === 'avatar' ? getDefaultAvatar(user) : null;
  }
  return toAbsUrl(url);
};

/* ================================
   ✅ USER TOKEN KEYS (ONLY)
   ================================ */
const USER_TOKEN_KEY = "userToken";
const LEGACY_TOKEN_KEY = "token";
const USER_OBJ_KEY = "user";

/* ================================
   ✅ TOKEN / SESSION HELPERS
   ================================ */
export function getToken() {
  try {
    return (
      localStorage.getItem(USER_TOKEN_KEY) ||
      localStorage.getItem(LEGACY_TOKEN_KEY) ||
      ""
    );
  } catch {
    return "";
  }
}

export function setToken(token) {
  try {
    if (!token) return;
    localStorage.setItem(USER_TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {}
}

export function clearToken() {
  try {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {}
}

export function setUserSession({ token, user, shop }, role = "user") {
  try {
    if (role === "shop") {
      if (token) localStorage.setItem("shopToken", token);
      if (shop) localStorage.setItem("shop", JSON.stringify(shop));
    } else {
      if (token) setToken(token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
    }
  } catch {}
}

export function getUserSession() {
  try {
    const raw = localStorage.getItem(USER_OBJ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearUserSession() {
  clearToken();
  try {
    localStorage.removeItem(USER_OBJ_KEY);
  } catch {}
}

export function logoutUser() {
  clearUserSession();
  return true;
}

/**
 * ✅ Clear ALL role sessions (prevents collisions in Moondala)
 */
export function clearAllSessions() {
  try {
    // user
    localStorage.removeItem("userToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // shop
    localStorage.removeItem("shopToken");
    localStorage.removeItem("shop");
    localStorage.removeItem("shopId");
    localStorage.removeItem("shopEmail");

    // admin
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    // misc
    localStorage.removeItem("mode");
    localStorage.removeItem("role");
  } catch {}
}

/* ================================
   ✅ INTERNAL HELPERS
   ================================ */
async function parseJsonSafe(res) {
  let text = "";
  try {
    text = await res.text();
  } catch {
    return {};
  }
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text, message: text };
  }
}

function buildAuthHeaders(extra = {}) {
  const token = getToken();
  const headers = { Accept: "application/json", ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * ✅ Handle auth failure WITHOUT redirect loop
 */
function handleAuthFailureIfNeeded(res, data, { clearAll = false } = {}) {
  const status = res.status;
  const msg = String(data?.message || data?.error || data?.raw || "").toLowerCase();

  const looksLikeRouteMissing =
    status === 404 ||
    msg.includes("api route not found") ||
    msg.includes("route not found") ||
    msg.includes("cannot get") ||
    msg.includes("cannot post");

  if (status === 401) {
    if (looksLikeRouteMissing) return;
    if (clearAll) clearAllSessions();
    else clearUserSession();
  }
}

/**
 * ✅ Build URL safely
 */
export function buildUrl(path) {
  let p = String(path || "").trim();
  if (!p) return API_ROOT;

  // absolute
  if (p.startsWith("http://") || p.startsWith("https://")) return p;

  // ensure leading slash
  if (!p.startsWith("/")) p = "/" + p;

  // allow direct assets
  if (p.startsWith("/uploads/")) return `${API_BASE}${p}`;

  // if already /api/... keep it
  if (p.startsWith("/api/")) return `${API_BASE}${p}`;

  // otherwise add /api prefix
  return `${API_ROOT}${p}`;
}

/**
 * ✅ Get default avatar when user has no profile picture
 */
export function getDefaultAvatar(user = {}) {
  // You can replace this with a default avatar URL or data URI
  const name = user?.firstName || user?.displayName || user?.username || "U";
  const initial = name.charAt(0).toUpperCase();
  
  // Create a simple colored avatar based on the user's initial
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
  const colorIndex = initial.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];
  
  // Return a data URI for a simple avatar
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="${color}"/>
      <text x="20" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white" font-weight="bold">${initial}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/* ================================
   ✅ CORE REQUEST
   ================================ */
export async function request(
  path,
  {
    method = "GET",
    body,
    headers = {},
    auth = true,
    debug = false,
    clearAllOn401 = false,
    isFormData: isFormDataOpt = false,
  } = {}
) {
  const url = buildUrl(path);
  const hasBody = body !== undefined && body !== null;

  const isFormData =
    isFormDataOpt ||
    (hasBody && typeof FormData !== "undefined" && body instanceof FormData);

  const isStringBody = hasBody && typeof body === "string";

  const finalHeaders = auth
    ? buildAuthHeaders(headers)
    : { Accept: "application/json", ...headers };

  // JSON content-type only when NOT FormData
  if (hasBody && !isFormData) {
    const hasCT = Object.keys(finalHeaders).some(
      (k) => k.toLowerCase() === "content-type"
    );
    if (!hasCT) finalHeaders["Content-Type"] = "application/json";
  }

  let fetchBody;
  if (hasBody) {
    if (isFormData) fetchBody = body;
    else if (isStringBody) fetchBody = body;
    else fetchBody = JSON.stringify(body);
  }

  if (debug) {
    // eslint-disable-next-line no-console
    console.log("[api] request", { method, url, hasBody });
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: fetchBody,
    credentials: "include",
  });

  const data = await parseJsonSafe(res);
  handleAuthFailureIfNeeded(res, data, { clearAll: clearAllOn401 });

  if (!res.ok) {
    const msg =
      data?.message || data?.error || data?.raw || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ================================
   ✅ BASIC HTTP HELPERS
   ================================ */
export function apiGet(path, opts = {}) {
  return request(path, { method: "GET", ...opts });
}
export function apiPost(path, body, opts = {}) {
  return request(path, { method: "POST", body, ...opts });
}
export function apiPut(path, body, opts = {}) {
  return request(path, { method: "PUT", body, ...opts });
}
export function apiPatch(path, body, opts = {}) {
  return request(path, { method: "PATCH", body, ...opts });
}
export function apiDelete(path, opts = {}) {
  return request(path, { method: "DELETE", ...opts });
}
export function apiUpload(path, formData, opts = {}) {
  return request(path, {
    method: "POST",
    body: formData,
    ...opts,
    isFormData: true,
    auth: true,
  });
}
export function apiUploadPut(path, formData, opts = {}) {
  return request(path, {
    method: "PUT",
    body: formData,
    ...opts,
    isFormData: true,
    auth: true,
  });
}

/* ================================
   ✅ AUTH (User)
   ================================ */
export async function userRegister(payload) {
  const data = await apiPost("/api/auth/register", payload, { auth: false });
  const token = data?.token || data?.userToken || data?.accessToken || "";
  const user = data?.user || data?.data?.user || null;
  if (token && user) setUserSession({ token, user });
  return data;
}

export async function userLogin(payload) {
  const data = await apiPost("/api/auth/login", payload, { auth: false });
  const token = data?.token || data?.userToken || data?.accessToken || "";
  const user = data?.user || data?.data?.user || null;
  if (token && user) setUserSession({ token, user });
  return data;
}

export async function getMe() {
  const tries = [
    "/api/user-profile/me",
    "/api/users/me",
    "/api/auth/me",
    "/api/users/profile/me",
    "/api/me",
  ];

  let lastErr = null;
  for (const p of tries) {
    try {
      const d = await apiGet(p);
      return d;
    } catch (e) {
      lastErr = e;
      if (e?.status === 404) continue;
      // for other errors, rethrow so callers can handle auth failures
      throw e;
    }
  }

  // Not found — return null instead of throwing so callers can handle missing endpoints
  return null;
}

/**
 * ✅ Get other user's profile with privacy handling
 * Returns:
 * - { ok: true, user: {...} } if accessible
 * - { ok: false, reason: "profile_private", canAddFriend: true, user: {...} } if private
 * - { ok: false, message: "..." } if user not found
 */
export async function getUserProfile(userId) {
  if (!userId) throw new Error("userId is required");
  try {
    const data = await apiGet(`/api/users/${userId}`);
    return { ok: true, user: data?.user || data };
  } catch (err) {
    // ✅ Handle private account (403) - return user data to show "Add Friend" button
    if (err?.status === 403 && err?.data) {
      return {
        ok: false,
        reason: err.data.reason || "profile_private",
        canAddFriend: err.data.canAddFriend === true,
        message: err.data.message || "This profile is private",
        user: err.data.user || null,
      };
    }
    // Handle other errors
    throw err;
  }
}

/* ================================
   ✅ FRIENDS + REQUESTS
   ================================ */
export function getMyFriends() {
  return apiGet("/api/friends/mine");
}

export function sendFriendRequest(toUserId, message = "") {
  return apiPost("/api/friends/request", {
    toUserId: String(toUserId || "").trim(),
    message: String(message || "").trim(),
  });
}

export async function getFriendRequests() {
  const data = await apiGet("/api/friends/requests");
  return { incoming: Array.isArray(data?.incoming) ? data.incoming : [] };
}

export function respondFriendRequest(requestId, action) {
  const a = String(action || "").trim().toLowerCase();
  const finalAction = a === "accept" ? "accept" : "decline";
  return apiPost("/api/friends/respond", {
    requestId: String(requestId || "").trim(),
    action: finalAction,
  });
}

/* ================================
   ✅ POSTS
   ================================ */
export function getPostsByUser(userId) {
  const id = String(userId || "").trim();
  if (!id) throw new Error("Missing userId");
  return apiGet(`/api/posts/user/${encodeURIComponent(id)}`);
}

export function getMyFeed() {
  return apiGet("/api/posts/feed");
}

export function likePost(postId) {
  const id = String(postId || "").trim();
  if (!id) throw new Error("Missing postId");
  return apiPost(`/api/posts/${encodeURIComponent(id)}/like`, {});
}

export function addComment(postId, { text, parentComment = null } = {}) {
  const id = String(postId || "").trim();
  if (!id) throw new Error("Missing postId");
  return apiPost(`/api/posts/${encodeURIComponent(id)}/comment`, {
    text: String(text || "").trim(),
    parentComment: parentComment || null,
  });
}

export function likeComment(postId, commentId) {
  const pid = String(postId || "").trim();
  const cid = String(commentId || "").trim();
  if (!pid) throw new Error("Missing postId");
  if (!cid) throw new Error("Missing commentId");
  return apiPost(`/api/posts/${encodeURIComponent(pid)}/comments/${encodeURIComponent(cid)}/like`, {});
}

export function updatePost(postId, { text } = {}) {
  const id = String(postId || "").trim();
  if (!id) throw new Error("Missing postId");
  return apiPut(`/api/posts/${encodeURIComponent(id)}`, {
    text: String(text || "").trim(),
  });
}

export function deletePost(postId) {
  const id = String(postId || "").trim();
  if (!id) throw new Error("Missing postId");
  return apiDelete(`/api/posts/${encodeURIComponent(id)}`);
}

/* ================================
   ✅ NOTIFICATIONS
   ================================ */
export async function getMyNotifications(limit = 50, skip = 0) {
  const data = await apiGet(
    `/api/notifications?limit=${encodeURIComponent(limit)}&skip=${encodeURIComponent(skip)}`
  );

  const list = Array.isArray(data?.notifications)
    ? data.notifications
    : Array.isArray(data?.data?.notifications)
    ? data.data.notifications
    : Array.isArray(data)
    ? data
    : [];

  const unreadCount = Number(data?.unreadCount ?? data?.data?.unreadCount ?? 0);

  return { notifications: list, unreadCount };
}

export function markNotificationRead(id) {
  const nid = String(id || "").trim();
  if (!nid) throw new Error("Missing notification id");
  return apiPatch(`/api/notifications/${encodeURIComponent(nid)}/read`, {});
}

export function markAllNotificationsRead() {
  return apiPatch(`/api/notifications/read-all`, {});
}

export function markConversationMessageNotificationsRead(conversationId) {
  const cid = String(conversationId || "").trim();
  if (!cid) throw new Error("Missing conversationId");
  return apiPut(
    `/api/notifications/conversation/${encodeURIComponent(cid)}/read-messages`,
    {}
  );
}

/* ================================
   ✅ ORDERS
   ================================ */
export async function getMyOrders() {
  const data = await apiGet("/api/orders/mine");
  return Array.isArray(data?.orders)
    ? data.orders
    : Array.isArray(data?.data?.orders)
    ? data.data.orders
    : Array.isArray(data)
    ? data
    : [];
}

export function createOrder({ productId, quantity = 1 } = {}) {
  const pid = String(productId || "").trim();
  if (!pid) throw new Error("Missing productId");
  const qty = Number(quantity);
  return apiPost("/api/orders", {
    productId: pid,
    quantity: Number.isFinite(qty) ? qty : 1,
  });
}

export function markOrderPaid(orderId, { force = false } = {}) {
  const id = String(orderId || "").trim();
  if (!id) throw new Error("Missing orderId");
  return apiPost(`/api/orders/${encodeURIComponent(id)}/mark-paid`, {
    force: !!force,
  });
}

/* ================================
   ✅ COMMISSIONS (Order proof)
   ================================ */
export function getOrderCommissionProof(orderId) {
  const id = String(orderId || "").trim();
  if (!id) throw new Error("Missing orderId");
  return apiGet(`/api/commissions/order/${encodeURIComponent(id)}`);
}

/* ================================
   ✅ ASK CONSENT (Ask Previous Buyers)
   ================================ */
export function setBuyerConsent(orderId, { allowQuestions, anonymousQuestions = true } = {}) {
  const id = String(orderId || "").trim();
  if (!id) throw new Error("Missing orderId");

  return apiPatch(`/api/orders/${encodeURIComponent(id)}/ask-consent`, {
    allowQuestions: !!allowQuestions,
    anonymousQuestions:
      typeof anonymousQuestions === "boolean" ? anonymousQuestions : true,
  });
}

/* ✅ FIX: what MyOrders.jsx imports */
export function setOrderAskConsent(orderId, body = {}) {
  return setBuyerConsent(orderId, {
    allowQuestions: !!body.allowQuestions,
    anonymousQuestions:
      typeof body.anonymousQuestions === "boolean" ? body.anonymousQuestions : true,
  });
}

/* ================================
   ✅ RETURNS (USER)
   ================================ */
export async function getMyReturns(status = "") {
  const s = String(status || "").trim().toLowerCase();
  const q = s ? `?status=${encodeURIComponent(s)}` : "";

  const tries = [
    `/api/returns/mine${q}`,
    `/api/returns/my${q}`,
    `/api/returns/me${q}`,
    `/api/returns${q}`,
    `/api/return-requests/mine${q}`,
    `/api/return-requests/my${q}`,
    `/api/return-requests/me${q}`,
    `/api/returnRequests/my${q}`,
  ];

  for (const p of tries) {
    try {
      const res = await apiGet(p);
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.returns)) return res.returns;
      if (Array.isArray(res?.data?.returns)) return res.data.returns;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.items)) return res.items;
      return [];
    } catch (e) {
      if (e?.status === 404) continue;
      return [];
    }
  }

  return [];
}

export async function createReturnRequest(payload = {}) {
  const body = {
    orderId: String(payload.orderId || "").trim(),
    productId: String(payload.productId || "").trim(),
    reason: String(payload.reason || "").trim(),
    note: String(payload.note || "").trim(),
    photosBase64: Array.isArray(payload.photosBase64) ? payload.photosBase64 : [],
    refundAmount:
      payload.refundAmount === "" ||
      payload.refundAmount === null ||
      payload.refundAmount === undefined
        ? undefined
        : Number(payload.refundAmount),
  };

  if (!body.orderId) throw new Error("orderId is required");
  if (!body.reason) throw new Error("reason is required");

  const tries = [`/api/returns/request`, `/api/returns`, `/api/returns/create`];

  let lastErr = null;
  for (const p of tries) {
    try {
      return await apiPost(p, body);
    } catch (e) {
      lastErr = e;
      if (e?.status === 404) continue;
      throw e;
    }
  }

  throw new Error(lastErr?.message || "Create return endpoint not found on backend.");
}

/* ================================
   ✅ MESSAGES / CONVERSATIONS
   ================================ */
export async function getUserConversations() {
  const data = await apiGet("/api/messages/conversations");
  if (Array.isArray(data?.conversations)) return data.conversations;
  if (Array.isArray(data)) return data;
  return [];
}

export async function getOrCreateConversation({
  participantType,
  participantId,
  topic = "general",
  productId = null,
  shopId = null,
} = {}) {
  if (!participantType) throw new Error("Missing participantType");
  if (!participantId) throw new Error("Missing participantId");

  const cleanType = String(participantType).toLowerCase().trim();
  if (!["user", "shop"].includes(cleanType)) {
    throw new Error("participantType must be 'user' or 'shop'");
  }

  const t = String(topic || "general").toLowerCase().trim();
  const finalTopic =
    t === "ask-buyer" ? "ask-buyer" : t === "product" ? "product" : "general";

  const data = await apiPost("/api/messages/conversations", {
    participantType: cleanType,
    participantId: String(participantId),
    topic: finalTopic,
    productId: productId || null,
    shopId: shopId || null,
  });

  const convo = data?.conversation || null;
  const id = convo?._id || data?._id || data?.conversationId || data?.id || "";
  if (!id) throw new Error("Conversation not created (missing id)");

  return { _id: String(id), conversation: convo || { _id: String(id) } };
}

export function getOrCreateShopConversation({
  shopId,
  topic = "general",
  productId = null,
} = {}) {
  if (!shopId) throw new Error("Missing shopId");
  return getOrCreateConversation({
    participantType: "shop",
    participantId: shopId,
    topic,
    productId: topic === "product" ? productId || null : null,
    shopId,
  });
}

/* =========================================================
   ✅ COMPAT EXPORTS (prevents old imports from crashing app)
   ========================================================= */

/**
 * ✅ Alias for components that import startShopConversation
 */
export function startShopConversation({
  shopId,
  topic = "general",
  productId = null,
} = {}) {
  return getOrCreateShopConversation({ shopId, topic, productId });
}

/**
 * ✅ Alias for components that import startUserConversation
 */
export function startUserConversation({
  userId,
  topic = "general",
  productId = null,
  shopId = null,
} = {}) {
  if (!userId) throw new Error("Missing userId");
  return getOrCreateConversation({
    participantType: "user",
    participantId: String(userId),
    topic,
    productId,
    shopId,
  });
}

/* ✅ REQUIRED by ProductDetailsUnified */
export async function startAskBuyerConversation({ toUserId, productId } = {}) {
  const u = String(toUserId || "").trim();
  const p = String(productId || "").trim();
  if (!u) throw new Error("Missing toUserId");
  if (!p) throw new Error("Missing productId");

  const data = await apiPost("/api/messages/conversations/start-ask-buyer", {
    toUserId: u,
    productId: p,
  });

  const id =
    data?.conversationId ||
    data?._id ||
    data?.conversation?._id ||
    data?.conversation?.id ||
    "";
  if (!id) throw new Error("Conversation not created (missing conversationId)");

  return { ...data, conversationId: String(id) };
}

/**
 * ✅ ONE (single) getConversationMessages implementation (no duplicates)
 */
export async function getConversationMessages(conversationId) {
  if (!conversationId) throw new Error("Missing conversationId");
  const data = await apiGet(
    `/api/messages/${encodeURIComponent(conversationId)}/messages`
  );
  if (Array.isArray(data?.messages)) return data.messages;
  if (Array.isArray(data)) return data;
  return [];
}

export function sendConversationMessage(conversationIdOrObj, { text = "", files } = {}) {
  // backward-compatible: accept either (conversationId, { text, files })
  // or a single object { conversationId, text, files }
  let conversationId = String(conversationIdOrObj || "").trim();
  if (!conversationId && conversationIdOrObj && typeof conversationIdOrObj === "object") {
    text = conversationIdOrObj.text !== undefined ? conversationIdOrObj.text : text;
    files = conversationIdOrObj.files !== undefined ? conversationIdOrObj.files : files;
    conversationId = String(
      conversationIdOrObj.conversationId || conversationIdOrObj._id || conversationIdOrObj.id || ""
    ).trim();
  }

  if (!conversationId) throw new Error("Missing conversationId");

  const arr = Array.isArray(files) ? files : Array.from(files || []);
  const msg = String(text || "").trim();

  if (arr.length > 0) {
    const fd = new FormData();
    if (msg) fd.append("text", msg);
    arr
      .filter(Boolean)
      .slice(0, 10)
      .forEach((f) => fd.append("files", f));

    return request(`/api/messages/${encodeURIComponent(conversationId)}/messages`, {
      method: "POST",
      body: fd,
      auth: true,
      isFormData: true,
    });
  }

  return apiPost(`/api/messages/${encodeURIComponent(conversationId)}/messages`, {
    text: msg,
  });
}

/* ================================
   ✅ PUBLIC INDUSTRIES (Mall sidebar)
   ================================ */
export async function getPublicIndustries() {
  const data = await apiGet("/api/public/industries", { auth: false });
  return Array.isArray(data?.industries)
    ? data.industries
    : Array.isArray(data)
    ? data
    : [];
}

/* ================================
   ✅ MALL FEED
   ================================ */
export async function getMallFeed(limit = 30) {
  const l = Math.max(1, Math.min(100, Number(limit || 30)));
  const tries = [
    `/api/mall/feed?limit=${encodeURIComponent(l)}`,
    `/api/mall?limit=${encodeURIComponent(l)}`,
    `/api/products/mall?limit=${encodeURIComponent(l)}`,
    `/api/mall/products?limit=${encodeURIComponent(l)}`,
    `/api/mall/public/products?limit=${encodeURIComponent(l)}`,
    `/api/products/public?limit=${encodeURIComponent(l)}`,
  ];

  let lastErr = null;
  for (const p of tries) {
    try {
      const d = await apiGet(p, { auth: !!getToken() });
      const list = Array.isArray(d?.products)
        ? d.products
        : Array.isArray(d?.data?.products)
        ? d.data.products
        : Array.isArray(d)
        ? d
        : [];
      return list;
    } catch (e) {
      lastErr = e;
      if (e?.status === 404) continue;
    }
  }
  throw new Error(lastErr?.message || "Mall feed endpoint not found on backend.");
}

/* ================================
   ✅ PUBLIC SHOP ROUTES
   ================================ */
export function getPublicShop(shopId) {
  const id = String(shopId || "").trim();
  if (!id) throw new Error("Missing shopId");
  return apiGet(`/api/public/shops/${encodeURIComponent(id)}`, { auth: false });
}

export function getPublicShopFeed(shopId, page = 1, limit = 20) {
  const id = String(shopId || "").trim();
  if (!id) throw new Error("Missing shopId");

  const p = Math.max(1, Number(page || 1));
  const l = Math.min(50, Math.max(1, Number(limit || 20)));

  return apiGet(
    `/api/public/shops/${encodeURIComponent(id)}/feed?page=${encodeURIComponent(
      p
    )}&limit=${encodeURIComponent(l)}`,
    { auth: false }
  );
}

export function getPublicShopMall(shopId) {
  const id = String(shopId || "").trim();
  if (!id) throw new Error("Missing shopId");
  return apiGet(`/api/public/shops/${encodeURIComponent(id)}/mall`, { auth: false });
}

/* =========================================================
   ✅ REVIEWS (USER) (fixes createProductReview export)
   ========================================================= */
export async function getProductReviews(productId) {
  const id = String(productId || "").trim();
  if (!id) throw new Error("Missing productId");

  const tries = [
    `/api/reviews/product/${encodeURIComponent(id)}`,
    `/api/reviews/${encodeURIComponent(id)}`,
    `/api/products/${encodeURIComponent(id)}/reviews`,
    `/api/product/${encodeURIComponent(id)}/reviews`,
  ];

  let lastErr = null;
  for (const p of tries) {
    try {
      const d = await apiGet(p, { auth: !!getToken() });
      if (Array.isArray(d?.reviews)) return d.reviews;
      if (Array.isArray(d?.data?.reviews)) return d.data.reviews;
      if (Array.isArray(d)) return d;
      return [];
    } catch (e) {
      lastErr = e;
      if (e?.status === 404) continue;
      throw e;
    }
  }

  throw new Error(lastErr?.message || "Get reviews endpoint not found on backend.");
}

export async function createProductReview(productId, body = {}) {
  const id = String(productId || "").trim();
  if (!id) throw new Error("Missing productId");

  const payload = body && typeof body === "object" ? body : {};

  const tries = [
    `/api/reviews/product/${encodeURIComponent(id)}`,
    `/api/reviews/${encodeURIComponent(id)}`,
    `/api/products/${encodeURIComponent(id)}/reviews`,
    `/api/product/${encodeURIComponent(id)}/reviews`,
  ];

  let lastErr = null;
  for (const p of tries) {
    try {
      return await apiPost(p, payload, { auth: true });
    } catch (e) {
      lastErr = e;
      if (e?.status === 404) continue;
      throw e;
    }
  }

  throw new Error(lastErr?.message || "Create review endpoint not found on backend.");
}

/* ================================
   ✅ REFERRAL NETWORK
   ================================ */
export async function getReferralNetwork() {
  try {
    const [downlineData, earningsData] = await Promise.all([
      apiGet("/api/users/downline-counts", { auth: true }),
      apiGet("/api/users/earnings", { auth: true }),
    ]);

    return {
      total: downlineData.total || 0,
      totalEarned: earningsData.totalEarned || 0,
      totalAvailable: earningsData.totalAvailable || 0,
      totalPending: earningsData.totalPending || 0,
      levels: downlineData.levels || {},
      maxLevels: downlineData.maxLevels || 0,
    };
  } catch (e) {
    console.error("Failed to fetch referral network:", e);
    return {
      total: 0,
      totalEarned: 0,
      totalAvailable: 0,
      totalPending: 0,
      levels: {},
      ok: false,
    };
  }
}

/* ================================
   ✅ TOP INVITERS (Leaderboard)
   ================================ */
export async function getTopInviters(limit = 5) {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    const data = await apiGet(`/api/top-inviters?${params.toString()}`, { auth: false });
    return data?.topInviters || [];
  } catch (e) {
    console.error("Failed to fetch top inviters:", e);
    return [];
  }
}

/* ================================
   ✅ SMALL HELPERS
   ================================ */
export function pickId(x) {
  if (!x) return "";
  return String(x._id || x.id || x.productId || x.shopId || x.userId || "").trim();
}

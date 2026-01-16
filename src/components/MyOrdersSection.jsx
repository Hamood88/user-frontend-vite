// user-frontend-vite/src/components/MyOrdersSection.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  API_BASE,
  getMyOrders,
  apiPatch,
  apiDelete,

  // ✅ RETURNS
  getMyReturns,
  createReturnRequest,

  // ✅ buyer consent for "Ask previous buyers"
  setOrderAskConsent,
} from "../api.jsx";

// ✅ UNIFIED REVIEWS COMPONENT
import ProductReviews from "./ProductReviews.jsx";

/* =========================
   helpers
   ========================= */
function money(v, currency = "USD") {
  const n = Number(v || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
  }
}

function prettyDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleString();
}

function shortId(x) {
  if (!x) return "";
  const s = String(x);
  return s.length > 10 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s;
}

function statusPillStyle(status) {
  const s = String(status || "").toLowerCase();
  if (s === "paid")
    return { borderColor: "rgba(34,197,94,0.45)", background: "rgba(34,197,94,0.14)" };
  if (s === "completed" || s === "complete")
    return { borderColor: "rgba(59,130,246,0.45)", background: "rgba(59,130,246,0.14)" };
  if (s === "shipped")
    return { borderColor: "rgba(168,85,247,0.45)", background: "rgba(168,85,247,0.14)" };
  if (s === "cancelled")
    return { borderColor: "rgba(239,68,68,0.45)", background: "rgba(239,68,68,0.14)" };
  if (s === "refunded")
    return { borderColor: "rgba(34,197,94,0.45)", background: "rgba(34,197,94,0.14)" };
  return { borderColor: "rgba(148,163,184,0.35)", background: "rgba(148,163,184,0.12)" };
}

function returnPillStyle(status) {
  const s = String(status || "").toLowerCase();
  if (s === "requested")
    return { borderColor: "rgba(245,158,11,0.55)", background: "rgba(245,158,11,0.16)" };
  if (s === "approved")
    return { borderColor: "rgba(34,197,94,0.55)", background: "rgba(34,197,94,0.14)" };
  if (s === "rejected")
    return { borderColor: "rgba(239,68,68,0.55)", background: "rgba(239,68,68,0.14)" };
  if (s === "shipped_back")
    return { borderColor: "rgba(168,85,247,0.55)", background: "rgba(168,85,247,0.14)" };
  if (s === "received")
    return { borderColor: "rgba(59,130,246,0.55)", background: "rgba(59,130,246,0.14)" };
  if (s === "refunded" || s === "completed" || s === "complete")
    return { borderColor: "rgba(34,197,94,0.55)", background: "rgba(34,197,94,0.14)" };
  return { borderColor: "rgba(148,163,184,0.35)", background: "rgba(148,163,184,0.12)" };
}

// ✅ “transaction complete” check
function isTransactionComplete(order) {
  const s = String(order?.status || order?.orderStatus || "").toLowerCase().trim();
  return s === "completed" || s === "complete" || s === "paid";
}

// best-effort productId picker
function pickProductId(order) {
  return (
    order?.productId?._id ||
    order?.productId ||
    order?.product?._id ||
    order?.product ||
    order?.product_id ||
    ""
  );
}

// best-effort return->orderId picker
function pickReturnOrderId(r) {
  return r?.orderId?._id || r?.orderId || r?.order?._id || r?.order || r?.order_id || "";
}

// ✅ pick product image url from many possible shapes
function pickProductImage(order) {
  const p = order?.productId || order?.product || order?.productObj || null;

  const candidates = [
    order?.productImage,
    order?.image,
    order?.imageUrl,
    order?.productImageUrl,

    p?.image,
    p?.imageUrl,
    p?.thumbnail,
    p?.cover,
    p?.photo,

    Array.isArray(p?.images) ? p.images[0] : null,
    Array.isArray(p?.photos) ? p.photos[0] : null,
    Array.isArray(order?.images) ? order.images[0] : null,

    p?.media?.image,
    Array.isArray(p?.media?.images) ? p.media.images[0] : null,
  ];

  const v = candidates.find((x) => typeof x === "string" && x.trim());
  return v ? v.trim() : "";
}

// ✅ normalize to full URL (works with /uploads/..)
function toAbsUrl(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  const base = String(API_BASE || "http://localhost:5000").trim();
  const b = base.endsWith("/") ? base.slice(0, -1) : base;

  if (s.startsWith("/")) return `${b}${s}`;
  if (s.startsWith("uploads/")) return `${b}/${s}`;
  if (!s.includes("/")) return `${b}/uploads/${s}`;
  return `${b}/${s}`;
}

async function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

// ✅ safe revoke
function revokeAllPreviews(previews) {
  try {
    (previews || []).forEach((p) => p?.url && URL.revokeObjectURL(p.url));
  } catch {}
}

export default function MyOrdersSection() {
  const [orders, setOrders] = useState([]);
  const [returnsMap, setReturnsMap] = useState({}); // orderId -> return object

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ FILTER: all / completed / shipped / returned
  const [filter, setFilter] = useState("all");

  // ✅ Reviews: open one order review panel at a time
  const [openReviewFor, setOpenReviewFor] = useState(""); // orderId string

  // return modal
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnFor, setReturnFor] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [returnSaving, setReturnSaving] = useState(false);
  const [returnErr, setReturnErr] = useState("");

  // ✅ Return photos
  const [returnPhotos, setReturnPhotos] = useState([]); // File[]
  const [returnPhotoPreviews, setReturnPhotoPreviews] = useState([]); // { url }[]
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const RETURN_REASONS = useMemo(
    () => [
      "Damaged item",
      "Wrong item",
      "Not as described",
      "Missing parts",
      "Arrived late",
      "Changed my mind",
      "Other",
    ],
    []
  );

  // action loading per order id
  const [busyId, setBusyId] = useState("");

  // ✅ consent saving per order id
  const [consentSaving, setConsentSaving] = useState({});

  // ✅ prompt modal after transaction complete (shows once per order)
  const [consentPromptOpen, setConsentPromptOpen] = useState(false);
  const [consentPromptOrder, setConsentPromptOrder] = useState(null);
  const [consentPromptAllow, setConsentPromptAllow] = useState(true);
  const [consentPromptAnon, setConsentPromptAnon] = useState(true);
  const [consentPromptErr, setConsentPromptErr] = useState("");

  function hasAskedConsentAlready(orderId) {
    try {
      return localStorage.getItem(`moondala_askConsent_asked_${orderId}`) === "1";
    } catch {
      return false;
    }
  }

  function markAskedConsent(orderId) {
    try {
      localStorage.setItem(`moondala_askConsent_asked_${orderId}`, "1");
    } catch {}
  }

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const [ordersRes, returnsRes] = await Promise.all([
        getMyOrders(),
        getMyReturns ? getMyReturns() : Promise.resolve([]),
      ]);

      const list = Array.isArray(ordersRes)
        ? ordersRes
        : Array.isArray(ordersRes?.orders)
        ? ordersRes.orders
        : [];
      setOrders(list);

      const retList = Array.isArray(returnsRes)
        ? returnsRes
        : Array.isArray(returnsRes?.returns)
        ? returnsRes.returns
        : [];

      const map = {};
      for (const r of retList) {
        const oid = pickReturnOrderId(r);
        if (oid) map[String(oid)] = r;
      }
      setReturnsMap(map);
    } catch (err) {
      setError(err?.message || "Failed to load orders");
      setOrders([]);
      setReturnsMap({});
    } finally {
      setLoading(false);
    }
  }

  function resetReturnPhotos() {
    revokeAllPreviews(returnPhotoPreviews);
    setReturnPhotos([]);
    setReturnPhotoPreviews([]);
  }

  function openReturnModal(order) {
    setReturnErr("");
    setReturnFor(order);
    setReturnReason("");
    setReturnNote("");
    resetReturnPhotos();
    setReturnOpen(true);
  }

  function closeReturnModal() {
    if (returnSaving) return;
    setReturnOpen(false);
    setReturnFor(null);
    setReturnReason("");
    setReturnNote("");
    setReturnErr("");
    resetReturnPhotos();
  }

  function onPickPhotos(files) {
    const arr = Array.from(files || []);
    if (!arr.length) return;

    const MAX_FILES = 5;
    const MAX_MB = 6;

    const safe = [];
    for (const f of arr) {
      if (!String(f.type || "").startsWith("image/")) continue;
      const mb = f.size / (1024 * 1024);
      if (mb > MAX_MB) {
        setReturnErr(`One photo is too large. Max ${MAX_MB}MB each.`);
        continue;
      }
      safe.push(f);
    }

    if (!safe.length) return;

    const merged = [...returnPhotos, ...safe].slice(0, MAX_FILES);

    revokeAllPreviews(returnPhotoPreviews);
    const previews = merged.map((f) => ({ url: URL.createObjectURL(f) }));

    setReturnPhotos(merged);
    setReturnPhotoPreviews(previews);
  }

  function removePhoto(idx) {
    const nextFiles = returnPhotos.filter((_, i) => i !== idx);

    revokeAllPreviews(returnPhotoPreviews);
    const nextPreviews = nextFiles.map((f) => ({ url: URL.createObjectURL(f) }));

    setReturnPhotos(nextFiles);
    setReturnPhotoPreviews(nextPreviews);
  }

  async function submitReturn() {
    const o = returnFor;
    if (!o?._id) return;

    const orderId = String(o._id);
    const productId = String(pickProductId(o) || "");
    const reason = String(returnReason || "").trim();
    const note = String(returnNote || "").trim();

    if (!productId) {
      setReturnErr("I can’t find productId in this order. Send me one order JSON and I’ll map it.");
      return;
    }
    if (!reason) {
      setReturnErr("Please choose a reason.");
      return;
    }

    setReturnSaving(true);
    setReturnErr("");
    try {
      if (!createReturnRequest) throw new Error("createReturnRequest is not available in ../api");

      let photosBase64 = [];
      if (returnPhotos.length) {
        const toConvert = returnPhotos.slice(0, 5);
        photosBase64 = await Promise.all(toConvert.map((f) => fileToDataURL(f)));
      }

      await createReturnRequest({ orderId, productId, reason, note, photosBase64 });

      closeReturnModal();
      await loadOrders();
      alert("✅ Return request submitted");
    } catch (e) {
      setReturnErr(e?.message || "Failed to create return request");
    } finally {
      setReturnSaving(false);
    }
  }

  async function cancelOrder(order, hasReturn) {
    const id = order?._id;
    if (!id) return;

    if (hasReturn) return alert("You can’t cancel an order that has a return request.");

    const s = String(order.status || "pending").toLowerCase();
    if (s === "shipped" || s === "completed" || s === "complete")
      return alert("You can’t cancel after shipped/completed.");
    if (s === "cancelled") return alert("This order is already cancelled.");

    const ok = window.confirm("Cancel this order? The shop will be notified.");
    if (!ok) return;

    setBusyId(String(id));
    try {
      await apiPatch(`/api/orders/${id}/cancel`, { reason: "" });
      setOrders((prev) =>
        prev.map((x) => (String(x._id) === String(id) ? { ...x, status: "cancelled" } : x))
      );
    } catch (e) {
      alert(e?.message || "Cancel failed");
    } finally {
      setBusyId("");
    }
  }

  async function deleteOrder(order, hasReturn) {
    const id = order?._id;
    if (!id) return;

    if (hasReturn) return alert("You can’t delete an order that has a return request.");

    const ok = window.confirm("Delete this order from your list? (This only hides it for you)");
    if (!ok) return;

    setBusyId(String(id));
    try {
      await apiDelete(`/api/orders/${id}`);
      setOrders((prev) => prev.filter((x) => String(x._id) !== String(id)));
    } catch (e) {
      alert(e?.message || "Delete failed");
    } finally {
      setBusyId("");
    }
  }

  // ✅ save ask-consent (Allow questions + anonymous)
  async function saveConsent(orderId, allowQuestions, anonymousQuestions) {
    const oid = String(orderId || "");
    if (!oid) return;

    setConsentSaving((prev) => ({ ...prev, [oid]: true }));
    try {
      await setOrderAskConsent(oid, { allowQuestions, anonymousQuestions });

      // update local state (instant UI update)
      setOrders((prev) =>
        prev.map((o) => {
          if (String(o._id) !== oid) return o;
          return { ...o, allowQuestions, anonymousQuestions };
        })
      );
    } catch (e) {
      alert(e?.message || "Failed to save consent");
      throw e;
    } finally {
      setConsentSaving((prev) => ({ ...prev, [oid]: false }));
    }
  }

  /* =========================================================
     ✅ AUTO POPUP after transaction complete (ONCE per order)
     ========================================================= */
  useEffect(() => {
    if (loading) return;
    if (!orders || orders.length === 0) return;
    if (consentPromptOpen) return;

    const eligible = orders.find((o) => {
      const oid = String(o?._id || "");
      if (!oid) return false;
      if (!isTransactionComplete(o)) return false;

      // if already opted in or already asked once, don't ask
      if (!!o?.allowQuestions) return false;
      if (hasAskedConsentAlready(oid)) return false;

      return true;
    });

    if (!eligible) return;

    const oid = String(eligible._id);
    setConsentPromptOrder(eligible);
    setConsentPromptAllow(true);
    setConsentPromptAnon(true);
    setConsentPromptErr("");
    setConsentPromptOpen(true);

    markAskedConsent(oid);
  }, [loading, orders, consentPromptOpen]);

  async function submitConsentPrompt() {
    const o = consentPromptOrder;
    const oid = String(o?._id || "");
    if (!oid) return;

    setConsentPromptErr("");
    try {
      await saveConsent(oid, !!consentPromptAllow, !!consentPromptAnon);
      setConsentPromptOpen(false);
      setConsentPromptOrder(null);
    } catch (e) {
      setConsentPromptErr(e?.message || "Failed to save consent");
    }
  }

  function closeConsentPrompt() {
    setConsentPromptOpen(false);
    setConsentPromptOrder(null);
    setConsentPromptErr("");
  }

  useEffect(() => {
    loadOrders();
    return () => {
      revokeAllPreviews(returnPhotoPreviews);
    };
    // eslint-disable-next-line
  }, []);

  // ✅ apply filter
  const filteredOrders = useMemo(() => {
    const f = String(filter || "all").toLowerCase();
    if (f === "all") return orders;

    return orders.filter((o) => {
      const id = String(o?._id || o?.id || "");
      const st = String(o?.status || o?.orderStatus || "pending").toLowerCase();
      const hasReturn = !!returnsMap[id];

      if (f === "returned") return hasReturn;
      if (f === "completed") return st === "completed" || st === "complete" || st === "paid";
      if (f === "shipped") return st === "shipped";

      return true;
    });
  }, [orders, returnsMap, filter]);

  function FilterBtn({ id, label }) {
    const active = String(filter) === String(id);
    return (
      <button
        onClick={() => setFilter(id)}
        style={{
          ...S.filterBtn,
          ...(active ? S.filterBtnActive : null),
        }}
        type="button"
      >
        {label}
      </button>
    );
  }

  return (
    <div style={S.wrap}>
      <div style={S.headerRow}>
        <h2 style={S.h2}>My Orders</h2>

        <div style={S.headerRight}>
          <div style={S.filters}>
            <FilterBtn id="all" label="All" />
            <FilterBtn id="completed" label="Completed" />
            <FilterBtn id="shipped" label="Shipped" />
            <FilterBtn id="returned" label="Returned" />
          </div>

          <button onClick={loadOrders} style={S.btn} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {loading && <div style={S.note}>Loading orders…</div>}
      {!loading && error && <div style={S.errBox}>{error}</div>}
      {!loading && !error && filteredOrders.length === 0 && (
        <div style={S.emptyBox}>No orders match this filter.</div>
      )}

      {!loading && !error && filteredOrders.length > 0 && (
        <div style={{ display: "grid", gap: 14 }}>
          {filteredOrders.map((o) => {
            const id = o._id || o.id;
            const statusRaw = o.status || o.orderStatus || "pending";
            const status = String(statusRaw).toUpperCase();
            const currency = String(o.currency || "USD").toUpperCase();
            const total = Number(o.total ?? 0);
            const qty = Number(o.quantity ?? 1);

            const productTitle = o.productTitle || o.productName || o.product?.title || "Item";
            const shopName = o.shopName || o.shop?.shopName || "Shop";
            const shopCountry = o.shopCountry || o.shop?.country || "";

            const productId = pickProductId(o);
            const shopId = typeof o.shopId === "object" ? o.shopId?._id : o.shopId;

            const created = prettyDate(o.createdAt || o.date || o.placedAt);

            const st = String(statusRaw).toLowerCase();

            // ✅ return mapping
            const r = returnsMap[String(id)] || null;
            const hasReturn = !!r;
            const returnStatus = hasReturn ? String(r.status || "requested").toLowerCase() : "";

            const canCancel =
              !hasReturn && st !== "shipped" && st !== "completed" && st !== "complete" && st !== "cancelled";
            const canDelete = !hasReturn;
            const canRequestReturn = !hasReturn && st !== "cancelled" && st !== "refunded";

            // ✅ Reviews: only completed and no return request
            const canReview = (st === "completed" || st === "complete") && !hasReturn && !!productId;

            const isBusy = String(busyId) === String(id);

            // ✅ Product image
            const img = toAbsUrl(pickProductImage(o));

            const reviewOpen = String(openReviewFor) === String(id);

            // ✅ Consent values from order (fallback privacy-first)
            const showConsentBlock = isTransactionComplete(o);
            const allowQuestions = !!o.allowQuestions;
            const anonymousQuestions =
              typeof o.anonymousQuestions === "boolean" ? o.anonymousQuestions : true;
            const savingConsent = !!consentSaving[String(id)];

            return (
              <div key={id} style={S.card}>
                <div style={S.topRow}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={S.thumbWrap}>
                      {img ? (
                        <img src={img} alt={productTitle} style={S.thumb} />
                      ) : (
                        <div style={S.thumbEmpty}>No Image</div>
                      )}
                    </div>

                    <div>
                      <div style={S.orderTitle}>Order #{String(id).slice(-6).toUpperCase()}</div>
                      <div style={S.date}>{created}</div>
                    </div>
                  </div>

                  <div style={S.right}>
                    <div style={S.total}>{money(total, currency)}</div>
                    <div style={{ ...S.pill, ...statusPillStyle(statusRaw) }}>{status}</div>
                  </div>
                </div>

                <div style={S.product}>{productTitle}</div>

                <div style={S.meta}>
                  Sold by <b style={S.bold}>{shopName}</b>
                  {shopCountry ? (
                    <>
                      {" "}
                      • <b style={S.bold}>{shopCountry}</b>
                    </>
                  ) : null}{" "}
                  • Qty: <b style={S.bold}>{qty}</b>
                </div>

                <div style={S.ids}>
                  Product: <b style={S.bold2}>{shortId(productId)}</b> • Shop:{" "}
                  <b style={S.bold2}>{shortId(shopId)}</b>
                </div>

                {/* ✅ Consent block (after transaction complete) */}
                {showConsentBlock ? (
                  <div style={S.consentBox}>
                    <div style={S.consentTitle}>Help future buyers (optional)</div>

                    <label style={S.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={allowQuestions}
                        disabled={savingConsent}
                        onChange={(e) => {
                          const nextAllow = e.target.checked;
                          const nextAnon =
                            nextAllow && typeof anonymousQuestions === "boolean"
                              ? anonymousQuestions
                              : true;
                          saveConsent(id, nextAllow, nextAnon);
                        }}
                      />
                      <span style={{ fontWeight: 950 }}>
                        Allow other users to ask me questions about this product
                      </span>
                    </label>

                    {allowQuestions ? (
                      <label style={S.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={anonymousQuestions}
                          disabled={savingConsent}
                          onChange={(e) => {
                            saveConsent(id, true, e.target.checked);
                          }}
                        />
                        <span style={{ fontWeight: 950 }}>
                          Stay anonymous (hide my name/photo)
                        </span>
                      </label>
                    ) : null}

                    <div style={S.consentHint}>
                      {savingConsent ? "Saving…" : "If enabled, you may appear in “Ask previous buyers”."}
                    </div>
                  </div>
                ) : null}

                <div style={S.returnRow}>
                  <div style={{ fontWeight: 950, opacity: 0.9 }}>Return:</div>
                  {hasReturn ? (
                    <span style={{ ...S.returnPill, ...returnPillStyle(returnStatus) }}>
                      {String(returnStatus).replaceAll("_", " ").toUpperCase()}
                    </span>
                  ) : (
                    <span style={S.returnNone}>None</span>
                  )}
                </div>

                {/* ✅ BUTTONS */}
                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => openReturnModal(o)}
                    style={{
                      ...S.btnReturn,
                      opacity: canRequestReturn ? 1 : 0.55,
                      cursor: canRequestReturn ? "pointer" : "not-allowed",
                    }}
                    disabled={!canRequestReturn || isBusy}
                    title={
                      !canRequestReturn
                        ? hasReturn
                          ? "Return already requested"
                          : "Cannot return this order"
                        : "Request a return"
                    }
                  >
                    ↩️ Request Return
                  </button>

                  <button
                    onClick={() => cancelOrder(o, hasReturn)}
                    style={{ ...S.btnWarn, opacity: canCancel ? 1 : 0.5 }}
                    disabled={!canCancel || isBusy}
                    title={
                      hasReturn
                        ? "Cannot cancel with return"
                        : !canCancel
                        ? "Cannot cancel after shipped/completed"
                        : "Cancel order"
                    }
                  >
                    {isBusy ? "..." : "Cancel"}
                  </button>

                  <button
                    onClick={() => deleteOrder(o, hasReturn)}
                    style={{ ...S.btnDanger, opacity: canDelete ? 1 : 0.55 }}
                    disabled={!canDelete || isBusy}
                    title={hasReturn ? "Cannot delete with return" : "Delete order"}
                  >
                    {isBusy ? "..." : "Delete"}
                  </button>

                  {/* ✅ ADD REVIEW only when completed */}
                  <button
                    onClick={() =>
                      setOpenReviewFor((prev) => (String(prev) === String(id) ? "" : String(id)))
                    }
                    style={{
                      ...S.btnReview,
                      opacity: canReview ? 1 : 0.55,
                      cursor: canReview ? "pointer" : "not-allowed",
                    }}
                    disabled={!canReview || isBusy}
                    title={
                      !canReview
                        ? hasReturn
                          ? "Cannot review returned orders"
                          : st !== "completed" && st !== "complete"
                          ? "Complete the order to review"
                          : "Cannot review"
                        : "Write a review"
                    }
                  >
                    ⭐ {reviewOpen ? "Close Review" : "Add Review"}
                  </button>
                </div>

                {/* ✅ Unified reviews section */}
                {reviewOpen && (
                  <div style={{ marginTop: 14 }}>
                    <ProductReviews
                      productId={productId}
                      orderId={String(id)}
                      canWrite={canReview}
                      defaultOpen={true}
                      onPosted={() => setOpenReviewFor("")}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ CONSENT PROMPT MODAL (auto after completed) */}
      {consentPromptOpen && consentPromptOrder ? (
        <div style={S.modalOverlay} onMouseDown={closeConsentPrompt}>
          <div style={S.smallModal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={S.modalTitle2}>Quick question ✅</div>

            <div style={{ opacity: 0.85, marginTop: 6, fontWeight: 850 }}>
              Your order is complete.
            </div>

            <div style={{ marginTop: 10, fontWeight: 950 }}>
              Are you okay to receive questions from other users about this product?
            </div>

            <div style={{ opacity: 0.85, marginTop: 6, fontWeight: 900 }}>
              {consentPromptOrder?.productTitle ||
                consentPromptOrder?.productName ||
                consentPromptOrder?.product?.title ||
                "Product"}
            </div>

            {consentPromptErr ? <div style={S.modalErr2}>{consentPromptErr}</div> : null}

            <div style={{ height: 10 }} />

            <label style={S.checkboxRow}>
              <input
                type="checkbox"
                checked={consentPromptAllow}
                onChange={(e) => setConsentPromptAllow(e.target.checked)}
              />
              <span style={{ fontWeight: 950 }}>Yes, allow questions</span>
            </label>

            {consentPromptAllow ? (
              <label style={S.checkboxRow}>
                <input
                  type="checkbox"
                  checked={consentPromptAnon}
                  onChange={(e) => setConsentPromptAnon(e.target.checked)}
                />
                <span style={{ fontWeight: 950 }}>Stay anonymous (hide my name/photo)</span>
              </label>
            ) : null}

            <div style={S.modalActions2}>
              <button style={S.btn} onClick={closeConsentPrompt}>
                Not now
              </button>
              <button style={S.btnPrimary} onClick={submitConsentPrompt}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ✅ Return Modal */}
      {returnOpen && (
        <div onClick={closeReturnModal} style={S.modalBackdrop}>
          <div onClick={(e) => e.stopPropagation()} style={S.modal}>
            <div style={S.modalHeader}>
              <div>
                <div style={S.modalTitle}>Request Return</div>
                <div style={S.modalSub}>
                  Order #{returnFor?._id ? String(returnFor._id).slice(-6).toUpperCase() : ""}
                </div>
              </div>

              <button onClick={closeReturnModal} style={S.btn} disabled={returnSaving}>
                Close
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              {returnErr ? <div style={S.errBox}>{returnErr}</div> : null}

              <div style={{ fontWeight: 950, marginTop: 8 }}>
                {returnFor?.productTitle || returnFor?.productName || "Item"}
              </div>

              <div style={{ marginTop: 12, fontWeight: 900, opacity: 0.9 }}>Reason</div>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                style={S.select}
                disabled={returnSaving}
              >
                <option value="" style={S.option}>
                  Select a reason…
                </option>
                {RETURN_REASONS.map((r) => (
                  <option key={r} value={r} style={S.option}>
                    {r}
                  </option>
                ))}
              </select>

              <div style={{ marginTop: 12, fontWeight: 900, opacity: 0.9 }}>Note (optional)</div>
              <textarea
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                style={S.textarea}
                placeholder="Add details for the shop…"
                disabled={returnSaving}
              />

              <div style={{ marginTop: 14, fontWeight: 900, opacity: 0.9 }}>Photos (optional)</div>

              <div style={S.photoActions}>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => onPickPhotos(e.target.files)}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={(e) => onPickPhotos(e.target.files)}
                />

                <button
                  type="button"
                  style={S.btnPhoto}
                  onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
                  disabled={returnSaving}
                >
                  📤 Upload
                </button>

                <button
                  type="button"
                  style={S.btnPhoto}
                  onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
                  disabled={returnSaving}
                >
                  📷 Take Picture
                </button>

                <div style={{ opacity: 0.75, fontWeight: 800, fontSize: 12 }}>
                  (max 5 photos, 6MB each)
                </div>
              </div>

              {returnPhotoPreviews.length > 0 && (
                <div style={S.photoGrid}>
                  {returnPhotoPreviews.map((p, idx) => (
                    <div key={p.url || idx} style={S.photoItem}>
                      <img src={p.url} alt={`return-${idx}`} style={S.photoImg} />
                      <button
                        type="button"
                        style={S.photoRemove}
                        onClick={() => removePhoto(idx)}
                        disabled={returnSaving}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={S.modalActions}>
                <button style={S.btn} onClick={closeReturnModal} disabled={returnSaving}>
                  Cancel
                </button>
                <button style={S.btnPrimary} onClick={submitReturn} disabled={returnSaving}>
                  {returnSaving ? "Submitting..." : "Submit Return"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   styles
   ========================= */
const S = {
  wrap: {
    marginTop: 6,
    padding: 16,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background:
      "radial-gradient(900px 520px at 20% 0%, rgba(59,130,246,0.14), transparent 55%), " +
      "radial-gradient(800px 480px at 85% 10%, rgba(34,197,94,0.10), transparent 55%), " +
      "rgba(15,23,42,0.35)",
    boxShadow: "0 14px 45px rgba(0,0,0,0.18)",
    color: "#fff",
  },

  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  filters: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },

  filterBtn: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 12,
  },

  filterBtnActive: {
    borderColor: "rgba(59,130,246,0.45)",
    background: "rgba(59,130,246,0.18)",
  },

  h2: { margin: 0, fontWeight: 950, letterSpacing: 0.2 },

  btn: {
    padding: "9px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },

  btnPrimary: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(59,130,246,0.35)",
    background: "rgba(59,130,246,0.18)",
    color: "#fff",
    fontWeight: 950,
    cursor: "pointer",
  },

  btnReturn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(245,158,11,0.35)",
    background: "rgba(245,158,11,0.16)",
    color: "#fff",
    fontWeight: 950,
    cursor: "pointer",
  },

  btnWarn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(245,158,11,0.35)",
    background: "rgba(245,158,11,0.16)",
    color: "#fff",
    fontWeight: 950,
    cursor: "pointer",
  },

  btnDanger: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.14)",
    color: "#fff",
    fontWeight: 950,
    cursor: "pointer",
  },

  btnReview: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(59,130,246,0.35)",
    background: "rgba(59,130,246,0.14)",
    color: "#fff",
    fontWeight: 950,
    cursor: "pointer",
  },

  note: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.18)",
    opacity: 0.9,
    fontWeight: 800,
  },

  errBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.14)",
    fontWeight: 900,
  },

  emptyBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    fontWeight: 800,
    opacity: 0.95,
  },

  card: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 14,
    background: "rgba(15,23,42,0.65)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.30)",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },

  thumbWrap: {
    width: 62,
    height: 62,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    overflow: "hidden",
    flex: "0 0 auto",
  },

  thumb: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

  thumbEmpty: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 900,
    opacity: 0.7,
  },

  orderTitle: { fontWeight: 950, fontSize: 18 },
  date: { fontSize: 13, opacity: 0.75, marginTop: 3 },

  right: { textAlign: "right" },
  total: { fontWeight: 950, fontSize: 18 },

  pill: {
    display: "inline-block",
    marginTop: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    fontWeight: 950,
    fontSize: 12,
    color: "#fff",
  },

  product: { marginTop: 12, fontWeight: 950, fontSize: 16 },
  meta: { marginTop: 6, fontSize: 13, opacity: 0.9 },
  ids: { marginTop: 8, fontSize: 12, opacity: 0.72 },

  // ✅ consent UI
  consentBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
  },
  consentTitle: { fontWeight: 950, marginBottom: 6 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 8 },
  consentHint: { marginTop: 8, opacity: 0.75, fontWeight: 850, fontSize: 12 },

  returnRow: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  returnPill: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    fontWeight: 950,
    fontSize: 12,
    color: "#fff",
  },

  returnNone: { opacity: 0.7, fontWeight: 950 },

  bold: { color: "rgba(255,255,255,0.92)" },
  bold2: { color: "rgba(255,255,255,0.88)" },

  // ✅ consent modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.60)",
    display: "grid",
    placeItems: "center",
    padding: 16,
    zIndex: 10000,
  },
  smallModal: {
    width: "min(520px, 96vw)",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "radial-gradient(900px 520px at 15% 0%, rgba(59,130,246,0.16), transparent 55%), " +
      "rgba(10,15,30,0.96)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
    padding: 16,
    color: "#fff",
  },
  modalTitle2: { fontSize: 18, fontWeight: 950 },
  modalErr2: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.15)",
    fontWeight: 950,
  },
  modalActions2: {
    marginTop: 14,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },

  // return modal styles (your existing)
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.60)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },

  modal: {
    width: "min(760px, 96vw)",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "radial-gradient(900px 520px at 15% 0%, rgba(59,130,246,0.16), transparent 55%), " +
      "rgba(10,15,30,0.96)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
    padding: 16,
    color: "#fff",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },

  modalTitle: { fontSize: 18, fontWeight: 950 },
  modalSub: { fontSize: 12, opacity: 0.75, marginTop: 2 },

  select: {
    width: "100%",
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(2,6,23,0.55)",
    color: "#fff",
    fontWeight: 900,
    outline: "none",
    colorScheme: "dark",
    boxShadow: "inset 0 0 0 9999px rgba(2,6,23,0.55)",
  },

  option: {
    background: "#0b1220",
    color: "#ffffff",
  },

  textarea: {
    width: "100%",
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(2,6,23,0.55)",
    color: "#fff",
    fontWeight: 800,
    outline: "none",
    minHeight: 90,
    resize: "vertical",
    colorScheme: "dark",
    boxShadow: "inset 0 0 0 9999px rgba(2,6,23,0.55)",
  },

  modalActions: {
    marginTop: 14,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },

  photoActions: {
    marginTop: 10,
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  btnPhoto: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 950,
    cursor: "pointer",
  },

  photoGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
    gap: 10,
  },

  photoItem: {
    position: "relative",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    overflow: "hidden",
    background: "rgba(255,255,255,0.04)",
    height: 110,
  },

  photoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  photoRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.45)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 950,
  },
};

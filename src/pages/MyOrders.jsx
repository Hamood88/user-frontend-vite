// user-frontend-vite/src/pages/MyOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyOrders,
  getOrderCommissionProof,

  // ✅ RETURNS
  getMyReturns,
  createReturnRequest,

  // ✅ buyer consent for "Ask previous buyers"
  setOrderAskConsent,

  // ✅ generic api helper (already used across your app)
  apiPost,
  toAbsUrl,
} from "../api.jsx";

/* =========================
   helpers
   ========================= */
function statusLower(order) {
  return String(order?.status || "pending").trim().toLowerCase();
}

// ✅ backend requires completed for consent + safest for commission logic
function isTransactionComplete(order) {
  const s = statusLower(order);
  return s === "completed" || s === "complete";
}

function normalizeOrdersPayload(ordersData) {
  if (Array.isArray(ordersData)) return ordersData;
  if (Array.isArray(ordersData?.orders)) return ordersData.orders;
  if (Array.isArray(ordersData?.data?.orders)) return ordersData.data.orders;
  return [];
}

function normalizeReturnsPayload(returnsData) {
  if (Array.isArray(returnsData)) return returnsData;
  if (Array.isArray(returnsData?.returns)) return returnsData.returns;
  if (Array.isArray(returnsData?.data?.returns)) return returnsData.data.returns;
  return [];
}

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

function pickShopId(order) {
  return String(
    order?.shopId?._id ||
    order?.shopId ||
    order?.shop?._id ||
    order?.shop ||
    ""
  ).trim();
}

function pickProductImage(order) {
  // try many shapes (populated product, flat order fields)
  const img =
    order?.productImage ||
    order?.productPhoto ||
    order?.productImg ||
    order?.productImageUrl ||
    order?.imageUrl ||
    order?.image ||
    order?.productId?.imageUrl ||
    order?.productId?.image ||
    order?.productId?.photo ||
    order?.productId?.images?.[0] ||
    order?.product?.imageUrl ||
    order?.product?.image ||
    order?.product?.photo ||
    order?.product?.images?.[0] ||
    "";

  return String(img || "").trim();
}

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

function prettyMoney(n, currency = "USD") {
  const x = Number(n || 0);
  const cur = String(currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
    }).format(Number.isFinite(x) ? x : 0);
  } catch {
    return `${cur} ${(Number.isFinite(x) ? x : 0).toFixed(2)}`;
  }
}

// ✅ treat return refunded as "refunded" filter even if order.status isn't "refunded"
function computedOrderBucket(order, returnObj) {
  const s = statusLower(order); // pending/paid/completed/cancelled/etc
  const rStatus = String(returnObj?.status || "").toLowerCase().trim();

  if (s === "cancelled" || s === "canceled") return "canceled";
  if (s === "refunded") return "refunded";
  if (rStatus === "refunded") return "refunded";
  if (s === "pending" || s === "processing" || s === "paid") return "pending";
  if (s === "completed" || s === "complete") return "completed";
  return "other";
}

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [returnsMap, setReturnsMap] = useState({}); // orderId -> return object

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ filter
  const [filter, setFilter] = useState("all"); // all | pending | completed | canceled | refunded

  // ✅ return modal
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnFor, setReturnFor] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [returnSaving, setReturnSaving] = useState(false);
  const [returnErr, setReturnErr] = useState("");

  // ✅ consent saving map (orderId -> true while saving)
  const [consentSaving, setConsentSaving] = useState({});

  // ✅ consent prompt modal
  const [consentPromptOpen, setConsentPromptOpen] = useState(false);
  const [consentPromptOrder, setConsentPromptOrder] = useState(null);
  const [consentPromptAllow, setConsentPromptAllow] = useState(true);
  const [consentPromptAnon, setConsentPromptAnon] = useState(true);
  const [consentPromptErr, setConsentPromptErr] = useState("");

  // ✅ Proof modal (per order)
  const [proofOpen, setProofOpen] = useState(false);
  const [proofFor, setProofFor] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofErr, setProofErr] = useState("");
  const [proofData, setProofData] = useState(null);

  // ✅ Review modal
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewFor, setReviewFor] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewErr, setReviewErr] = useState("");

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

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [ordersData, returnsData] = await Promise.all([
        getMyOrders(),
        getMyReturns(""),
      ]);

      const list = normalizeOrdersPayload(ordersData);
      setOrders(list);

      const retList = normalizeReturnsPayload(returnsData);
      const map = {};
      for (const r of retList) {
        const oid =
          r?.orderId?._id || r?.orderId || r?.order || r?.order_id || "";
        if (oid) map[String(oid)] = r;
      }
      setReturnsMap(map);
    } catch (e) {
      setErr(e?.message || "Failed to load orders");
      setOrders([]);
      setReturnsMap({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  // ✅ PROOF MODAL (shows order commissions)
  async function openProof(order) {
    const oid = String(order?._id || "");
    if (!oid) return;

    setProofOpen(true);
    setProofFor(order);
    setProofLoading(true);
    setProofErr("");
    setProofData(null);

    try {
      const res = await getOrderCommissionProof(oid);
      setProofData(res || null);
    } catch (e) {
      setProofErr(e?.message || "No commission proof yet");
    } finally {
      setProofLoading(false);
    }
  }

  function closeProof() {
    if (proofLoading) return;
    setProofOpen(false);
    setProofFor(null);
    setProofErr("");
    setProofData(null);
  }

  function openReturnModal(order) {
    setReturnErr("");
    setReturnFor(order);
    setReturnReason("");
    setReturnNote("");
    setReturnOpen(true);
  }

  function closeReturnModal() {
    if (returnSaving) return;
    setReturnOpen(false);
    setReturnFor(null);
    setReturnReason("");
    setReturnNote("");
    setReturnErr("");
  }

  async function submitReturn() {
    const o = returnFor;
    if (!o?._id) return;

    const orderId = String(o._id);
    const productId = String(pickProductId(o) || "");

    if (!productId) {
      setReturnErr(
        "I can’t find productId in this order. Send me console.log of one order and I’ll map it."
      );
      return;
    }

    const reason = String(returnReason || "").trim();
    const note = String(returnNote || "").trim();

    if (!reason) {
      setReturnErr("Please choose a reason.");
      return;
    }

    setReturnSaving(true);
    setReturnErr("");

    try {
      await createReturnRequest({ orderId, productId, reason, note });
      closeReturnModal();
      await load();
      alert("✅ Return request submitted");
    } catch (e) {
      setReturnErr(e?.message || "Failed to create return request");
    } finally {
      setReturnSaving(false);
    }
  }

  async function saveConsent(orderId, allowQuestions, anonymousQuestions) {
    const oid = String(orderId || "");
    if (!oid) return;

    setConsentSaving((prev) => ({ ...prev, [oid]: true }));

    try {
      await setOrderAskConsent(oid, { allowQuestions, anonymousQuestions });

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
     ✅ AUTO POPUP after transaction is complete
     ========================================================= */
  useEffect(() => {
    if (loading) return;
    if (!orders || orders.length === 0) return;
    if (consentPromptOpen) return;

    const eligible = orders.find((o) => {
      const oid = String(o?._id || "");
      if (!oid) return false;
      if (!isTransactionComplete(o)) return false;
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

  // =========================
  // ✅ REVIEWS
  // =========================
  function openReviewModal(order) {
    setReviewErr("");
    setReviewFor(order);
    setReviewRating(5);
    setReviewText("");
    setReviewOpen(true);
  }

  function closeReviewModal() {
    if (reviewSaving) return;
    setReviewOpen(false);
    setReviewFor(null);
    setReviewErr("");
    setReviewText("");
    setReviewRating(5);
  }

  async function submitReview() {
    const o = reviewFor;
    if (!o?._id) return;

    const orderId = String(o._id);
    const productId = String(pickProductId(o) || "");
    if (!productId) {
      setReviewErr("Missing productId for this order.");
      return;
    }

    const rating = Math.max(1, Math.min(5, Number(reviewRating || 5)));
    const text = String(reviewText || "").trim();

    setReviewSaving(true);
    setReviewErr("");

    // ✅ Try common endpoints (your backend might be one of these)
    const payload = { orderId, productId, rating, text };

    try {
      try {
        // Option A
        await apiPost(`/api/reviews`, payload);
      } catch {
        // Option B
        await apiPost(`/api/products/${productId}/reviews`, payload);
      }

      closeReviewModal();
      alert("✅ Review submitted");
    } catch (e) {
      setReviewErr(e?.message || "Failed to submit review");
    } finally {
      setReviewSaving(false);
    }
  }

  // =========================
  // ✅ FILTERED LIST
  // =========================
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    if (filter === "all") return orders;

    return orders.filter((o) => {
      const oid = String(o?._id || "");
      const r = oid ? returnsMap[oid] : null;
      const bucket = computedOrderBucket(o, r);
      return bucket === filter;
    });
  }, [orders, returnsMap, filter]);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h2 style={S.title}>My Orders</h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={S.refreshBtn} onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {/* ✅ Filter pills */}
      <div style={S.filtersRow}>
        <button
          style={{ ...S.filterPill, ...(filter === "all" ? S.filterActive : null) }}
          onClick={() => setFilter("all")}
          disabled={loading}
        >
          All
        </button>
        <button
          style={{
            ...S.filterPill,
            ...(filter === "completed" ? S.filterActive : null),
          }}
          onClick={() => setFilter("completed")}
          disabled={loading}
        >
          Completed
        </button>
        <button
          style={{
            ...S.filterPill,
            ...(filter === "pending" ? S.filterActive : null),
          }}
          onClick={() => setFilter("pending")}
          disabled={loading}
        >
          Pending
        </button>
        <button
          style={{
            ...S.filterPill,
            ...(filter === "canceled" ? S.filterActive : null),
          }}
          onClick={() => setFilter("canceled")}
          disabled={loading}
        >
          Canceled
        </button>
        <button
          style={{
            ...S.filterPill,
            ...(filter === "refunded" ? S.filterActive : null),
          }}
          onClick={() => setFilter("refunded")}
          disabled={loading}
        >
          Refunded
        </button>
        <button
          style={S.filterPill}
          onClick={() => navigate("/saved")}
          disabled={loading}
          title="Open saved products"
        >
          Saved
        </button>
      </div>

      {err && <div style={S.error}>{err}</div>}

      {loading ? (
        <div style={S.note}>Loading orders…</div>
      ) : filteredOrders.length === 0 ? (
        <div style={S.note}>
          {filter === "all"
            ? "You don’t have any orders yet."
            : "No orders match this filter."}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {filteredOrders.map((o) => {
            const oid = String(o._id || "");
            const r = returnsMap[oid] || null;

            const status = statusLower(o);
            const returnStatus = r ? String(r.status || "requested") : "";
            const hasReturn = !!r;
            const canRequestReturn = !hasReturn && status !== "cancelled" && status !== "canceled";

            const showConsentBlock = isTransactionComplete(o);
            const allowQuestions = !!o.allowQuestions;
            const anonymousQuestions =
              typeof o.anonymousQuestions === "boolean" ? o.anonymousQuestions : true;
            const savingConsent = !!consentSaving[oid];

            const currency = (o.currency || "USD").toUpperCase();
            const total = Number(o.total || 0);

            const productImg = toAbsUrl(pickProductImage(o));
            const isCompleted = isTransactionComplete(o);

            return (
              <div key={o._id} style={S.card}>
                {/* Top */}
                <div style={S.rowTop}>
                  <div>
                    <div style={S.orderId}>
                      Order #{String(o._id).slice(-6).toUpperCase()}
                    </div>
                    <div style={S.date}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                    </div>
                  </div>

                  <div style={S.right}>
                    <div style={S.price}>{prettyMoney(total, currency)}</div>
                    <div style={{ ...S.status, ...statusStyle(o.status, r) }}>
                      {String(o.status || "pending").toUpperCase()}
                      {String(returnStatus || "").toLowerCase() === "refunded"
                        ? " • REFUNDED"
                        : ""}
                    </div>
                  </div>
                </div>

                {/* Product row with image */}
                <div style={S.productRow}>
                  <div
                    style={{ ...S.thumbWrap, cursor: "pointer" }}
                    onClick={() => {
                      const pid = pickProductId(o);
                      const sid = pickShopId(o);
                      if (pid) navigate(`/product/${pid}`, { state: { backTo: "/orders", shopId: sid } });
                    }}
                  >
                    {productImg ? (
                      <img
                        src={productImg}
                        alt="product"
                        style={S.thumb}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={S.thumbFallback}>📦</div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div 
                      style={{ ...S.product, cursor: "pointer" }}
                      onClick={() => {
                        const pid = pickProductId(o);
                        const sid = pickShopId(o);
                        if (pid) navigate(`/product/${pid}`, { state: { backTo: "/orders", shopId: sid } });
                      }}
                    >
                      {o.productTitle || "Product"}
                    </div>
                    <div style={S.meta}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {o.shopLogoUrl ? (
                          <img 
                            src={toAbsUrl(o.shopLogoUrl)} 
                            alt={o.shopName || "Shop"}
                            style={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: "50%", 
                              objectFit: "cover",
                              border: "1px solid rgba(255,255,255,0.1)"
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div style={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: "50%", 
                            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#fff"
                          }}>
                            {(o.shopName || "S").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>Sold by {o.shopName || "Shop"} · Qty: {o.quantity || 1}</span>
                      </div>
                    </div>

                    {/* Returns line */}
                    <div style={S.returnLine}>
                      <span style={{ opacity: 0.8, fontWeight: 900 }}>Return:</span>{" "}
                      {hasReturn ? (
                        <span style={{ ...S.returnPill, ...returnStyle(returnStatus) }}>
                          {returnStatus.replaceAll("_", " ").toUpperCase()}
                        </span>
                      ) : (
                        <span style={S.returnNone}>None</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ Consent block */}
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
                            typeof anonymousQuestions === "boolean"
                              ? anonymousQuestions
                              : true;
                          saveConsent(oid, nextAllow, nextAnon);
                        }}
                      />
                      <span style={{ fontWeight: 900 }}>
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
                            saveConsent(oid, allowQuestions, e.target.checked);
                          }}
                        />
                        <span style={{ fontWeight: 900 }}>
                          Stay anonymous (hide my name/photo)
                        </span>
                      </label>
                    ) : null}

                    <div style={S.consentHint}>
                      {savingConsent
                        ? "Saving…"
                        : "If enabled, you may appear in “Ask previous buyers”."}
                    </div>
                  </div>
                ) : null}

                {/* Actions */}
                <div style={S.actionsRow}>

                  <button
                    style={{
                      ...S.returnBtn,
                      opacity: canRequestReturn ? 1 : 0.55,
                      cursor: canRequestReturn ? "pointer" : "not-allowed",
                    }}
                    disabled={!canRequestReturn}
                    onClick={() => openReturnModal(o)}
                    title={
                      canRequestReturn
                        ? "Request a return"
                        : hasReturn
                        ? "Return already requested"
                        : "Cannot return this order"
                    }
                  >
                    ↩️ Request Return
                  </button>

                  {/* ✅ Add review only when completed */}
                  <button
                    style={{
                      ...S.reviewBtn,
                      opacity: isCompleted ? 1 : 0.55,
                      cursor: isCompleted ? "pointer" : "not-allowed",
                    }}
                    disabled={!isCompleted}
                    onClick={() => openReviewModal(o)}
                    title={isCompleted ? "Add a review" : "Complete the order first"}
                  >
                    ⭐ Add Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ CONSENT PROMPT MODAL */}
      {consentPromptOpen && consentPromptOrder ? (
        <div style={S.modalOverlay} onMouseDown={closeConsentPrompt}>
          <div style={S.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>Quick question ✅</div>
            <div style={{ opacity: 0.85, marginTop: 6, fontWeight: 800 }}>
              Your order is complete.
            </div>

            <div style={{ marginTop: 10, fontWeight: 900 }}>
              Are you okay to talk to other users about this product?
            </div>

            <div style={{ opacity: 0.85, marginTop: 6, fontWeight: 800 }}>
              {consentPromptOrder?.productTitle || "Product"}
            </div>

            {consentPromptErr ? <div style={S.modalErr}>{consentPromptErr}</div> : null}

            <div style={{ height: 10 }} />

            <label style={S.checkboxRow}>
              <input
                type="checkbox"
                checked={consentPromptAllow}
                onChange={(e) => setConsentPromptAllow(e.target.checked)}
              />
              <span style={{ fontWeight: 900 }}>Yes, allow questions from other buyers</span>
            </label>

            {consentPromptAllow ? (
              <label style={S.checkboxRow}>
                <input
                  type="checkbox"
                  checked={consentPromptAnon}
                  onChange={(e) => setConsentPromptAnon(e.target.checked)}
                />
                <span style={{ fontWeight: 900 }}>Stay anonymous (hide my name/photo)</span>
              </label>
            ) : null}

            <div style={S.modalActions}>
              <button style={S.btnGhost} onClick={closeConsentPrompt}>
                Not now
              </button>
              <button style={S.btnPrimary} onClick={submitConsentPrompt}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ✅ Proof Modal */}
      {proofOpen ? (
        <div style={S.modalOverlay} onMouseDown={closeProof}>
          <div style={S.modalLarge} onMouseDown={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>Commission Proof</div>
            <div style={{ opacity: 0.8, fontWeight: 800, marginTop: 6 }}>
              Order #{String(proofFor?._id || "").slice(-6).toUpperCase()}
            </div>

            {proofLoading ? <div style={{ marginTop: 12 }}>Loading…</div> : null}
            {proofErr ? <div style={S.modalErr}>{proofErr}</div> : null}
            {proofData ? <pre style={S.pre}>{JSON.stringify(proofData, null, 2)}</pre> : null}

            <div style={S.modalActions}>
              <button style={S.btnGhost} onClick={closeProof} disabled={proofLoading}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ✅ Return Modal */}
      {returnOpen ? (
        <div style={S.modalOverlay} onMouseDown={closeReturnModal}>
          <div style={S.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>Request Return</div>
            <div style={{ opacity: 0.85, marginTop: 6, fontWeight: 800 }}>
              {returnFor?.productTitle || "Product"}
            </div>

            <div style={{ height: 12 }} />

            {returnErr ? <div style={S.modalErr}>{returnErr}</div> : null}

            <div style={S.fieldLabel}>Reason</div>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              style={S.select}
              disabled={returnSaving}
            >
              <option value="">Select a reason…</option>
              {RETURN_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div style={{ height: 10 }} />

            <div style={S.fieldLabel}>Note (optional)</div>
            <textarea
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              style={S.textarea}
              placeholder="Add details for the shop…"
              disabled={returnSaving}
            />

            <div style={S.modalActions}>
              <button style={S.btnGhost} onClick={closeReturnModal} disabled={returnSaving}>
                Cancel
              </button>
              <button style={S.btnPrimary} onClick={submitReturn} disabled={returnSaving}>
                {returnSaving ? "Submitting…" : "Submit Return"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ✅ Review Modal */}
      {reviewOpen ? (
        <div style={S.modalOverlay} onMouseDown={closeReviewModal}>
          <div style={S.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>Add Review</div>
            <div style={{ opacity: 0.85, marginTop: 6, fontWeight: 800 }}>
              {reviewFor?.productTitle || "Product"}
            </div>

            <div style={{ height: 12 }} />

            {reviewErr ? <div style={S.modalErr}>{reviewErr}</div> : null}

            <div style={S.fieldLabel}>Rating</div>
            <select
              value={reviewRating}
              onChange={(e) => setReviewRating(Number(e.target.value))}
              style={S.select}
              disabled={reviewSaving}
            >
              <option value={5}>★★★★★ (5)</option>
              <option value={4}>★★★★☆ (4)</option>
              <option value={3}>★★★☆☆ (3)</option>
              <option value={2}>★★☆☆☆ (2)</option>
              <option value={1}>★☆☆☆☆ (1)</option>
            </select>

            <div style={{ height: 10 }} />

            <div style={S.fieldLabel}>Review (optional)</div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={S.textarea}
              placeholder="Write your experience…"
              disabled={reviewSaving}
            />

            <div style={S.modalActions}>
              <button style={S.btnGhost} onClick={closeReviewModal} disabled={reviewSaving}>
                Cancel
              </button>
              <button style={S.btnPrimary} onClick={submitReview} disabled={reviewSaving}>
                {reviewSaving ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* =========================
   STYLES
   ========================= */
function statusStyle(status, returnObj) {
  const s = String(status || "").toLowerCase();
  const r = String(returnObj?.status || "").toLowerCase();

  if (r === "refunded" || s === "refunded")
    return { background: "rgba(34,197,94,0.18)", borderColor: "#22c55e" };

  if (s === "paid")
    return { background: "rgba(34,197,94,0.18)", borderColor: "#22c55e" };

  if (s === "completed" || s === "complete")
    return { background: "rgba(59,130,246,0.18)", borderColor: "#3b82f6" };

  if (s === "cancelled" || s === "canceled")
    return { background: "rgba(239,68,68,0.18)", borderColor: "#ef4444" };

  return { background: "rgba(148,163,184,0.18)", borderColor: "#94a3b8" };
}

function returnStyle(status) {
  const s = String(status || "").toLowerCase();
  if (s === "requested") return { borderColor: "#f59e0b", background: "rgba(245,158,11,0.18)" };
  if (s === "approved") return { borderColor: "#22c55e", background: "rgba(34,197,94,0.18)" };
  if (s === "rejected") return { borderColor: "#ef4444", background: "rgba(239,68,68,0.18)" };
  if (s === "shipped_back") return { borderColor: "#a855f7", background: "rgba(168,85,247,0.18)" };
  if (s === "received") return { borderColor: "#3b82f6", background: "rgba(59,130,246,0.18)" };
  if (s === "refunded") return { borderColor: "#22c55e", background: "rgba(22,197,94,0.18)" };
  return { borderColor: "hsl(var(--border))", background: "hsl(var(--muted))" };
}

const S = {
  page: { padding: 18, color: "hsl(var(--foreground))" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
    flexWrap: "wrap",
  },
  title: { fontSize: 22, fontWeight: 900 },

  refreshBtn: {
    padding: "8px 14px",
    borderRadius: 12,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--card))",
    color: "hsl(var(--foreground))",
    fontWeight: 800,
    cursor: "pointer",
  },

  filtersRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  filterPill: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--muted))",
    color: "hsl(var(--muted-foreground))",
    fontWeight: 900,
    cursor: "pointer",
  },
  filterActive: {
    border: "1px solid hsl(var(--primary) / 0.5)",
    background: "hsl(var(--primary) / 0.15)",
    color: "hsl(var(--primary))",
  },

  error: {
    background: "rgba(239,68,68,0.18)",
    border: "1px solid rgba(239,68,68,0.35)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontWeight: 800,
  },
  note: {
    padding: 14,
    borderRadius: 14,
    border: "1px dashed hsl(var(--border))",
    opacity: 0.85,
    fontWeight: 800,
  },

  card: {
    borderRadius: 18,
    padding: 16,
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border) / 0.5)",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    marginBottom: 14,
  },

  rowTop: { display: "flex", justifyContent: "space-between", gap: 12 },
  orderId: { fontWeight: 900, fontSize: 15 },
  date: { opacity: 0.7, fontSize: 12, marginTop: 4 },
  right: { textAlign: "right" },
  price: { fontWeight: 900, fontSize: 16 },
  status: {
    marginTop: 6,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid",
    fontSize: 11,
    fontWeight: 900,
    display: "inline-block",
  },

  productRow: {
    marginTop: 12,
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  thumbWrap: { width: 58, height: 58, flex: "0 0 auto" },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 12,
    objectFit: "cover",
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--muted))",
  },
  thumbFallback: {
    width: 58,
    height: 58,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--muted))",
    fontWeight: 900,
  },

  product: { fontSize: 16, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  meta: { marginTop: 6, opacity: 0.8, fontSize: 13 },

  consentBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--muted) / 0.3)",
  },
  consentTitle: { fontWeight: 900, marginBottom: 8 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 8 },
  consentHint: { marginTop: 8, opacity: 0.75, fontWeight: 800, fontSize: 12 },

  returnLine: { marginTop: 10, display: "flex", alignItems: "center", gap: 8 },
  returnNone: { opacity: 0.7, fontWeight: 900 },
  returnPill: {
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: 11,
    fontWeight: 900,
    display: "inline-block",
  },

  actionsRow: { marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" },

  proofBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(59,130,246,0.35)",
    background: "rgba(59,130,246,0.18)",
    color: "#3b82f6",
    fontWeight: 900,
    cursor: "pointer",
  },
  returnBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(245,158,11,0)",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#fff",
    fontWeight: 900,
  },
  reviewBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(168,85,247,0)",
    background: "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)",
    color: "#fff",
    fontWeight: 900,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "grid",
    placeItems: "center",
    padding: 16,
    zIndex: 9999,
  },
  modal: {
    width: "min(520px, 100%)",
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 18px 60px rgba(0,0,0,0.2)",
    color: "hsl(var(--foreground))",
  },
  modalLarge: {
    width: "min(900px, 100%)",
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 18px 60px rgba(0,0,0,0.2)",
    color: "hsl(var(--foreground))",
  },
  modalTitle: { fontSize: 18, fontWeight: 900 },
  modalErr: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.15)",
    fontWeight: 900,
  },
  pre: {
    marginTop: 12,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 12,
    maxHeight: "60vh",
    overflow: "auto",
    fontSize: 12,
    color: "#e5e7eb",
  },
  fieldLabel: { marginTop: 10, opacity: 0.85, fontWeight: 900, fontSize: 13 },
  select: {
    width: "100%",
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--muted))",
    color: "hsl(var(--foreground))",
    fontWeight: 900,
    outline: "none",
  },
  textarea: {
    width: "100%",
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--muted))",
    color: "hsl(var(--foreground))",
    fontWeight: 800,
    outline: "none",
    minHeight: 90,
    resize: "vertical",
  },
  modalActions: { marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 },
  btnGhost: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid hsl(var(--border))",
    background: "transparent",
    color: "hsl(var(--foreground))",
    fontWeight: 900,
    cursor: "pointer",
  },
  btnPrimary: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(34,197,94,0.35)",
    background: "rgba(34,197,94,0.18)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
};

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  FaFacebook,
  FaWhatsapp,
  FaTelegramPlane,
  FaSms,
  FaLink,
  FaQrcode,
} from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { MdEmail, MdClose } from "react-icons/md";
import { QRCodeCanvas } from "qrcode.react"; // npm i qrcode.react
import { API_BASE } from "../api.jsx";

const APP_BASE = window.location.origin;

// Helper to construct full image URL
function getFullImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Relative URL - prepend API_BASE
  return `${API_BASE}${url}`;
}

const allSports = [
  "Soccer",
  "Basketball",
  "Tennis",
  "Cricket",
  "Baseball",
  "American Football",
  "Volleyball",
  "Table Tennis",
  "Badminton",
  "Swimming",
];
const allInterests = [
  "Music",
  "Movies",
  "Gaming",
  "Fitness",
  "Tech",
  "Travel",
  "Food",
  "Books",
  "Fashion",
  "Art",
  "Photography",
];
const genders = ["Male", "Female", "Other", "Prefer not to say"];
const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Saudi Arabia",
  "UAE",
  "Egypt",
  "India",
  "China",
  "Japan",
  "Brazil",
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    gender: "",
    country: "",
    favoriteSport: "",
    interests: [],
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [referralCode, setReferralCode] = useState("");
  const [shareMsg, setShareMsg] = useState("");

  // QR modal state
  const [showQR, setShowQR] = useState(false);
  const qrCanvasRef = useRef(null);

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");

  // hydrate from localStorage (fast)
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u) {
        setUser(u);
        setReferralCode(u.referralCode || "");
        setForm({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          age: u.age || "",
          gender: u.gender || "",
          country: u.country || "",
          favoriteSport: u.favoriteSport || "",
          interests: Array.isArray(u.interests) ? u.interests : [],
        });
      }
    } catch {}
  }, []);

  // fetch freshest /me
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const u = res.data?.user || res.data;
        setUser(u);
        setReferralCode(u?.referralCode || "");
        setForm({
          firstName: u?.firstName || "",
          lastName: u?.lastName || "",
          email: u?.email || "",
          age: u?.age || "",
          gender: u?.gender || "",
          country: u?.country || "",
          favoriteSport: u?.favoriteSport || "",
          interests: Array.isArray(u?.interests) ? u.interests : [],
        });
        const regUrl = `${APP_BASE}/register?ref=${encodeURIComponent(
          u?.referralCode || ""
        )}`;
        setShareMsg(
          `Join me on Moondala! Use my link to sign up: ${regUrl}`
        );
        localStorage.setItem("user", JSON.stringify(u));
      })
      .catch(() => {});
  }, []);

  // Referral link
  const shareUrl = useMemo(() => {
    const code = referralCode?.trim() || "";
    return `${APP_BASE}/register?ref=${encodeURIComponent(code)}`;
  }, [referralCode]);

  // Encoded helpers (used in share links)
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedMsg = encodeURIComponent(shareMsg);

  // form handlers
  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }
  function onToggleInterest(interest) {
    setForm((prev) => {
      const set = new Set(prev.interests || []);
      if (set.has(interest)) set.delete(interest);
      else set.add(interest);
      return { ...prev, interests: Array.from(set) };
    });
  }

  async function saveProfile() {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const payload = { ...form };
      const res = await axios.put(`${API_BASE}/api/users/me`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const updated = res.data?.user || res.data;
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setStatus("Saved!");
      setTimeout(() => setStatus(""), 1500);
    } catch (err) {
      setStatus("Save failed");
      setTimeout(() => setStatus(""), 2000);
    } finally {
      setSaving(false);
    }
  }

  function openShare(href, opts = { copyBefore: false }) {
    // FB blocks prefilled text; copy message first for easy paste.
    if (opts.copyBefore) {
      navigator.clipboard?.writeText(shareMsg).catch(() => {});
    }
    if (navigator.share) {
      navigator
        .share({ title: "Moondala", text: shareMsg, url: shareUrl })
        .catch(() =>
          window.open(href, "_blank", "noopener,noreferrer")
        );
    } else {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${shareMsg}\n${shareUrl}`);
      setStatus("Copied to clipboard");
      setTimeout(() => setStatus(""), 1500);
    } catch {
      setStatus("Copy failed");
      setTimeout(() => setStatus(""), 1500);
    }
  }

  // Handle avatar file selection
  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (3MB limit)
    if (file.size > 3 * 1024 * 1024) {
      setStatus("Image too large (max 3MB)");
      setTimeout(() => setStatus(""), 2000);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setStatus("Please select an image file");
      setTimeout(() => setStatus(""), 2000);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAvatarPreview(evt.target?.result || "");
    };
    reader.readAsDataURL(file);

    setAvatarFile(file);
  }

  // Upload avatar to backend
  async function uploadAvatar() {
    if (!avatarFile) return;

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await axios.put(`${API_BASE}/api/user-profile/me/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updated = res.data?.user || res.data;
      if (updated) {
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        // Dispatch custom event to notify Sidebar and other components
        window.dispatchEvent(new Event("userUpdated"));
        setStatus("Profile picture updated!");
        setTimeout(() => setStatus(""), 1500);
        setAvatarFile(null);
        setAvatarPreview("");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      setStatus("Upload failed: " + (err.response?.data?.message || err.message));
      setTimeout(() => setStatus(""), 2000);
    } finally {
      setUploadingAvatar(false);
    }
  }

  function cancelAvatarUpload() {
    setAvatarFile(null);
    setAvatarPreview("");
  }

  function downloadQR() {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = `moondala-ref-${referralCode || "qr"}.png`;
    a.click();
  }

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      {/* Profile Card */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ marginTop: 0 }}>My Profile</h2>
          <button
            onClick={() => setShowQR(true)}
            title="Show QR with my referral link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <FaQrcode /> QR Code
          </button>
        </div>

        {/* Show user's name and email */}
        {user && (
          <div style={{ marginBottom: 16, color: "#374151" }}>
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            <br />
            <small>{user.email}</small>
          </div>
        )}

        {/* Profile Picture Upload Section */}
        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ marginBottom: 12 }}>
            <strong>Profile Picture</strong>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            {/* Current Avatar Display */}
            <div style={{ flexShrink: 0 }}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 12,
                    objectFit: "cover",
                    border: "2px solid #e5e7eb",
                  }}
                />
              ) : user?.avatarUrl ? (
                <img
                  src={getFullImageUrl(user.avatarUrl)}
                  alt="Current avatar"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 12,
                    objectFit: "cover",
                    border: "2px solid #e5e7eb",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 12,
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    color: "#9ca3af",
                    border: "2px solid #e5e7eb",
                  }}
                >
                  {user?.firstName?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.parentElement?.querySelector("input[type='file']")?.click();
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Choose Image
                </button>
              </label>

              {avatarFile && (
                <div style={{ marginBottom: 10 }}>
                  <small style={{ color: "#6b7280" }}>
                    Selected: {avatarFile.name}
                  </small>
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button
                      onClick={uploadAvatar}
                      disabled={uploadingAvatar}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #059669",
                        background: "#10b981",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 500,
                        opacity: uploadingAvatar ? 0.6 : 1,
                      }}
                    >
                      {uploadingAvatar ? "Uploading..." : "Upload"}
                    </button>
                    <button
                      onClick={cancelAvatarUpload}
                      disabled={uploadingAvatar}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        cursor: "pointer",
                        opacity: uploadingAvatar ? 0.6 : 1,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                Max 3MB • PNG, JPG, WebP, GIF
              </div>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <label>
            <div>First Name</div>
            <input
              name="firstName"
              value={form.firstName}
              onChange={onChange}
            />
          </label>
          <label>
            <div>Last Name</div>
            <input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
            />
          </label>
          <label>
            <div>Email</div>
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              type="email"
            />
          </label>
          <label>
            <div>Age</div>
            <select name="age" value={form.age} onChange={onChange}>
              <option value="">Select age</option>
              {Array.from({ length: 91 }, (_, i) => i + 10).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div>Gender</div>
            <select name="gender" value={form.gender} onChange={onChange}>
              <option value="">Select gender</option>
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div>Country</div>
            <select
              name="country"
              value={form.country}
              onChange={onChange}
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div>Favorite Sport</div>
            <select
              name="favoriteSport"
              value={form.favoriteSport}
              onChange={onChange}
            >
              <option value="">Select sport</option>
              {allSports.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Interests */}
        <div style={{ marginTop: 12 }}>
          <div>Interests</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 6,
            }}
          >
            {allInterests.map((it) => {
              const active = form.interests?.includes(it);
              return (
                <button
                  key={it}
                  type="button"
                  onClick={() => onToggleInterest(it)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 20,
                    border:
                      "1px solid " +
                      (active ? "#111827" : "#e5e7eb"),
                    background: active ? "#111827" : "#fff",
                    color: active ? "#fff" : "#111827",
                    cursor: "pointer",
                  }}
                >
                  {it}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <button
            onClick={saveProfile}
            disabled={saving}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          {status && (
            <span
              style={{
                color: status.includes("fail")
                  ? "#b91c1c"
                  : "#059669",
              }}
            >
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Share & Invite */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Share & Invite</h3>
        <div style={{ marginBottom: 8, color: "#6b7280" }}>
          Referral code: <b>{referralCode || "—"}</b>
        </div>

        <label style={{ display: "block", marginBottom: 8 }}>
          <div style={{ marginBottom: 6 }}>
            Message to share (editable):
          </div>
          <textarea
            value={shareMsg}
            onChange={(e) => setShareMsg(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
            placeholder={`Join me on Moondala! Use my link to sign up: ${shareUrl}`}
          />
        </label>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <code
            style={{
              fontSize: 12,
              background: "#f3f4f6",
              padding: "4px 6px",
              borderRadius: 6,
              wordBreak: "break-all",
            }}
          >
            {shareUrl}
          </code>
          <button
            onClick={copyLink}
            title="Copy message + link"
            style={{
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FaLink /> Copy
          </button>
        </div>

        {/* Buttons row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {/* Facebook: copy message first for easy paste */}
          <button
            onClick={() =>
              openShare(
                `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
                { copyBefore: true }
              )
            }
            title="Share on Facebook"
            style={btnStyle}
          >
            <FaFacebook size={20} /> <span>Facebook</span>
          </button>

          <button
            onClick={() =>
              openShare(`https://wa.me/?text=${encodedMsg}`)
            }
            title="Share on WhatsApp"
            style={btnStyle}
          >
            <FaWhatsapp size={20} /> <span>WhatsApp</span>
          </button>

          <button
            onClick={() =>
              openShare(
                `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedMsg}`
              )
            }
            title="Share on X"
            style={btnStyle}
          >
            <FaSquareXTwitter size={20} /> <span>X</span>
          </button>

          <button
            onClick={() =>
              openShare(
                `https://t.me/share/url?url=${encodedUrl}&text=${encodedMsg}`
              )
            }
            title="Share on Telegram"
            style={btnStyle}
          >
            <FaTelegramPlane size={20} /> <span>Telegram</span>
          </button>

          <button
            onClick={() => openShare(`sms:?&body=${encodedMsg}`)}
            title="Share by SMS"
            style={btnStyle}
          >
            <FaSms size={20} /> <span>SMS</span>
          </button>

          <button
            onClick={() =>
              openShare(
                `mailto:?subject=${encodeURIComponent(
                  "Join me on Moondala"
                )}&body=${encodedMsg}`
              )
            }
            title="Share by Email"
            style={btnStyle}
          >
            <MdEmail size={20} /> <span>Email</span>
          </button>
        </div>

        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
          Facebook blocks pre-filled text. We copy your message for
          you — just paste it into Facebook’s box.
        </div>
      </div>

      {/* QR MODAL */}
      {showQR && (
        <div style={modalBackdrop} onClick={() => setShowQR(false)}>
          <div
            style={modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Invite via QR"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>Invite via QR</h3>
              <button onClick={() => setShowQR(false)} style={closeBtn}>
                <MdClose size={20} />
              </button>
            </div>

            <div
              ref={qrCanvasRef}
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <QRCodeCanvas value={shareUrl} size={220} includeMargin />
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "#6b7280",
                marginBottom: 10,
                wordBreak: "break-all",
              }}
            >
              {shareUrl}
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={downloadQR} style={actionBtn}>
                Download PNG
              </button>
              <button onClick={() => setShowQR(false)} style={actionBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
};

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modalCard = {
  width: 360,
  maxWidth: "92vw",
  background: "#fff",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const closeBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
};

const actionBtn = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
};

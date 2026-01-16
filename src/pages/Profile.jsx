import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request, logoutUser, API_BASE } from "../api.jsx";

/* =========================
   Helpers
   ========================= */
function normalizeBase(u) {
  const s = String(u || "").trim();
  if (!s) return "https://moondala-backend.onrender.com";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

function fullImg(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `${normalizeBase(API_BASE)}${s.startsWith("/") ? "" : "/"}${s}`;
}

function displayNameFromUser(u) {
  if (!u) return "My Profile";
  const dn = String(u.displayName || "").trim();
  const full = `${u.firstName || ""} ${u.lastName || ""}`.trim();
  return dn || full || (u.email ? u.email.split("@")[0] : "My Profile");
}

/* =========================
   Component
   ========================= */
export default function Profile() {
  const nav = useNavigate();
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [me, setMe] = useState(null);

  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadMe() {
    setLoading(true);
    setErr("");

    try {
      let data = null;

      try {
        data = await request("/api/user-profile/me", { method: "GET" });
      } catch {}

      if (!data) {
        try {
          data = await request("/api/profile/me", { method: "GET" });
        } catch {}
      }

      if (!data) {
        try {
          data = await request("/api/users/me", { method: "GET" });
        } catch {}
      }

      if (!data) {
        throw new Error("Profile endpoint not found");
      }

      const user = data?.user || data?.profile || data?.me || data;
      setMe(user || null);

      const fallbackName =
        (user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.firstName) || "";

      setDisplayName(String(user?.displayName || fallbackName || "").trim());
    } catch (e) {
      setErr(e?.message || "Failed to load profile");
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  function onLogout() {
    logoutUser();
    nav("/", { replace: true });
  }

  async function saveDisplayName() {
    const name = String(displayName || "").trim();
    if (name.length < 2) {
      setErr("Display name must be at least 2 characters.");
      return;
    }

    setErr("");
    setSavingName(true);

    try {
      const data = await request("/api/user-profile/me", {
        method: "PUT",
        body: { displayName: name },
      });

      const user = data?.user || data?.me || data;
      setMe(user || null);
      setDisplayName(String(user?.displayName || name).trim());
    } catch (e) {
      setErr(e?.message || "Failed to update display name");
    } finally {
      setSavingName(false);
    }
  }

  async function onPickAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErr("Please select an image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErr("Max image size is 3MB.");
      return;
    }

    setErr("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("avatar", file);

      const data = await request("/api/user-profile/me/avatar", {
        method: "PUT",
        body: fd,
      });

      const user = data?.user || data?.me || data;
      setMe(user || null);
    } catch (e) {
      setErr(e?.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const safeName = displayNameFromUser(me);
  const avatarSrc = fullImg(me?.avatarUrl);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="feed-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || loading}
className="h-20 w-20 overflow-hidden rounded-2xl border bg-secondary"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-2xl font-extrabold">
                  {safeName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </button>

            <div>
              <div className="text-3xl font-extrabold">{safeName}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                @{String(me?.username || me?.email || "user").split("@")[0]}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-dark"
                  style={{ height: 42, maxWidth: 260 }}
                />
                <button
                  onClick={saveDisplayName}
                  disabled={savingName}
                  className="btn-primary"
                >
                  {savingName ? "Saving..." : "Save"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickAvatar}
                  hidden
                />
              </div>

              {err && (
                <div className="mt-3 text-sm text-destructive">{err}</div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => nav("/dashboard")} className="btn-secondary">
              Dashboard
            </button>
            <button onClick={onLogout} className="btn-primary">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="feed-card p-5">
        <div className="mb-3 text-sm font-extrabold">Account Info</div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Email" value={me?.email} />
            <Field label="Country" value={me?.country} />
            <Field label="Age" value={me?.age} />
            <Field label="Gender" value={me?.gender} />
            <Field label="Favorite Sport" value={me?.favoriteSport} />
            <Field
              label="Interests"
              value={Array.isArray(me?.interests) ? me.interests.join(", ") : me?.interests}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  const v = String(value || "").trim() || "—";
  return (
<div className="rounded-xl border bg-secondary p-4">
      <div className="text-xs font-extrabold text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-bold">{v}</div>
    </div>
  );
}

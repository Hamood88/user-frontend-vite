import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Shield, LogOut, Moon, Sun } from "lucide-react";
import { apiGet, apiPut, apiUpload, apiUploadPut, API_BASE } from "../api.jsx";
import "../styles/settingsModern.css";

/* ===== helpers ===== */
function s(v) {
  return String(v || "").trim();
}
function fullImg(u) {
  const x = s(u);
  if (!x) return "";
  if (x.startsWith("http://") || x.startsWith("https://")) return x;
  const base = s(API_BASE || "http://localhost:5000").replace(/\/$/, "");
  return `${base}${x.startsWith("/") ? "" : "/"}${x}`;
}

function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      className={`md-switch ${checked ? "is-on" : ""}`}
      onClick={() => !disabled && onChange?.(!checked)}
      aria-pressed={checked}
      disabled={disabled}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <span className="md-switch__dot" />
    </button>
  );
}

export default function Settings() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [me, setMe] = useState(null);

  // editable fields
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  // settings toggles (store locally for now; you can wire backend later)
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [mentions, setMentions] = useState(true);

  const [privateProfile, setPrivateProfile] = useState(false);
  const [showStatus, setShowStatus] = useState(true);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "dark";
    } catch {
      return "dark";
    }
  });

  const avatar = useMemo(() => fullImg(me?.avatarUrl || me?.avatar || me?.photoUrl), [me]);

  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
      const html = document.documentElement;
      html.setAttribute("data-theme", newTheme);
      html.style.colorScheme = newTheme;
    } catch {}
  }

  useEffect(() => {
    const loadMe = async () => {
      setLoading(true);
      setErr("");
      try {
        let data = null;
        try {
          data = await apiGet("/api/user-profile/me");
        } catch (_) {}

        if (!data) {
          try {
            data = await apiGet("/api/users/me");
          } catch (_) {}
        }

        const user = data?.user || data?.me || data?.profile || data || null;
        setMe(user);

        // hydrate fields
        setDisplayName(s(user?.displayName) || `${s(user?.firstName)} ${s(user?.lastName)}`.trim());
        setUsername(s(user?.username) || s(user?.handle));
        setEmail(s(user?.email));
        setBio(s(user?.bio));
      } catch (e) {
        setErr(e?.message || "Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, []);

  async function saveProfile() {
    setSaving(true);
    setErr("");
    setMsg("");
    try {
      // Try common endpoints – keep it robust
      let res = null;
      try {
        res = await apiPut("/api/users/me", { displayName, username, email, bio });
      } catch (_) {
        res = await apiPut("/api/user-profile/me", { displayName, username, email, bio });
      }

      const user = res?.user || res?.me || res?.profile || res || null;
      if (user) {
        setMe(user);
        try {
          localStorage.setItem("me", JSON.stringify(user));
          window.dispatchEvent(new Event("userUpdated")); // ✅ your sidebar listens to this
        } catch {}
      }

      setMsg("✅ Saved!");
      setTimeout(() => setMsg(""), 1400);
    } catch (e) {
      setErr(e?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarChange(file) {
    if (!file) return;
    setSaving(true);
    setErr("");
    setMsg("");
    try {
      const form = new FormData();
      form.append("avatar", file); // Backend expects "avatar" key

      // Try PUT first (correct method), then POST fallbacks if needed
      let res = null;
      try {
        res = await apiUploadPut("/api/user-profile/me/avatar", form);
      } catch (e) {
        // If PUT fails, try POST as fallback
        try {
          res = await apiUpload("/api/user-profile/me/avatar", form);
        } catch (e2) {
          throw e; // throw original error if both fail
        }
      }

      const user = res?.user || res?.me || res?.profile || res || null;
      if (user) {
        setMe(user);
        try {
          localStorage.setItem("me", JSON.stringify(user));
          window.dispatchEvent(new Event("userUpdated"));
        } catch {}
      }
      setMsg("✅ Avatar updated!");
      setTimeout(() => setMsg(""), 1400);
    } catch (e) {
      setErr(
        e?.message ||
          "Avatar upload endpoint not found yet. If you want, I’ll add it to your backend."
      );
    } finally {
      setSaving(false);
    }
  }

  function logoutEverywhere() {
    // You can later call backend invalidate endpoint.
    // For now: clear local session.
    try {
      localStorage.removeItem("userToken");
      localStorage.removeItem("token");
      localStorage.removeItem("me");
      localStorage.removeItem("user");
      localStorage.removeItem("referralCode");
      localStorage.removeItem("myReferralCode");
      localStorage.removeItem("userReferralCode");
    } catch {}
    nav("/", { replace: true });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and account.</p>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-6 text-muted-foreground">Loading…</div>
      ) : (
        <>
          {err ? <div className="md-error">{err}</div> : null}
          {msg ? <div className="md-info">{msg}</div> : null}

          {/* Profile card */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Information
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="md-avatarRing">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="md-avatarImg" />
                  ) : (
                    <div className="md-avatarFallback">
                      {s(displayName || "U").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-10 items-center">
                  <label className="md-btn md-btn-ghost" style={{ cursor: saving ? "not-allowed" : "pointer" }}>
                    Change Avatar
                    <input
                      type="file"
                      accept="image/*"
                      disabled={saving}
                      onChange={(e) => onAvatarChange(e.target.files?.[0] || null)}
                      style={{ display: "none" }}
                    />
                  </label>

                  <button
                    type="button"
                    className="md-btn md-btn-danger"
                    disabled={saving}
                    onClick={() => {
                      setMe((prev) => ({ ...(prev || {}), avatarUrl: "" }));
                      // optional: you can implement backend delete avatar endpoint later
                      setMsg("Avatar removed locally (wire backend delete next).");
                      setTimeout(() => setMsg(""), 1800);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="md-label">Display Name</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="md-field"
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="md-label">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="md-field"
                    placeholder="@username"
                  />
                </div>

                <div className="space-y-2">
                  <label className="md-label">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="md-field"
                    placeholder="you@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="md-label">Bio</label>
                  <input
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="md-field"
                    placeholder="Tell people about you..."
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end">
              <button
                type="button"
                className="md-btn md-btn-primary"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Notification + Privacy cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl overflow-hidden p-6 space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-amber-400" />
                Notifications
              </h2>

              <div className="space-y-4">
                <SettingRow
                  title="Push Notifications"
                  sub="Receive alerts on your device"
                  right={
                    <Switch checked={pushNotifs} onChange={setPushNotifs} disabled={saving} />
                  }
                />
                <SettingRow
                  title="Email Digest"
                  sub="Daily summary of activity"
                  right={<Switch checked={emailDigest} onChange={setEmailDigest} disabled={saving} />}
                />
                <SettingRow
                  title="Mentions"
                  sub="When someone tags you"
                  right={<Switch checked={mentions} onChange={setMentions} disabled={saving} />}
                />
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden p-6 space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Privacy & Security
              </h2>

              <div className="space-y-4">
                <SettingRow
                  title="Private Profile"
                  sub="Only friends can see your posts"
                  right={
                    <Switch
                      checked={privateProfile}
                      onChange={setPrivateProfile}
                      disabled={saving}
                    />
                  }
                />
                <SettingRow
                  title="Show Status"
                  sub="Let others know when you're online"
                  right={<Switch checked={showStatus} onChange={setShowStatus} disabled={saving} />}
                />

                <SettingRow
                  title="Theme"
                  sub="Choose your preferred appearance"
                  right={
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                          theme === "light"
                            ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400"
                            : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                        }`}
                        onClick={() => handleThemeChange("light")}
                      >
                        <Sun className="w-4 h-4" />
                        Light
                      </button>
                      <button
                        type="button"
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                          theme === "dark"
                            ? "bg-indigo-400/20 text-indigo-400 border border-indigo-400"
                            : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                        }`}
                        onClick={() => handleThemeChange("dark")}
                      >
                        <Moon className="w-4 h-4" />
                        Dark
                      </button>
                    </div>
                  }
                />

                <div className="pt-4 mt-4 border-t border-white/10">
                  <button
                    type="button"
                    className="md-btn md-btn-outline w-full justify-start"
                    onClick={logoutEverywhere}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out (logout)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SettingRow({ title, sub, right }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="font-medium text-white">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      {right}
    </div>
  );
}

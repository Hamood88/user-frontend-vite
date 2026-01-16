import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getMyUserProfile,
  updateMyDisplayName,
  uploadMyAvatar,
  API_BASE,
} from "../api.jsx";
import "../styles/profileTopHeader.css";

function safeUrl(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  // backend-served file
  return `${API_BASE}${s}`;
}

export default function ProfileTopHeader() {
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  const avatarSrc = useMemo(() => {
    const url = user?.avatarUrl || "";
    return safeUrl(url);
  }, [user]);

  async function load() {
    try {
      setLoading(true);
      const data = await getMyUserProfile();
      const u = data?.user || null;
      setUser(u);
      setName(u?.displayName || u?.firstName || "");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveName() {
    const v = String(name || "").trim();
    if (!v || v.length < 2) return alert("Enter a valid name");
    try {
      setSaving(true);
      const data = await updateMyDisplayName(v);
      setUser(data?.user || null);
    } catch (e) {
      alert(e?.message || "Failed to update name");
    } finally {
      setSaving(false);
    }
  }

  async function onPickAvatar(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!String(f.type || "").startsWith("image/")) {
      alert("Please choose an image file");
      return;
    }
    if (f.size > 3 *

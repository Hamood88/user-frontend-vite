import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Search.css";
import { API_BASE, getToken } from "../api.jsx";

/* =========================
   Helpers
   ========================= */
function normalizeBase(u) {
  const s = String(u || "").trim();
  if (!s) return "https://moondala-backend.onrender.com";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

const BASE = normalizeBase(API_BASE);
const API_ROOT = BASE.endsWith("/api") ? BASE : `${BASE}/api`;

function apiUrl(path) {
  const p = String(path || "").trim();
  if (!p) return API_ROOT;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return API_ROOT + p;
  return API_ROOT + "/" + p;
}

function assetUrl(pathOrUrl) {
  const s = String(pathOrUrl || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // uploads are served from BASE (not /api)
  if (s.startsWith("/")) return BASE + s;
  return BASE + "/" + s;
}

function pickId(r) {
  if (!r) return "";
  // ✅ prefer _id / id ALWAYS
  const id = r._id || r.id;
  if (id) return String(id).trim();

  // fallback (only if the backend returns weird shapes)
  if (r.shopId) return String(r.shopId).trim();
  if (r.userId) return String(r.userId).trim();
  return "";
}

function pickType(r) {
  const t = String(r?.type || r?.kind || r?.entityType || "").toLowerCase().trim();
  if (t === "users") return "user";
  if (t === "shops") return "shop";
  if (t === "user" || t === "shop") return t;

  // heuristic
  if (r?.shopName || r?.shopEmail || r?.industryId || r?.industryName) return "shop";
  return "user";
}

function pickName(r) {
  const nm =
    r?.name ||
    r?.shopName ||
    r?.userName ||
    `${r?.firstName || ""} ${r?.lastName || ""}`.trim() ||
    r?.email ||
    "Unknown";
  return String(nm || "Unknown").trim() || "Unknown";
}

function pickAvatar(r) {
  // ✅ your project uses avatarUrl for users
  return r?.avatarUrl || r?.avatar || r?.photo || r?.logoUrl || "";
}

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [type, setType] = useState("all"); // all | users | shops
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [err, setErr] = useState("");

  async function runSearch(searchText, searchType) {
    const qq = String(searchText || "").trim();
    const tt = String(searchType || "all").trim();

    setErr("");

    if (!qq) {
      setUsers([]);
      setShops([]);
      return;
    }

    setLoading(true);
    try {
      const url = apiUrl(
        `/public/search?q=${encodeURIComponent(qq)}&type=${encodeURIComponent(tt)}&limit=25`
      );

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || "Search failed");
      }

      setUsers(Array.isArray(data?.users) ? data.users : []);
      setShops(Array.isArray(data?.shops) ? data.shops : []);
    } catch (e) {
      setErr(String(e?.message || e));
      setUsers([]);
      setShops([]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ debounce
  useEffect(() => {
    const t = setTimeout(() => runSearch(q, type), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type]);

  const results = useMemo(() => {
    const u = users.map((x) => ({ ...x, __type: "user" }));
    const s = shops.map((x) => ({ ...x, __type: "shop" }));

    if (type === "users") return u;
    if (type === "shops") return s;

    // "all"
    return [...u, ...s];
  }, [users, shops, type]);

  function openResult(r) {
    const realType = r?.__type || pickType(r);
    const id = pickId(r);
    if (!id) return;

    if (realType === "shop") {
      navigate(`/shop/${encodeURIComponent(id)}/feed`);
      return;
    }

    // ✅ Users: always try the public user page first
    // This will show basic profile info and let user decide if they want to view the feed
    navigate(`/u/${encodeURIComponent(id)}`);
  }

  return (
    <div className="search-page">
      <div className="search-card">
        <div className="search-title">Search</div>

        <div className="search-controls">
          <input
            className="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users or shops..."
          />

          <select
            className="search-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="users">Users</option>
            <option value="shops">Shops</option>
          </select>
        </div>

        {loading ? <div className="search-status">Searching…</div> : null}
        {err ? <div className="search-error">{err}</div> : null}

        {!loading && q.trim() && results.length === 0 ? (
          <div className="search-status">No results.</div>
        ) : null}

        <div className="search-results">
          {results.map((r) => {
            const id = pickId(r);
            const realType = r?.__type || pickType(r);
            const name = pickName(r);
            const avatar = pickAvatar(r);

            // ✅ stable key (no Math.random())
            const key = `${realType}-${id || name}`;

            return (
              <button
                key={key}
                className="search-item"
                onClick={() => openResult(r)}
                type="button"
              >
                <div className="search-avatar">
                  {avatar ? <img src={assetUrl(avatar)} alt="" /> : null}
                </div>

                <div className="search-meta">
                  <div className="search-name">{name}</div>
                  <div className="search-sub">
                    {realType === "shop" ? "Shop" : "User"}
                    {r?.email ? ` • ${r.email}` : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

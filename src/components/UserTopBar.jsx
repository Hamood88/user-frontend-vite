// user-frontend-vite/src/components/UserTopBar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { API_BASE, getMyUserProfile } from "../api.jsx";
import "../styles/userTopBar.css";

function fullImg(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `${API_BASE}${s}`;
}

export default function UserTopBar() {
  const [user, setUser] = useState(null);

  const avatar = useMemo(() => fullImg(user?.avatarUrl), [user]);
  const name = useMemo(() => {
    const dn = String(user?.displayName || "").trim();
    if (dn) return dn;
    const fn = String(user?.firstName || "").trim();
    const ln = String(user?.lastName || "").trim();
    return `${fn} ${ln}`.trim() || "User";
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyUserProfile();
        setUser(data?.user || null);
      } catch (e) {
        // ignore in top bar
      }
    })();
  }, []);

  return (
    <div className="utb-wrap">
      <div className="utb-left">
        <div className="utb-avatar">
          {avatar ? (
            <img src={avatar} alt="avatar" />
          ) : (
            <span>{name.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div className="utb-name">
          <div className="utb-hello">Welcome</div>
          <div className="utb-title">{name}</div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { API_BASE, getToken, getUserSession, absUrl, fixImageUrl } from "../api.jsx";

function s(v) {
  return String(v || "").trim();
}

function userName(u) {
  const dn = s(u?.displayName);
  const fn = s(u?.firstName);
  const ln = s(u?.lastName);
  return dn || `${fn} ${ln}`.trim() || "User";
}

function avatarUrl(u) {
  return fixImageUrl(absUrl(u?.avatarUrl || u?.avatar || u?.photoUrl || ""));
}

const CreatePost = ({ onPost }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const user = useMemo(() => getUserSession(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!text.trim() && !file) {
      setError("Write something or upload media");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("You are logged out. Please login again.");
      return;
    }

    const fd = new FormData();
    fd.append("text", text);
    if (file) fd.append("file", file);

    setPosting(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || "Failed to post");
      }

      setText("");
      setFile(null);
      setError("");

      if (onPost) onPost();
    } catch (err) {
      setError(err?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="feed-card p-4">
      <div className="flex gap-3 items-start mb-4">
        <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden border border-white/10 flex-shrink-0">
          {avatarUrl(user) ? (
            <img
              src={avatarUrl(user)}
              alt={userName(user)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-900 flex items-center justify-center text-white font-bold">
              {userName(user).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">{userName(user)}</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening in your universe?"
            rows={3}
            className="input-dark resize-none mt-2 w-full"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm font-semibold text-foreground">
          📎 Image or Video
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-2 block w-full text-sm text-muted-foreground"
          />
        </label>

        <button type="submit" disabled={posting} className="btn-primary ml-auto" style={{ height: 40 }}>
          {posting ? "Posting..." : "Post"}
        </button>
      </div>

      {file && (
        <div className="mt-2 text-sm text-muted-foreground">
          Selected: <strong className="text-foreground">{file.name}</strong>
        </div>
      )}

      {error && <div className="mt-3 text-sm text-destructive">{error}</div>}
    </form>
  );
};

export default CreatePost;

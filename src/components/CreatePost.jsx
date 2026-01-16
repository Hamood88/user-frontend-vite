import React, { useState } from "react";
import { API_BASE, getToken } from "../api.jsx";

const CreatePost = ({ onPost }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

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
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="input-dark resize-none"
      />

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

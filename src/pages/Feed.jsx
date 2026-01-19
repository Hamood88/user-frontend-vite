import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  MoreHorizontal,
  Users,
  Send,
  X,
  Trash2,
  Edit3,
  Check,
  Link,
  Copy,
  Twitter,
  Mail,
  MessageCircleWarning,
  Download,
  Printer,
  Flag,
} from "lucide-react";

import {
  apiUpload,
  getMyFeed,
  getPostsByUser,
  likePost,
  addComment,
  updatePost,
  deletePost,
  absUrl,
  pickId,
  getUserSession,
  fixImageUrl,
  safeImageUrl,
  sendFriendRequest,
} from "../api.jsx";

import "../styles/feedModern.css";

/* =========================
   Helpers
   ========================= */
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function s(v) {
  return String(v || "").trim();
}

function timeAgo(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function userName(u) {
  const dn = s(u?.displayName);
  const fn = s(u?.firstName);
  const ln = s(u?.lastName);
  return dn || `${fn} ${ln}`.trim() || "User";
}

function avatarUrl(u) {
  const url = u?.avatarUrl || u?.avatar || u?.photoUrl || "";
  return safeImageUrl(url, 'avatar', u);
}

function normalizePost(p) {
  // Your backend might return { userId } or { user } populated
  const user = p?.user || p?.author || p?.createdBy || p?.userId || {};
  // Normalize media: backend may use different fields (media, image, imageUrl, images, filename, videoUrl)
  let media = null;
  // If backend already provides media object
  if (p?.media) {
    if (Array.isArray(p.media) && p.media.length > 0) {
      media = p.media[0];
    } else if (typeof p.media === 'object') {
      media = p.media;
    }
  }

  // backend may provide a convenience `mediaUrl` (relative path like '/uploads/...')
  else if (p?.mediaUrl) {
    const url = String(p.mediaUrl || "").trim();
    const isVideo = /\.(mp4|mov|webm)$|video/i.test(url);
    media = { type: isVideo ? "video" : "image", url };
  } else if (p?.videoUrl) {
    media = { type: "video", url: p.videoUrl };
  } else if (p?.imageUrl) {
    media = { type: "image", url: p.imageUrl };
  } else if (p?.image) {
    media = { type: "image", url: p.image };
  } else if (Array.isArray(p?.images) && p.images.length > 0) {
    const first = p.images[0];
    if (!first) {
      media = null;
    } else if (typeof first === "string") {
      media = { type: "image", url: first };
    } else if (typeof first === "object") {
      const u =
        String(first.url || first.path || first.image || first.filename || "").trim();
      media = u ? { type: "image", url: u } : null;
    }
  } else if (p?.filename) {
    media = { type: "image", url: `/uploads/${String(p.filename)}` };
  }

  // likes/comments may be counts or arrays
  const likesCount = Array.isArray(p?.likes) ? p.likes.length : Number(p?.likes || 0);
  const commentsCount = Array.isArray(p?.comments)
    ? p.comments.length
    : Number(p?.comments || p?.commentsCount || 0);

  return {
    ...p,
    _id: s(p?._id || p?.id || ""),
    user,
    text: s(p?.text || p?.content || ""),
    createdAt: p?.createdAt || p?.created || p?.time || new Date().toISOString(),
    media,
    likesCount,
    commentsCount,
  };
}

async function createPostFlexible({ text, file } = {}) {
  const cleanText = s(text);

  const fd = new FormData();
  fd.append("text", cleanText);
  if (file) {
    fd.append("file", file);
  }

  // Backend handles multipart upload at /api/posts
  return await apiUpload("/api/posts", fd, { auth: true });
}

export default function Feed() {
  const { userId } = useParams(); // Get userId from URL if viewing another user's feed
  const me = getUserSession(); // Get fresh session data each time
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);
  const [failedImages, setFailedImages] = useState(new Set());

  // comments drawer
  const [openPostId, setOpenPostId] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  // post editing
  const [editingPostId, setEditingPostId] = useState("");
  const [editText, setEditText] = useState("");

  // share dropdown
  const [shareDropdownOpen, setShareDropdownOpen] = useState("");

  const [sendingFriendRequest, setSendingFriendRequest] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [isPrivateFeed, setIsPrivateFeed] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
  };

  async function loadFeed() {
    setLoading(true);
    setErr("");
    setIsPrivateFeed(false);
    setFriendRequestSent(false);
    try {
      let data;
      
      // If userId is in params, fetch that user's posts
      if (userId) {
        data = await getPostsByUser(userId);
      } else {
        // Otherwise fetch my feed
        data = await getMyFeed(); // /api/posts/feed
      }
      
      const list = Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [];
      const normalized = list.map(normalizePost);
      setPosts(normalized);
    } catch (e) {
      // ✅ Only log in development mode to avoid confusing users
      if (process.env.NODE_ENV === 'development') {
        console.warn("Feed loading error:", e?.message || e);
      }
      
      // ✅ Handle 403 (private feed) - check status code first, then backend message
      if (e?.status === 403) {
        setErr("This user's feed is private.");
        setIsPrivateFeed(true);
      } else if (e?.message?.includes("private") || e?.data?.message?.includes("private")) {
        // Backend returns message like "This user's feed is private (friends only)."
        setErr(e?.data?.message || e?.message || "This user's feed is private.");
        setIsPrivateFeed(true);
      } else if (e?.status === 404) {
        setErr("User not found.");
      } else {
        setErr(e?.message || "Failed to load feed.");
      }
      
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function sendFriendRequestToUser() {
    if (!userId || sendingFriendRequest || friendRequestSent) return;

    setSendingFriendRequest(true);
    try {
      await sendFriendRequest(userId, "I'd like to be friends!");
      setFriendRequestSent(true);
      // ✅ Show success message while keeping the private feed message
      setErr("Friend request sent! Waiting for acceptance to view this feed.");
    } catch (e) {
      // Show error but keep the private feed context
      const errorMsg = e?.message || String(e);
      setErr(`This user's feed is private. Friend request failed: ${errorMsg}`);
    } finally {
      setSendingFriendRequest(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, [userId]);

  // Close share dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (shareDropdownOpen) {
        setShareDropdownOpen("");
      }
    }

    if (shareDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [shareDropdownOpen]);

  async function onCreatePost() {
    const text = s(newPostText);
    if (!text && !selectedFile) return;

    setPosting(true);
    setErr("");
    try {
      await createPostFlexible({ text, file: selectedFile });
      setNewPostText("");
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await loadFeed();
    } catch (e) {
      setErr(e?.message || "Failed to post.");
    } finally {
      setPosting(false);
    }
  }

  async function onLike(postId) {
    const id = s(postId);
    if (!id) return;

    // Find current state
    const currentPost = posts.find(p => p._id === id);
    if (!currentPost) return;

    const currentlyLiked = currentPost.likedByMe || false;
    const newCount = currentlyLiked
      ? Math.max(0, Number(currentPost.likesCount || 0) - 1)
      : Number(currentPost.likesCount || 0) + 1;

    // optimistic
    setPosts((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, likesCount: newCount, likedByMe: !currentlyLiked } : p
      )
    );

    try {
      await likePost(id);
      // optional: reload to get exact counts
      // await loadFeed();
    } catch (e) {
      // revert if failed
      setPosts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, likesCount: currentPost.likesCount, likedByMe: currentlyLiked } : p
        )
      );
      setErr(e?.message || "Like failed.");
    }
  }

  function openComments(postId) {
    setOpenPostId(s(postId));
    setCommentText("");
    setReplyTo(null);
  }

  async function submitComment() {
    const pid = s(openPostId);
    const text = s(commentText);
    if (!pid || !text) return;

    setCommentBusy(true);
    setErr("");
    try {
      await addComment(pid, { text, parentComment: replyTo?._id });
      setCommentText("");
      setReplyTo(null);
      setOpenPostId(""); // Close the comment drawer after posting
      // optimistic: bump count
      setPosts((prev) =>
        prev.map((p) =>
          p._id === pid ? { ...p, commentsCount: Number(p.commentsCount || 0) + 1 } : p
        )
      );
    } catch (e) {
      setErr(e?.message || "Comment failed.");
    } finally {
      setCommentBusy(false);
    }
  }

  async function deleteComment(postId, commentId) {
    const pid = s(postId);
    const cid = s(commentId);
    if (!pid || !cid) return;

    // optimistic: remove comment and decrement count
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === pid) {
          const updatedComments = (p.comments || []).filter((c) => c._id !== cid);
          return {
            ...p,
            comments: updatedComments,
            commentsCount: Math.max(0, Number(p.commentsCount || 0) - 1),
          };
        }
        return p;
      })
    );

    try {
      await apiDelete(`/posts/${pid}/comments/${cid}`);
      // Already updated optimistically
    } catch (e) {
      // Revert: reload the post
      await loadFeed();
      setErr(e?.message || "Delete comment failed.");
    }
  }

  async function handleDeletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await deletePost(postId);
      // Remove from UI
      setPosts(prev => prev.filter(p => p._id !== postId));
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to delete post");
    }
  }

  function startEditingPost(post) {
    setEditingPostId(post._id);
    setEditText(post.text || "");
  }

  async function handleUpdatePost() {
    if (!editingPostId || !editText.trim()) return;
    
    try {
      await updatePost(editingPostId, { text: editText });
      // Update in UI
      setPosts(prev => prev.map(p => 
        p._id === editingPostId 
          ? { ...p, text: editText }
          : p
      ));
      setEditingPostId("");
      setEditText("");
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to update post");
    }
  }

  function cancelEdit() {
    setEditingPostId("");
    setEditText("");
  }

  function toggleShareDropdown(postId) {
    setShareDropdownOpen(shareDropdownOpen === postId ? "" : postId);
  }

  async function copyPostLink(post) {
    try {
      const shareUrl = userId 
        ? `${window.location.origin}/feed/user/${userId}` 
        : `${window.location.origin}/feed`;
      
      await navigator.clipboard.writeText(shareUrl);
      
      const originalErr = err;
      setErr("Link copied to clipboard!");
      setTimeout(() => setErr(originalErr), 2000);
      setShareDropdownOpen("");
    } catch (e) {
      setErr("Failed to copy link");
    }
  }

  async function copyPostContent(post) {
    try {
      const shareText = `"${post.text}" - ${userName(post.user)} on Moondala`;
      await navigator.clipboard.writeText(shareText);
      
      const originalErr = err;
      setErr("Post content copied!");
      setTimeout(() => setErr(originalErr), 2000);
      setShareDropdownOpen("");
    } catch (e) {
      setErr("Failed to copy content");
    }
  }

  function shareToTwitter(post) {
    const text = `Check out this post by ${userName(post.user)} on Moondala: "${post.text}"`;
    const shareUrl = userId 
      ? `${window.location.origin}/feed/user/${userId}` 
      : `${window.location.origin}/feed`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareViaEmail(post) {
    const subject = `Check out this post from Moondala`;
    const body = `I wanted to share this post with you:\n\n"${post.text}"\n\nBy ${userName(post.user)} on Moondala\n\nCheck it out: ${userId ? `${window.location.origin}/feed/user/${userId}` : `${window.location.origin}/feed`}`;
    
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
    setShareDropdownOpen("");
  }

  function shareToWhatsApp(post) {
    const text = `Check out this post by ${userName(post.user)}: "${post.text}"\n\n${userId ? `${window.location.origin}/feed/user/${userId}` : `${window.location.origin}/feed`}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareToFacebook(post) {
    const shareUrl = userId ? `${window.location.origin}/feed/user/${userId}` : `${window.location.origin}/feed`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(post.text)}`;
    window.open(facebookUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareToLinkedIn(post) {
    const shareUrl = userId ? `${window.location.origin}/feed/user/${userId}` : `${window.location.origin}/feed`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareToTelegram(post) {
    const text = `${post.text}\n\nBy ${userName(post.user)} on Moondala`;
    const shareUrl = userId ? `${window.location.origin}/feed/user/${userId}` : `${window.location.origin}/feed`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareToReddit(post) {
    const shareUrl = userId ? `${window.location.origin}/feed/user/${userId}` : `${window.location.origin}/feed`;
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.text)}`;
    window.open(redditUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareViaSMS(post) {
    const text = `Check out this post: "${post.text}" - ${userName(post.user)} on Moondala\n${userId ? `${window.location.origin}/feed/user/${userId}` : `${window.location.origin}/feed`}`;
    const smsUrl = `sms:?&body=${encodeURIComponent(text)}`;
    window.location.href = smsUrl;
    setShareDropdownOpen("");
  }

  async function downloadPostAsImage(post) {
    try {
      // Simple download of post content as text file
      const content = `${post.text}\n\n- ${userName(post.user)}\nPosted: ${new Date(post.createdAt).toLocaleDateString()}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moondala-post-${post._id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      const originalErr = err;
      setErr("Post downloaded!");
      setTimeout(() => setErr(originalErr), 2000);
      setShareDropdownOpen("");
    } catch (e) {
      setErr("Failed to download post");
    }
  }

  function printPost(post) {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Moondala Post</title>');
    printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:0 auto;}h2{color:#333;}.meta{color:#666;font-size:14px;margin:10px 0;}.content{line-height:1.6;margin:20px 0;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h2>${userName(post.user)}</h2>`);
    printWindow.document.write(`<div class="meta">Posted: ${new Date(post.createdAt).toLocaleString()}</div>`);
    printWindow.document.write(`<div class="content">${post.text.replace(/\n/g, '<br>')}</div>`);
    if (post.media && post.media.url) {
      printWindow.document.write(`<img src="${fixImageUrl(absUrl(post.media.url))}" style="max-width:100%;margin:20px 0;">`);
    }
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    setShareDropdownOpen("");
  }

  async function reportPost(post) {
    const reason = prompt('Why are you reporting this post?\n\nReasons:\n1. Spam\n2. Inappropriate content\n3. Harassment\n4. False information\n5. Other\n\nPlease enter the number (1-5):');
    
    if (!reason) {
      setShareDropdownOpen("");
      return;
    }

    const reasons = {
      '1': 'Spam',
      '2': 'Inappropriate content',
      '3': 'Harassment',
      '4': 'False information',
      '5': 'Other'
    };

    const reportReason = reasons[reason] || 'Other';
    
    try {
      // TODO: Implement backend API call to report post
      // await apiPost(`/posts/${post._id}/report`, { reason: reportReason });
      
      const originalErr = err;
      setErr(`Post reported for: ${reportReason}. Thank you for helping keep Moondala safe.`);
      setTimeout(() => setErr(originalErr), 3000);
      setShareDropdownOpen("");
    } catch (e) {
      setErr("Failed to report post");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Feed Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Create Post Widget - Only show if viewing own feed */}
        {!userId && (
          <div className="glass-card rounded-2xl p-4">
          <div className="flex gap-4">
            <div className="md-avatarRingSm flex-shrink-0">
              {avatarUrl(me) ? (
                <img
                  src={avatarUrl(me)}
                  alt="Me"
                  className="md-avatarImgSm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="md-avatarFallbackSm" 
                style={{ display: avatarUrl(me) ? 'none' : 'flex' }}
              >
                {(userName(me) || "M").slice(0, 1).toUpperCase()}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="What's happening in your universe?"
                className="md-postBox"
              />

              {selectedFile ? (
                <div className="md-fileRow">
                  <div className="md-fileChip">
                    <span className="md-fileName">{selectedFile.name}</span>
                    <button
                      type="button"
                      className="md-fileRemove"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (f) setSelectedFile(f);
                    }}
                  />
                  <button
                    type="button"
                    className="md-btnGhost"
                    onClick={() => fileRef.current && fileRef.current.click()}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Photo/Video
                  </button>

                  <button type="button" className="md-btnGhost" onClick={loadFeed}>
                    Refresh
                  </button>
                </div>

                <button
                  type="button"
                  className="md-btnPrimary"
                  disabled={posting || (!s(newPostText) && !selectedFile)}
                  onClick={onCreatePost}
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>

          {err ? (
            <div className={cx("rounded-2xl p-5", isPrivateFeed ? "glass-card bg-blue-500/10 border border-blue-500/30" : "md-error")}>
              <div className="flex items-start justify-between gap-3">
                <p className={isPrivateFeed ? "text-blue-200" : ""}>{err}</p>
                {err && (
                  <button
                    type="button"
                    className="text-white/50 hover:text-white"
                    onClick={() => setErr("")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {isPrivateFeed && userId && !friendRequestSent && (
                <div className="mt-4 pt-4 border-t border-blue-500/20">
                  <button
                    type="button"
                    className="md-btnPrimary"
                    disabled={sendingFriendRequest}
                    onClick={sendFriendRequestToUser}
                  >
                    {sendingFriendRequest ? "Sending..." : "Send Friend Request"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
          </div>
        )}

        {/* Posts Stream */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-64 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {posts.map((post) => {
              const uid = pickId(post.user);
              return (
                <motion.div
                  key={post._id}
                  variants={item}
                  className="glass-card rounded-2xl p-5 hover:border-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center">
                        {avatarUrl(post.user) ? (
                          <img
                            src={avatarUrl(post.user)}
                            alt={userName(post.user)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML = `<div class="text-white text-sm font-bold">${userName(post.user).charAt(0).toUpperCase()}</div>`;
                            }}
                          />
                        ) : (
                          <div className="text-white text-sm font-bold">
                            {userName(post.user).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground hover:underline cursor-pointer">
                          {userName(post.user)}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Edit/Delete buttons for own posts */}
                    {pickId(post.user) === pickId(me) ? (
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          className="md-iconBtn" 
                          onClick={() => startEditingPost(post)}
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          type="button" 
                          className="md-iconBtn text-red-400 hover:text-red-300" 
                          onClick={() => handleDeletePost(post._id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="md-iconBtn" title="More">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Post text - editable if editing */}
                  {editingPostId === post._id ? (
                    <div className="mb-4">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="md-postBox"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          className="md-btnPrimary"
                          onClick={handleUpdatePost}
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          type="button"
                          className="md-btnGhost"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-base text-slate-200 mb-4 whitespace-pre-wrap leading-relaxed">
                      {post.text}
                    </p>
                  )}

                  {post.media && post.media.type === "image" ? (
                    (() => {
                      const mediaUrl = fixImageUrl(absUrl(post.media.url));
                      const hasFailed = failedImages.has(mediaUrl);
                      
                      return (
                        <div className="mb-4 rounded-xl overflow-hidden border border-white/5 bg-black/20">
                          {hasFailed ? (
                            <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/2">
                              <div className="text-center">
                                <ImageIcon className="w-12 h-12 text-white/30 mx-auto mb-2" />
                                <p className="text-sm text-white/40">Image unavailable</p>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={mediaUrl}
                              alt="Post"
                              className="w-full max-h-[520px] object-contain"
                              onError={() => {
                                console.warn(`[Feed] image failed to load: ${mediaUrl}`);
                                setFailedImages(prev => new Set([...prev, mediaUrl]));
                              }}
                            />
                          )}
                        </div>
                      );
                    })()
                  ) : null}

                  {post.media && post.media.type === "video" ? (
                    <div className="mb-4 rounded-xl overflow-hidden border border-white/5 bg-black/20">
                      <video
                        src={fixImageUrl(absUrl(post.media.url))}
                        controls
                        className="w-full max-h-[520px]"
                      />
                    </div>
                  ) : null}

                  <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => onLike(post._id)}
                      className="md-actionBtn hover-pink group"
                    >
                      <span className="md-actionIconWrap group-hover:bg-pink-500/10">
                        <Heart className={`w-5 h-5 ${post.likedByMe ? 'fill-current text-pink-500' : ''}`} />
                      </span>
                      <span className="text-sm font-semibold">{post.likesCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openComments(post._id)}
                      className="md-actionBtn hover-blue group"
                    >
                      <span className="md-actionIconWrap group-hover:bg-blue-400/10">
                        <MessageCircle className="w-5 h-5" />
                      </span>
                      <span className="text-sm font-semibold">{post.commentsCount}</span>
                    </button>

                    <div className="relative ml-auto">
                      <button
                        type="button"
                        className="md-actionBtn hover-green group"
                        onClick={() => toggleShareDropdown(post._id)}
                        title="Share post"
                      >
                        <span className="md-actionIconWrap group-hover:bg-green-400/10">
                          <Share2 className="w-5 h-5" />
                        </span>
                      </button>
                      
                      {/* Share Dropdown */}
                      {shareDropdownOpen === post._id && (
                        <div className="absolute right-0 top-10 glass-card rounded-xl p-2 z-10 min-w-[200px] max-h-[400px] overflow-y-auto shadow-lg border border-white/10">
                          <button
                            onClick={() => copyPostLink(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <Link className="w-4 h-4" />
                            Copy Link
                          </button>
                          
                          <button
                            onClick={() => copyPostContent(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Content
                          </button>
                          
                          <div className="border-t border-white/10 my-1"></div>
                          
                          <button
                            onClick={() => shareToWhatsApp(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <MessageCircleWarning className="w-4 h-4" />
                            WhatsApp
                          </button>
                          
                          <button
                            onClick={() => shareToFacebook(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            Facebook
                          </button>
                          
                          <button
                            onClick={() => shareToLinkedIn(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                            LinkedIn
                          </button>
                          
                          <button
                            onClick={() => shareToTelegram(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            Telegram
                          </button>
                          
                          <button
                            onClick={() => shareToReddit(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            Reddit
                          </button>
                          
                          <button
                            onClick={() => shareToTwitter(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <Twitter className="w-4 h-4" />
                            Twitter
                          </button>
                          
                          <button
                            onClick={() => shareViaEmail(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </button>
                          
                          <button
                            onClick={() => shareViaSMS(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            SMS/Text
                          </button>
                          
                          <div className="border-t border-white/10 my-1"></div>
                          
                          <button
                            onClick={() => downloadPostAsImage(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          
                          <button
                            onClick={() => printPost(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                            Print
                          </button>
                          
                          <div className="border-t border-white/10 my-1"></div>
                          
                          <button
                            onClick={() => reportPost(post)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Flag className="w-4 h-4" />
                            Report Post
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comments Drawer (simple) */}
                  {openPostId === post._id && (
                    <div className="mt-4 md-commentBox">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-bold">Add a comment</div>
                        <button
                          type="button"
                          className="md-iconBtn"
                          onClick={() => setOpenPostId("")}
                          title="Close"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Comments List */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                          {post.comments.map((comment) => (
                            <div key={comment._id} className="bg-white/5 p-3 rounded-lg">
                              <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0">
                                  {avatarUrl(comment.authorId) ? (
                                    <img
                                      src={avatarUrl(comment.authorId)}
                                      alt={userName(comment.authorId)}
                                      className="w-full h-full object-cover rounded-full"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs">
                                      {(userName(comment.authorId) || "U").slice(0, 1).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-white">
                                      {userName(comment.authorId)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {timeAgo(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-200 mb-2">{comment.text}</p>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      className="text-xs text-blue-400 hover:underline"
                                      onClick={() => setReplyTo(comment)}
                                    >
                                      Reply
                                    </button>
                                    {pickId(comment.authorId) === pickId(me) && (
                                      <button
                                        type="button"
                                        className="text-xs text-red-400 hover:underline flex items-center gap-1"
                                        onClick={() => deleteComment(post._id, comment._id)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="md-commentInput"
                          placeholder={replyTo ? `Reply to ${userName(replyTo.authorId)}...` : "Write something..."}
                        />
                        <button
                          type="button"
                          className="md-btnPrimary"
                          disabled={commentBusy || !s(commentText)}
                          onClick={submitComment}
                          title="Send"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>


      {/* Right Sidebar - FIXED positioning */}
      <div className="fixed right-0 top-20 w-80 h-screen overflow-y-auto pr-2 hidden lg:flex flex-col gap-6 pt-4">
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-display font-bold text-lg mb-4 text-white">Trending</h2>
          <div className="space-y-4">
            {["#Moondala", "#SocialCommerce", "#ReferralNetwork", "#FutureOfShopping"].map((tag) => (
              <div key={tag} className="flex justify-between items-center group cursor-pointer">
                <span className="text-muted-foreground group-hover:text-primary transition-colors">
                  {tag}
                </span>
                <span className="text-xs text-muted-foreground/60">—</span>
              </div>
            ))}
          </div>
          <button type="button" className="md-btnOutline w-full mt-6">
            Explore
          </button>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-display font-bold text-lg mb-4 text-white">
            Suggested People
          </h2>
          <div className="text-sm text-muted-foreground">
            Suggestions need a backend endpoint. We can add it after the feed is stable.
          </div>
          <button type="button" className="md-btnGhost w-full mt-4">
            <Users className="w-4 h-4" />
            Find Friends
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
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
  ThumbsUp,
  TrendingUp,
} from "lucide-react";

import {
  apiUpload,
  getMyFeed,
  getPost,
  getPostsByUser,
  likePost,
  addComment,
  likeComment,
  updatePost,
  deletePost,
  absUrl,
  pickId,
  getUserSession,
  fixImageUrl,
  safeImageUrl,
  sendFriendRequest,
  toAbsUrl,
  getMyUserProfile,
  setUserSession,
} from "../api.jsx";

import TopInvitersList from "../components/TopInvitersList";

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
  // Check ALL possible fields
  const url = u?.avatarUrl || u?.avatar || u?.photoUrl || u?.profilePic || u?.image || "";
  
  // ✅ Filter out Moondala logo - it's not a user avatar!
  if (url && url.includes('moondala-logo')) return null;
  
  return url ? safeImageUrl(url, 'avatar', u) : null;
}

function normalizePost(p) {

  // Debug: log post object to inspect media fields
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (window.__DEBUG_FEED_POSTS !== true) {
        console.log('[Feed] Post object:', p);
        window.__DEBUG_FEED_POSTS = true;
      }
    } catch {}
  }

  // Your backend might return `{ user }`, `{ author }`, `{ createdBy }`, or just a user id string
  let user = p?.user || p?.author || p?.createdBy || p?.userId || {};
  // If backend returned a simple id string/number, coerce into an object so helpers can read fields
  if (typeof user === 'string' || typeof user === 'number') {
    user = { _id: String(user) };
  }
  // If backend returned an object with `id` but not `_id`, copy it for consistency
  else if (user && typeof user === 'object' && !user._id && user.id) {
    user._id = user.id;
  }
  // Patch: Always extract Cloudinary image URL from all possible fields
  let media = null;
  // 1. Check media array/object
  if (p?.media) {
    if (Array.isArray(p.media) && p.media.length > 0) {
      const first = p.media[0];
      if (first?.url) media = { type: first.type || (/video/i.test(first.url) ? 'video' : 'image'), url: first.url };
      else if (typeof first === 'string') media = { type: 'image', url: first };
      else if (typeof first === 'object') {
        const u = String(first.url || first.path || first.image || first.filename || '').trim();
        if (u) media = { type: 'image', url: u };
      }
    } else if (typeof p.media === 'object') {
      const u = String(p.media.url || p.media.path || p.media.image || p.media.filename || '').trim();
      if (u) media = { type: p.media.type || (/video/i.test(u) ? 'video' : 'image'), url: u };
    }
  }
  // 2. Check mediaUrl
  if (!media && p?.mediaUrl) {
    const url = String(p.mediaUrl || '').trim();
    if (url) media = { type: /video/i.test(url) ? 'video' : 'image', url };
  }
  // 3. Check imageUrl, videoUrl
  if (!media && p?.imageUrl) {
    const url = String(p.imageUrl || '').trim();
    if (url) media = { type: 'image', url };
  }
  if (!media && p?.videoUrl) {
    const url = String(p.videoUrl || '').trim();
    if (url) media = { type: 'video', url };
  }
  // 4. Check images array
  if (!media && Array.isArray(p?.images) && p.images.length > 0) {
    const first = p.images[0];
    if (typeof first === 'string') media = { type: 'image', url: first };
    else if (typeof first === 'object') {
      const u = String(first.url || first.path || first.image || first.filename || '').trim();
      if (u) media = { type: 'image', url: u };
    }
  }
  // 5. Check filename
  if (!media && p?.filename) {
    const url = `/uploads/${String(p.filename)}`;
    if (url) media = { type: 'image', url };
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
  const { userId, postId } = useParams(); // Get params
  const navigate = useNavigate();
  const [me, setMe] = useState(() => getUserSession()); // Keep session fresh
  const [profileUser, setProfileUser] = useState(null); // User profile when viewing another user
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState("");
  const [friendRequestSentToProfile, setFriendRequestSentToProfile] = useState(false);

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
  const [friendRequestMessage, setFriendRequestMessage] = useState("");

  // top inviters
  const [topInviters, setTopInviters] = useState([]);
  const [loadingInviters, setLoadingInviters] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Sync user profile to ensure avatar is up to date
  useEffect(() => {
    async function syncProfile() {
      try {
        const data = await getMyUserProfile();
        if (data?.user) {
          setMe(data.user);
          setUserSession({ user: data.user });
        }
      } catch (err) {
        // failed to sync, just keep using localStorage
      }
    }
    syncProfile();
  }, []);

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
    setProfileUser(null);
    try {
      let data;
      
      // ✅ 1. Single Post View
      if (postId) {
        const res = await getPost(postId);
        data = res.post ? [res.post] : [];
      }
      // ✅ 2. User Profile Feed
      else if (userId) {
        // Fetch user profile first
        try {
          const { getUserProfile } = await import('../api.jsx');
          const profileData = await getUserProfile(userId);
          
          // ✅ Set profile user (even if private/403, we get basic info)
          if (profileData?.user) {
            setProfileUser(profileData.user);
            
            // ✅ Check for pending friend request
            if (profileData.user.hasPendingRequest) {
              setFriendRequestSentToProfile(true); 
              setFriendRequestSent(true);
            }
          }
        } catch (profileErr) {
          console.warn('Failed to load profile:', profileErr);
        }
        
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
      
      // ✅ Handle 403 (private feed) - BUT NOT if users are friends!
      const areFriends = profileUser?.isFriend || profileUser?.areFriends || profileUser?.friendship?.status === 'accepted';
      
      if (e?.status === 403 && !areFriends) {
        setErr(postId ? "This post is private." : "This user's feed is private.");
        if (!postId) setIsPrivateFeed(true);
      } else if ((e?.message?.includes("private") || e?.data?.message?.includes("private")) && !areFriends) {
        // Backend returns message like "This user's feed is private (friends only)."
        setErr(e?.data?.message || e?.message || (postId ? "This post is private." : "This user's feed is private."));
        if (!postId) setIsPrivateFeed(true);
      } else if (e?.status === 404) {
        setErr(postId ? "Post not found." : "User not found.");
      } else if (areFriends) {
        // If they're friends but still got an error, show a different message
        setErr("Unable to load feed. Please try again.");
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

    const message = s(friendRequestMessage) || "I'd like to be friends!";

    setSendingFriendRequest(true);
    try {
      await sendFriendRequest(userId, message);
      setFriendRequestSent(true);
      setFriendRequestMessage("");
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
  }, [userId, postId]);

  // Load top inviters on mount
  useEffect(() => {
    async function loadInviters() {
      setLoadingInviters(true);
      try {
        const data = await getTopInviters(5);
        setTopInviters(data);
      } catch (e) {
        console.error("Failed to load top inviters:", e);
      } finally {
        setLoadingInviters(false);
      }
    }
    loadInviters();
  }, []);

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

  // Add Friend Handler
  async function handleAddFriend() {
    if (!profileUser?._id) {
      console.error("handleAddFriend: No profileUser._id");
      return;
    }
    
    try {
      const { sendFriendRequest } = await import('../api.jsx');
      await sendFriendRequest(profileUser._id, `Hi ${userName(profileUser)}, I'd like to connect with you on Moondala!`);
      
      setFriendRequestSentToProfile(true);
      setErr("Friend request sent successfully!");
    } catch (e) {
      console.error('Add friend error:', e);
      setErr(e?.message || "Failed to send friend request");
    }
  }

  // Message Handler
  async function handleMessage() {
    if (!profileUser?._id) {
       return;
    }

    try {
      const { getOrCreateConversation } = await import('../api.jsx');
      const result = await getOrCreateConversation({
        participantType: 'user',
        participantId: profileUser._id,
        topic: 'general'
      });
      
      const conversationId = result._id || result.id; // handle varying formats
      if (!conversationId) throw new Error("No conversation ID returned");

      navigate(`/messages/${conversationId}`);
    } catch (e) {
      console.error('Message error:', e);
      setErr(e?.message || "Failed to start conversation");
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
      // Create optimistic comment
      const optimisticComment = {
        _id: `temp-${Date.now()}`,
        text,
        parentComment: replyTo?._id || null,
        createdAt: new Date().toISOString(),
        authorId: me?.user?._id || me?._id,
        authorModel: "User",
        // Include user info for immediate display
        user: me?.user || me,
      };

      // Optimistically add comment to UI immediately
      setPosts((prev) =>
        prev.map((p) =>
          p._id === pid
            ? {
                ...p,
                comments: [...(p.comments || []), optimisticComment],
                commentsCount: Number(p.commentsCount || 0) + 1,
              }
            : p
        )
      );

      setCommentText("");
      setReplyTo(null);
      // Keep drawer open so user can see their comment

      // Send to server and update with real data
      const result = await addComment(pid, { text, parentComment: replyTo?._id });
      
      // If server returns updated post, use that for accurate data
      if (result?.post) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === pid ? normalizePost(result.post) : p
          )
        );
      }
    } catch (e) {
      // Revert optimistic update on error
      setPosts((prev) =>
        prev.map((p) =>
          p._id === pid
            ? {
                ...p,
                comments: (p.comments || []).filter((c) => !String(c._id).startsWith("temp-")),
                commentsCount: Math.max(0, Number(p.commentsCount || 0) - 1),
              }
            : p
        )
      );
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

  async function handleLikeComment(postId, commentId) {
    const pid = s(postId);
    const cid = s(commentId);
    if (!pid || !cid) return;

    const myId = pickId(me);

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === pid) {
          const updatedComments = (p.comments || []).map((c) => {
            if (String(c._id) === cid) {
              const likes = Array.isArray(c.likes) ? [...c.likes] : [];
              const idx = likes.findIndex((id) => String(id) === String(myId));
              if (idx > -1) {
                likes.splice(idx, 1); // Unlike
              } else {
                likes.push(myId); // Like
              }
              return { ...c, likes };
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );

    try {
      await likeComment(pid, cid);
    } catch (e) {
      // Revert on error
      await loadFeed();
      setErr(e?.message || "Like comment failed.");
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

  function getPostPermaLink(post) {
    if (!post?._id) return window.location.href;
    return `${window.location.origin}/feed/post/${post._id}`;
  }

  async function copyPostLink(post) {
    try {
      const shareUrl = getPostPermaLink(post);
      
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
    const shareUrl = getPostPermaLink(post);
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareViaEmail(post) {
    const subject = `Check out this post from Moondala`;
    const body = `I wanted to share this post with you:\n\n"${post.text}"\n\nBy ${userName(post.user)} on Moondala\n\nCheck it out: ${getPostPermaLink(post)}`;
    
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
    setShareDropdownOpen("");
  }

  function shareToWhatsApp(post) {
    const text = `Check out this post by ${userName(post.user)}: "${post.text}"\n\n${getPostPermaLink(post)}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareToFacebook(post) {
    const shareUrl = getPostPermaLink(post);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(post.text)}`;
    window.open(facebookUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareToLinkedIn(post) {
    const shareUrl = getPostPermaLink(post);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareToTelegram(post) {
    const text = `${post.text}\n\nBy ${userName(post.user)} on Moondala`;
    const shareUrl = getPostPermaLink(post);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareToReddit(post) {
    const shareUrl = getPostPermaLink(post);
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.text)}`;
    window.open(redditUrl, '_blank');
    setShareDropdownOpen("");
  }

  function shareViaSMS(post) {
    const text = `Check out this post: "${post.text}" - ${userName(post.user)} on Moondala\n${getPostPermaLink(post)}`;
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
        {/* User Profile Header - Show when viewing another user */}
        {userId && profileUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-start gap-6">
              <div className="md-avatarRingLg flex-shrink-0">
                {avatarUrl(profileUser) ? (
                  <img
                    src={avatarUrl(profileUser)}
                    alt={userName(profileUser)}
                    className="md-avatarImgLg"
                  />
                ) : (
                  <div className="md-avatarFallbackLg">
                    {(userName(profileUser) || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {userName(profileUser)}
                </h1>
                {profileUser.email && (
                  <p className="text-sm text-muted-foreground mb-3">{profileUser.email}</p>
                )}
                {profileUser.referralCode && (
                  <p className="text-xs text-muted-foreground/60 mb-3">Code: {profileUser.referralCode}</p>
                )}
                
                {/* Action Buttons */}
                {userId !== me?._id && (
                  <div className="flex gap-3 mt-4">
                    {/* Show Add Friend button if NOT already friends (even for private accounts) */}
                    {!profileUser.isFriend && !profileUser.areFriends && (
                      <button
                        onClick={handleAddFriend}
                        disabled={friendRequestSentToProfile}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {friendRequestSentToProfile ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Friend Request Sent
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Add Friend
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Show "Friends" badge if already friends */}
                    {(profileUser.isFriend || profileUser.areFriends) && (
                      <div className="flex-1 px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg font-medium flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Friends
                      </div>
                    )}
                    
                    <button
                      onClick={handleMessage}
                      className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </button>
                  </div>
                )}
                
                {/* Add Friend Button for Private Accounts */}
                {isPrivateFeed && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-400 mb-3">This account is private</p>
                    {!friendRequestSent ? (
                      <div className="space-y-3">
                        <textarea
                          value={friendRequestMessage}
                          onChange={(e) => setFriendRequestMessage(e.target.value)}
                          placeholder="Include a message with your friend request..."
                          className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-sm text-white resize-none"
                          rows={3}
                        />
                        <button
                          onClick={sendFriendRequestToUser}
                          disabled={sendingFriendRequest}
                          className="w-full md-btnPrimary"
                        >
                          {sendingFriendRequest ? "Sending..." : "Send Friend Request"}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-green-400">✓ Friend request sent!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Create Post Widget - Only show if viewing own feed */}
        {!userId && (
          <div className="glass-card rounded-2xl p-4">
          <div className="flex gap-4">
            <RouterLink 
              to="/profile"
              className="md-avatarRingSm flex-shrink-0 hover:opacity-80 transition-opacity"
            >
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
            </RouterLink>

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
                <div className="mt-4 pt-4 border-t border-blue-500/20 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Send a message (optional):
                    </label>
                    <textarea
                      value={friendRequestMessage}
                      onChange={(e) => setFriendRequestMessage(e.target.value)}
                      placeholder="Hi! I'd like to connect with you..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 resize-none"
                      maxLength={200}
                    />
                    <div className="text-xs text-blue-300/60 mt-1">
                      {friendRequestMessage.length}/200 characters
                    </div>
                  </div>
                  <button
                    type="button"
                    className="md-btnPrimary w-full"
                    disabled={sendingFriendRequest}
                    onClick={sendFriendRequestToUser}
                  >
                    {sendingFriendRequest ? "Sending Request..." : "Send Friend Request"}
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
                      <RouterLink 
                        to={pickId(post.user) === pickId(me) ? '/feed' : `/feed/user/${post.user._id}`}
                        className="w-10 h-10 rounded-full bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center hover:opacity-80 transition-opacity"
                      >
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
                      </RouterLink>
                      <div>
                        <RouterLink to={pickId(post.user) === pickId(me) ? '/feed' : `/feed/user/${post.user._id}`}>
                          <h3 className="font-bold text-foreground hover:underline cursor-pointer">
                            {userName(post.user)}
                          </h3>
                        </RouterLink>
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
                      const rawUrl = post.media.url;
                      const mediaUrl = toAbsUrl(rawUrl);
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
                              className="w-full max-h-[520px] object-contain cursor-pointer"
                              onClick={() => setLightboxImage(mediaUrl)}
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
                        src={toAbsUrl(post.media.url)}
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

                      {/* Reply indicator */}
                      {replyTo && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-blue-500/10 rounded-lg">
                          <span className="text-xs text-blue-400">
                            Replying to {userName(replyTo.user || replyTo.authorId)}
                          </span>
                          <button
                            type="button"
                            className="text-xs text-gray-400 hover:text-white"
                            onClick={() => setReplyTo(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Comments List - organized with replies */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                          {/* Filter to show top-level comments first, then their replies */}
                          {post.comments
                            .filter((c) => !c.parentComment) // Top-level comments
                            .map((comment) => {
                              const commentUser = comment.user || comment.authorId;
                              const replies = post.comments.filter(
                                (r) => String(r.parentComment) === String(comment._id)
                              );
                              return (
                                <div key={comment._id}>
                                  {/* Main comment */}
                                  <div className="bg-white/5 p-3 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <RouterLink
                                        to={`/feed/user/${pickId(commentUser)}`}
                                        className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0 hover:opacity-80 transition-opacity"
                                      >
                                        {avatarUrl(commentUser) ? (
                                          <img
                                            src={avatarUrl(commentUser)}
                                            alt={userName(commentUser)}
                                            className="w-full h-full object-cover rounded-full"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-xs">
                                            {(userName(commentUser) || "U").slice(0, 1).toUpperCase()}
                                          </div>
                                        )}
                                      </RouterLink>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <RouterLink
                                            to={`/feed/user/${pickId(commentUser)}`}
                                            className="font-semibold text-sm text-white hover:underline"
                                          >
                                            {userName(commentUser)}
                                          </RouterLink>
                                          <span className="text-xs text-gray-400">
                                            {timeAgo(comment.createdAt)}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-200 mb-2">{comment.text}</p>
                                        <div className="flex gap-3 items-center">
                                          <button
                                            type="button"
                                            className={`text-xs flex items-center gap-1 ${
                                              (comment.likes || []).some((id) => String(id) === String(pickId(me)))
                                                ? "text-pink-400"
                                                : "text-gray-400 hover:text-pink-400"
                                            }`}
                                            onClick={() => handleLikeComment(post._id, comment._id)}
                                          >
                                            <ThumbsUp className="w-3 h-3" />
                                            {(comment.likes || []).length > 0 && (comment.likes || []).length}
                                          </button>
                                          <button
                                            type="button"
                                            className="text-xs text-blue-400 hover:underline"
                                            onClick={() => setReplyTo(comment)}
                                          >
                                            Reply
                                          </button>
                                          {(pickId(comment.authorId) === pickId(me) || pickId(commentUser) === pickId(me)) && (
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

                                  {/* Replies - nested */}
                                  {replies.length > 0 && (
                                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-white/10 pl-3">
                                      {replies.map((reply) => {
                                        const replyUser = reply.user || reply.authorId;
                                        return (
                                          <div key={reply._id} className="bg-white/5 p-2 rounded-lg">
                                            <div className="flex items-start gap-2">
                                              <RouterLink
                                                to={`/feed/user/${pickId(replyUser)}`}
                                                className="w-5 h-5 rounded-full bg-white/10 flex-shrink-0 hover:opacity-80 transition-opacity"
                                              >
                                                {avatarUrl(replyUser) ? (
                                                  <img
                                                    src={avatarUrl(replyUser)}
                                                    alt={userName(replyUser)}
                                                    className="w-full h-full object-cover rounded-full"
                                                  />
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-center text-[10px]">
                                                    {(userName(replyUser) || "U").slice(0, 1).toUpperCase()}
                                                  </div>
                                                )}
                                              </RouterLink>
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <RouterLink
                                                    to={`/feed/user/${pickId(replyUser)}`}
                                                    className="font-semibold text-xs text-white hover:underline"
                                                  >
                                                    {userName(replyUser)}
                                                  </RouterLink>
                                                  <span className="text-[10px] text-gray-400">
                                                    {timeAgo(reply.createdAt)}
                                                  </span>
                                                </div>
                                                <p className="text-xs text-gray-200 mb-1">{reply.text}</p>
                                                <div className="flex gap-2 items-center">
                                                  <button
                                                    type="button"
                                                    className={`text-[10px] flex items-center gap-1 ${
                                                      (reply.likes || []).some((id) => String(id) === String(pickId(me)))
                                                        ? "text-pink-400"
                                                        : "text-gray-400 hover:text-pink-400"
                                                    }`}
                                                    onClick={() => handleLikeComment(post._id, reply._id)}
                                                  >
                                                    <ThumbsUp className="w-2.5 h-2.5" />
                                                    {(reply.likes || []).length > 0 && (reply.likes || []).length}
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className="text-[10px] text-blue-400 hover:underline"
                                                    onClick={() => setReplyTo(reply)}
                                                  >
                                                    Reply
                                                  </button>
                                                  {(pickId(reply.authorId) === pickId(me) || pickId(replyUser) === pickId(me)) && (
                                                    <button
                                                      type="button"
                                                      className="text-[10px] text-red-400 hover:underline flex items-center gap-1"
                                                      onClick={() => deleteComment(post._id, reply._id)}
                                                    >
                                                      <Trash2 className="w-2.5 h-2.5" />
                                                      Delete
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="md-commentInput"
                          placeholder={replyTo ? `Reply to ${userName(replyTo.user || replyTo.authorId)}...` : "Write something..."}
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
        {/* Top Inviters - First */}
        <TopInvitersList />

        {/* Trending - Second */}
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
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            type="button" 
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 rounded-full p-2 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Full screen" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { User, Calendar, Eye, Lock, UserPlus } from "lucide-react";
import { safeImageUrl, API_BASE, sendFriendRequest } from "../api.jsx";

export default function PublicUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [isPrivateFeed, setIsPrivateFeed] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  console.log("PublicUserProfile component loaded with userId:", userId);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true);
        setError("");
        setIsPrivateProfile(false);
        setIsPrivateFeed(false);
        setPosts([]);
        
        const response = await fetch(`${API_BASE}/api/public/user/${encodeURIComponent(userId)}`);
        const data = await response.json();
        
        // ✅ Handle 403 (private profile)
        if (response.status === 403) {
          setIsPrivateProfile(true);
          setUser(data?.user || null);
          setError(data?.message || "This profile is private.");
          return;
        }
        
        if (!response.ok) {
          throw new Error(data?.message || "User not found");
        }
        
        setUser(data?.user || data);
        
        // ✅ Try to load user's posts (will be 403 if feed is private)
        try {
          const token = localStorage.getItem('userToken');
          const postsResponse = await fetch(`${API_BASE}/api/posts/user/${encodeURIComponent(userId)}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          });
          
          if (postsResponse.status === 403) {
            // Feed is private - that's ok, just show the profile with friendly message
            setIsPrivateFeed(true);
            setPosts([]);
          } else if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            setPosts(postsData.posts || []);
          }
          // Otherwise silently ignore post load errors (network issues, etc.)
        } catch (err) {
          // Silently fail - profile is still shown
          console.log("Could not load posts:", err.message);
        }
      } catch (err) {
        setError(err.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const handleSendFriendRequest = async () => {
    if (!userId || sendingRequest || requestSent) return;
    
    setSendingRequest(true);
    try {
      await sendFriendRequest(userId, "I'd like to be friends!");
      setRequestSent(true);
      setError("Friend request sent! Waiting for acceptance.");
    } catch (err) {
      setError(`Failed to send friend request: ${err?.message || err}`);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleViewFeed = () => {
    navigate(`/feed/user/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center">
        <div className={`glass-card rounded-2xl p-8 text-center max-w-md ${isPrivateProfile ? "bg-blue-500/10 border border-blue-500/30" : ""}`}>
          <div className={isPrivateProfile ? "text-blue-200" : "text-red-400"}>
            {error}
          </div>
          
          {/* ✅ Show Add Friend button for private profiles */}
          {isPrivateProfile && userId && !requestSent && (
            <button
              onClick={handleSendFriendRequest}
              disabled={sendingRequest}
              className="mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-lg transition-colors w-full"
            >
              <UserPlus className="w-4 h-4" />
              {sendingRequest ? "Sending..." : "Send Friend Request"}
            </button>
          )}
          
          {/* Show success message */}
          {requestSent && (
            <div className="mt-6 text-blue-300">
              Request sent! Add them to see their full profile.
            </div>
          )}
          
          <Link 
            to="/search" 
            className="text-purple-400 hover:text-purple-300 transition-colors inline-block mt-6"
          >
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <div className="text-gray-400 mb-4">User not found</div>
          <Link 
            to="/search" 
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const userName = user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User";
  const avatarUrl = safeImageUrl(user.avatar || user.avatarUrl || user.profilePic, 'avatar', user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/search" 
            className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-2"
          >
            ← Back to Search
          </Link>
        </div>

        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-8 text-center">
          {/* Avatar */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = `<div class="text-white text-3xl font-bold">${userName.charAt(0).toUpperCase()}</div>`;
                }}
              />
            ) : (
              <div className="text-white text-3xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <h1 className="text-2xl font-bold text-white mb-2">{userName}</h1>
          
          {user.email && (
            <p className="text-gray-300 mb-4">{user.email}</p>
          )}

          {user.createdAt && (
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
              <Calendar className="w-4 h-4" />
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </div>
          )}

          {/* Feed Status - Show private message if feed is private */}
          {isPrivateFeed && (
            <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
                <Lock className="w-4 h-4" />
                This user's feed is private (friends only)
              </div>
              {requestSent ? (
                <div className="text-blue-300 text-sm">
                  Friend request sent! Once accepted, you'll be able to see their posts.
                </div>
              ) : (
                <button
                  onClick={handleSendFriendRequest}
                  disabled={sendingRequest}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-lg transition-colors w-full"
                >
                  <UserPlus className="w-4 h-4" />
                  {sendingRequest ? "Sending..." : "Send Friend Request"}
                </button>
              )}
            </div>
          )}

          {/* Posts Section */}
          {!isPrivateFeed && posts.length > 0 && (
            <div className="mt-8 border-t border-white/10 pt-6">
              <h2 className="text-xl font-bold text-white mb-4">Posts ({posts.length})</h2>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-300 text-sm">{post.content}</p>
                    {post.createdAt && (
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isPrivateFeed && posts.length === 0 && (
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-gray-400">No posts yet</p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Lock className="w-4 h-4" />
              Some content may be private and only visible to friends
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
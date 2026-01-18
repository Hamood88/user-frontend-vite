import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { User, Calendar, Eye, Lock } from "lucide-react";
import { safeImageUrl, API_BASE } from "../api.jsx";

export default function PublicUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true);
        setError("");
        
        const response = await fetch(`${API_BASE}/api/public/user/${encodeURIComponent(userId)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data?.message || "User not found");
        }
        
        setUser(data);
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
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <div className="text-red-400 mb-4">{error}</div>
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

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleViewFeed}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
            >
              <Eye className="w-5 h-5" />
              View Feed
            </button>
          </div>

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
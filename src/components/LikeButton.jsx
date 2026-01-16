import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LikeButton = ({ postId, initialLikes, onToggle }) => {
  const [likes, setLikes] = useState(initialLikes.length);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setLiked(initialLikes.includes(userId));
  }, [initialLikes]);

  const toggleLike = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.patch(
      `https://moondala-backend.onrender.com/api/posts/${postId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLikes(res.data.likes.length);
    setLiked(!liked);
    if (onToggle) onToggle();
  };

  return (
    <button onClick={toggleLike}>
      {liked ? '❤️' : '🤍'} {likes}
    </button>
  );
};

export default LikeButton;

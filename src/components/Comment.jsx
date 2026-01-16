import React, { useState } from 'react';

const Comment = ({ comment, onReply, onLike, postId }) => {
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState('');

  return (
    <div style={{ marginLeft: 20, marginTop: 8 }}>
      <b>{comment.user?.firstName}:</b> {comment.text}
      <span style={{ marginLeft: 8, color: '#888' }}>({comment.likes?.length || 0} likes)</span>
      <button onClick={() => onLike(comment._id)} style={{ marginLeft: 10, fontSize: 12 }}>Like</button>
      <button onClick={() => setShowReply(!showReply)} style={{ marginLeft: 6, fontSize: 12 }}>Reply</button>
      {showReply && (
        <form onSubmit={e => { e.preventDefault(); onReply(comment._id, reply); setReply(''); setShowReply(false); }}>
          <input value={reply} onChange={e => setReply(e.target.value)} style={{ marginLeft: 10 }} />
          <button type="submit" style={{ fontSize: 12, marginLeft: 6 }}>Send</button>
        </form>
      )}
      {comment.comments && comment.comments.map(child => (
        <Comment key={child._id} comment={child} onReply={onReply} onLike={onLike} postId={postId} />
      ))}
    </div>
  );
};

export default Comment;

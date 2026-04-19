import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

function NoteInteraction({ noteId, noteTitle, onError, onSuccess }) {
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchInteractions();
  }, [noteId]);

  const fetchInteractions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/interactions/${noteId}`);
      const allReactions = res.data.likes || [];
      setLikes(allReactions.filter(r => r.reactionType === 'like'));
      setDislikes(allReactions.filter(r => r.reactionType === 'dislike'));
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReaction = async (action) => {
    if (!userId) {
      if (onError) onError('Please sign in to react to notes.');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/interactions/like`, { resourceId: noteId, userId, action });
      fetchInteractions();
    } catch (err) {
      if (onError) onError('Failed to interact with note');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    if (!userId) {
      if (onError) onError('Please sign in to comment.');
      return;
    }
    try {
      const payload = {
        resourceId: noteId,
        userId,
        text: newCommentText,
      };
      if (replyingTo) {
        payload.parentId = replyingTo.id;
      }
      
      const res = await axios.post(`${API_BASE_URL}/api/interactions/comment`, payload);
      setComments([res.data.data, ...comments]);
      setNewCommentText('');
      setReplyingTo(null);
      if (onSuccess) onSuccess('Comment posted successfully!');
    } catch (err) {
      if (onError) onError('Failed to post comment');
    }
  };

  const handleCommentReaction = async (commentId, action) => {
    if (!userId) {
      if (onError) onError('Please sign in to react to comments.');
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/interactions/comment/${commentId}/like`, { userId, action });
      setComments((prev) => 
        prev.map((c) => c._id === commentId ? { ...c, likes: res.data.likes, dislikes: res.data.dislikes } : c)
      );
    } catch (err) {
      console.error(err);
      if (onError) onError('Failed to react to comment');
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const buildCommentTree = () => {
    const commentMap = {};
    const rootComments = [];
    
    // Sort by net score (likes - dislikes), then newest first
    const getScore = (c) => (c.likes?.length || 0) - (c.dislikes?.length || 0);
    const sorted = [...comments].sort((a, b) => {
      const scoreA = getScore(a);
      const scoreB = getScore(b);
      if (scoreA !== scoreB) return scoreB - scoreA; // Highest score first
      return new Date(b.createdAt) - new Date(a.createdAt); // Newest first as tie-breaker
    });

    sorted.forEach(c => {
      commentMap[c._id] = { ...c, children: [] };
    });

    sorted.forEach(c => {
      if (c.parentId) {
        if (commentMap[c.parentId]) {
          commentMap[c.parentId].children.push(commentMap[c._id]);
        } else {
          rootComments.push(commentMap[c._id]);
        }
      } else {
        rootComments.push(commentMap[c._id]);
      }
    });
    
    return rootComments;
  };

  const CommentNode = ({ comment }) => {
    return (
      <div className={`mt-2 ${comment.parentId ? 'pl-4 border-l-2 border-indigo-200 ml-2' : ''}`}>
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <span className="font-semibold text-[11px] text-indigo-700">{comment.name}</span>
            <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm mb-2 text-slate-700">{comment.text}</p>
          <div className="flex gap-4 border-t border-slate-200 pt-2">
            <button 
              type="button" 
              onClick={() => handleCommentReaction(comment._id, 'like')} 
              className={`text-xs font-semibold hover:scale-105 transition-transform flex items-center gap-1 ${(comment.likes || []).includes(userId) ? 'text-rose-600' : 'text-slate-500 hover:text-rose-500'}`}
            >
              <span>{((comment.likes || []).includes(userId)) ? '⬆' : '⇧'}</span>
              <span>{(comment.likes || []).length}</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleCommentReaction(comment._id, 'dislike')} 
              className={`text-xs font-semibold hover:scale-105 transition-transform flex items-center gap-1 ${(comment.dislikes || []).includes(userId) ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-500'}`}
            >
              <span>{((comment.dislikes || []).includes(userId)) ? '⬇' : '⇩'}</span>
              <span>{(comment.dislikes || []).length}</span>
            </button>
            <button 
              type="button" 
              onClick={() => setReplyingTo({ id: comment._id, name: comment.name })} 
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <span>↩</span>
              <span>Reply</span>
            </button>
          </div>
        </div>
        {comment.children && comment.children.length > 0 && (
          <div className="space-y-1">
            {comment.children.map(child => (
               <CommentNode key={child._id} comment={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => handleReaction('like')}
        className={`rounded-md border px-3 py-1 text-[11px] font-medium flex items-center gap-1 hover:shadow-sm ${likes.some(l => l.userId === userId) ? 'border-rose-300 text-rose-700 bg-rose-50' : 'border-slate-300 text-slate-700 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'}`}
      >
        <span>
          {likes.some(l => l.userId === userId) ? '⬆' : '⇧'}
        </span>
        <span>Like ({likes.length})</span>
      </button>
      <button
        type="button"
        onClick={() => handleReaction('dislike')}
        className={`rounded-md border px-3 py-1 text-[11px] font-medium flex items-center gap-1 hover:shadow-sm ${dislikes.some(l => l.userId === userId) ? 'border-indigo-300 text-indigo-700 bg-indigo-50' : 'border-slate-300 text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300'}`}
      >
        <span>
          {dislikes.some(l => l.userId === userId) ? '⬇' : '⇩'}
        </span>
        <span>Dislike ({dislikes.length})</span>
      </button>
      <button
        type="button"
        onClick={() => setCommentsModalOpen(true)}
        className="rounded-md border border-blue-300 px-3 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 hover:shadow-sm"
      >
        <span>💬</span>
        <span>Comments ({comments.length})</span>
      </button>

      {commentsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Comments</h3>
              <button
                type="button"
                onClick={() => setCommentsModalOpen(false)}
                className="text-slate-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 bg-indigo-50/50 border-b border-slate-100 text-sm font-medium text-indigo-900 border-l-4 border-l-indigo-500">
              Discussion on: <span className="font-bold">{noteTitle}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(!comments || comments.length === 0) ? (
                <div className="text-center py-10">
                  <span className="text-4xl">💭</span>
                  <p className="mt-2 text-sm text-slate-500 font-medium">No comments yet. Start the conversation!</p>
                </div>
              ) : (
                buildCommentTree().map((rootComment) => (
                  <CommentNode key={rootComment._id} comment={rootComment} />
                ))
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <form onSubmit={handlePostComment} className="flex flex-col gap-3">
                {replyingTo && (
                   <div className="flex items-center justify-between bg-indigo-100 text-indigo-800 px-3 py-2 rounded-md text-xs font-medium">
                     <span>Replying to <span className="font-bold">{replyingTo.name}</span></span>
                     <button type="button" onClick={cancelReply} className="hover:text-rose-600 font-bold">✕ Cancel</button>
                   </div>
                )}
                <div className="relative">
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    rows={replyingTo ? 2 : 3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-sm"
                    placeholder="Share your thoughts or ask a question..."
                  />
                  <button
                    type="submit"
                    className="absolute bottom-3 right-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 transition-colors hover:shadow-md transform active:scale-95"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NoteInteraction;

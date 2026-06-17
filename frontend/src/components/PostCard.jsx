import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, ThumbsUp, Send } from 'lucide-react';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showActions, setShowActions] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    if (!wasLiked) {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 600);
    }
    try {
      await api.post(`/posts/${post._id}/like`);
    } catch {
      setLiked(wasLiked);
      setLikeCount(c => wasLiked ? c + 1 : c - 1);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onUpdate?.();
    } catch {}
  };

  const isOwner = post.author?._id === user?._id;
  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : 'recently';

  return (
    <article
      className="rounded-2xl overflow-hidden animate-fade-in group transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div className="p-4 pb-3 flex items-start gap-3">
        <Link
          to={`/profile/${post.author?._id}`}
          className="shrink-0"
        >
          <img
            src={
              post.author?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=6366f1&color=fff&size=80`
            }
            alt={post.author?.name}
            className="w-10 h-10 rounded-full object-cover transition-transform hover:scale-105"
            style={{ outline: '2px solid rgba(99,102,241,0.25)', outlineOffset: '1px' }}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/profile/${post.author?._id}`}>
                <span className="text-[14px] font-semibold text-white hover:text-indigo-300 transition-colors">
                  {post.author?.name || 'Unknown'}
                </span>
              </Link>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                {post.author?.headline || `${post.author?.role || 'Member'} · AlumSphere`}
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo}</p>
            </div>

            {/* More menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowActions(!showActions)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal size={16} />
              </button>
              {showActions && (
                <div
                  className="absolute right-0 top-8 w-40 rounded-xl py-1 z-20 animate-scale-in"
                  style={{
                    background: 'rgba(10,14,30,0.98)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  <button className="w-full text-left px-3 py-2 text-[13px] text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                    <Bookmark size={13} /> Save post
                  </button>
                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-3 py-2 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/5 flex items-center gap-2 transition-colors"
                    >
                      Delete post
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-[14px] text-slate-300 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Image */}
        {post.image && (
          <div className="mt-3 rounded-xl overflow-hidden">
            <img
              src={post.image}
              alt="Post"
              className="w-full object-cover max-h-80 hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map(tag => (
              <span key={tag} className="tag text-[11px]">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Stats line */}
      <div
        className="px-4 py-2 flex items-center justify-between text-[11px] text-slate-600"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer transition-colors">
          <ThumbsUp size={11} className="text-indigo-500" fill="currentColor" />
          {likeCount} reactions
        </span>
        <span className="hover:text-slate-400 cursor-pointer transition-colors">
          {post.comments?.length || 0} comments
        </span>
      </div>

      {/* Action buttons */}
      <div className="px-3 py-1 flex items-center gap-0.5">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-medium transition-all ${
            liked ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <Heart
            size={17}
            fill={liked ? 'currentColor' : 'none'}
            className={likeAnim ? 'animate-pop-in' : ''}
            style={liked ? { filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.6))' } : {}}
          />
          <span className="hidden sm:inline">{liked ? 'Liked' : 'Like'}</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <MessageCircle size={17} />
          <span className="hidden sm:inline">Comment</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <Share2 size={17} />
          <span className="hidden sm:inline">Share</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <Send size={17} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </article>
  );
}

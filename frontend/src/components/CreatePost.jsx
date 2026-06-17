import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Image, X, Send, Smile, Hash, Loader2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return toast.error('Write something to post!');
    setLoading(true);
    try {
      await api.post('/posts', {
        content,
        tags: tags.split(',').map(t => t.trim().replace('#','')).filter(Boolean),
      });
      toast.success('Post published!');
      setContent('');
      setTags('');
      setExpanded(false);
      onPostCreated?.();
    } catch {
      toast.error('Failed to post. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: expanded ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.07)',
        boxShadow: expanded ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="p-4 flex gap-3">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=80`}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover shrink-0"
            style={{ outline: '2px solid rgba(99,102,241,0.3)', outlineOffset: '1px' }}
          />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
              placeholder="Share an insight, achievement, or opportunity…"
              rows={expanded ? 4 : 2}
              className="w-full bg-transparent outline-none text-[14px] text-slate-200 placeholder-slate-600 resize-none leading-relaxed transition-all duration-200"
              style={{ fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Tags row (only when expanded) */}
        {expanded && (
          <div
            className="px-4 pb-3 animate-slide-up"
          >
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-slate-600 shrink-0" />
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Add tags separated by commas (e.g. mern, placement2026)"
                className="flex-1 bg-transparent outline-none text-[12px] text-slate-400 placeholder-slate-600"
              />
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div
          className="px-4 py-3 flex items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-1">
            {[
              { icon: Image,  tip: 'Add image' },
              { icon: Smile,  tip: 'Add emoji' },
            ].map(({ icon: Icon, tip }) => (
              <button
                key={tip}
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all tooltip"
                data-tip={tip}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {expanded && (
              <button
                type="button"
                onClick={() => { setExpanded(false); setContent(''); setTags(''); }}
                className="btn-ghost text-xs h-8 px-3"
              >
                <X size={13} /> Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="btn-primary h-8 px-4 text-xs"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <><Send size={13} /> Post</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

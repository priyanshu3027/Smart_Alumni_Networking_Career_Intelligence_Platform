import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import {
  Users, Trophy, Calendar, MapPin, UserPlus, Zap,
  Sparkles, TrendingUp, ChevronRight, Star, Brain, FileText
} from 'lucide-react';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import MarketInsights from '../components/MarketInsights';

/* ── Skeleton ──────────────────────────────────────────── */
function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {[1,2,3].map(i => (
        <div key={i} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex gap-3 mb-4">
            <div className="skeleton w-11 h-11 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-2.5 w-24 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
            <div className="skeleton h-3 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── AI Suggestion Chips ───────────────────────────────── */
const AI_CHIPS = [
  { icon: FileText, label: 'Improve my Resume', color: '#6366f1' },
  { icon: Users,    label: 'Find Alumni',        color: '#3b82f6' },
  { icon: Brain,    label: 'Career Roadmap',     color: '#a855f7' },
  { icon: TrendingUp, label: 'Market Trends',   color: '#10b981' },
];

/* ── Right Smart Panel ─────────────────────────────────── */
function SmartPanel({ suggestions, events }) {
  return (
    <div className="flex flex-col gap-6">

      {/* Market Insights */}
      <MarketInsights />

      {/* AI Suggestions */}
      <div
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.18)',
        }}
      >
        {/* Glow orb */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)' }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}
            >
              <Zap size={14} className="text-white" fill="currentColor" />
            </div>
            <h3 className="text-sm font-bold text-white">AI Suggestions</h3>
          </div>
          <div className="space-y-2">
            {AI_CHIPS.map(({ icon: Icon, label, color }) => (
              <Link
                key={label}
                to="/ai-hub"
                className="flex items-center gap-2.5 p-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = color + '15';
                  e.currentTarget.style.borderColor = color + '40';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                <Icon size={15} style={{ color, flexShrink: 0 }} />
                <span className="flex-1 text-[13px]">{label}</span>
                <ChevronRight size={13} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Network */}
      {suggestions.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="px-4 pt-4 pb-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-2">
              <Users size={15} className="text-blue-400" />
              <h3 className="text-[13px] font-semibold text-white">People to Connect</h3>
            </div>
            <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
              {suggestions.length} new
            </span>
          </div>
          <div className="py-2">
            {suggestions.slice(0, 4).map((person) => (
              <div
                key={person._id}
                className="px-4 py-2.5 flex gap-3 items-center hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <Link to={`/profile/${person._id}`} className="shrink-0">
                  <img
                    src={
                      person.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=6366f1&color=fff&size=80`
                    }
                    alt={person.name}
                    className="w-9 h-9 rounded-full object-cover"
                    style={{ outline: '1.5px solid rgba(99,102,241,0.3)', outlineOffset: '1px' }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${person._id}`}>
                    <p className="text-[13px] font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {person.name}
                    </p>
                  </Link>
                  <p className="text-[11px] text-slate-500 truncate">
                    {person.headline || `${person.role} · AlumSphere`}
                  </p>
                </div>
                <button
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 px-2.5 py-1 rounded-full transition-all shrink-0"
                  style={{ border: '1px solid rgba(99,102,241,0.3)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <UserPlus size={11} /> Connect
                </button>
              </div>
            ))}
          </div>
          <Link
            to="/network"
            className="block text-center text-[12px] font-semibold text-indigo-400 hover:text-indigo-300 py-3 transition-colors"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            View all suggestions →
          </Link>
        </div>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="px-4 pt-4 pb-3 flex items-center gap-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <Calendar size={15} className="text-amber-400" />
            <h3 className="text-[13px] font-semibold text-white">Upcoming Events</h3>
          </div>
          <div>
            {events.map((event) => {
              const d = new Date(event.date || Date.now());
              return (
                <div
                  key={event._id}
                  className="px-4 py-3 flex gap-3 items-start hover:bg-white/5 transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 text-center"
                    style={{
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}
                  >
                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                      {d.toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-base font-black text-white leading-none">{d.getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-white line-clamp-2 leading-tight">{event.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={10} className="text-amber-600 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            to="/events"
            className="block text-center text-[12px] font-semibold text-amber-500 hover:text-amber-400 py-3 transition-colors"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            See all events →
          </Link>
        </div>
      )}

      {/* Mini Leaderboard */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="px-4 pt-4 pb-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Trophy size={15} className="text-amber-400" />
          <h3 className="text-[13px] font-semibold text-white">Top Members</h3>
        </div>
        {[
          { rank: 1, name: 'Priya Sharma',   pts: 2840, color: '#f59e0b' },
          { rank: 2, name: 'Arjun Mehta',    pts: 2510, color: '#94a3b8' },
          { rank: 3, name: 'Sneha Iyer',     pts: 2190, color: '#cd7f32' },
        ].map(({ rank, name, pts, color }) => (
          <div
            key={rank}
            className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors"
          >
            <span
              className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-black"
              style={{ background: color + '20', color }}
            >
              {rank}
            </span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', color: 'white' }}
            >
              {name[0]}
            </div>
            <span className="flex-1 text-[13px] font-medium text-slate-300 truncate">{name}</span>
            <span className="text-[11px] font-bold" style={{ color }}>
              <Star size={9} className="inline mr-0.5" fill="currentColor" />{pts}
            </span>
          </div>
        ))}
        <Link
          to="/leaderboard"
          className="block text-center text-[12px] font-semibold text-indigo-400 hover:text-indigo-300 py-3 transition-colors"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          Full leaderboard →
        </Link>
      </div>

      {/* Footer */}
      <div className="px-2 py-3">
        <p className="text-[10px] text-slate-600 text-center">
          AlumSphere © 2026 · <span className="text-indigo-600 hover:text-indigo-400 cursor-pointer transition-colors">Privacy</span> · <span className="text-indigo-600 hover:text-indigo-400 cursor-pointer transition-colors">Terms</span>
        </p>
      </div>
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data.posts);
    } catch (err) {
      console.error('Feed error:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [suggestRes, eventsRes] = await Promise.all([
          api.get('/ai/connection-suggestions'),
          api.get('/events?limit=3&upcoming=true'),
        ]);
        setSuggestions(suggestRes.data.suggestions || []);
        setEvents(eventsRes.data.events || []);
        await fetchFeed();
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchFeed]);

  return (
    <div
      className="animate-fade-in flex justify-center"
      style={{
        minHeight: 'calc(100vh - 56px)',
        padding: '2rem 1.5rem 4rem',
      }}
    >
      <div
        className="w-full max-w-[1150px] grid xl:grid-cols-[minmax(0,1fr)_320px] gap-8"
      >
        {/* ── CENTER FEED ── */}
        <div className="min-w-0 flex flex-col gap-8 max-w-3xl mx-auto w-full">

          {/* Welcome strip */}
          <div
            className="rounded-2xl px-5 py-4 flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.08))',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-white truncate">
                Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
              </h2>
              <p className="text-[12px] text-slate-500">
                Your alumni network is growing — {suggestions.length} new connection suggestions
              </p>
            </div>
          </div>

          <CreatePost onPostCreated={fetchFeed} />

          {/* Feed label */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest px-2">Latest Feed</span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {loading ? (
            <FeedSkeleton />
          ) : posts.length > 0 ? (
            <div className="flex flex-col gap-8 pb-10">
              {posts.map(post => (
                <PostCard key={post._id} post={post} onUpdate={fetchFeed} />
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <Users size={32} className="text-indigo-400 animate-float" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your feed is quiet</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leadig-relaxed">
                Create a post or connect with alumni to see updates here.
              </p>
              <Link
                to="/network"
                className="btn-primary mt-6 mx-auto"
              >
                <Users size={15} /> Grow your network
              </Link>
            </div>
          )}
        </div>

        {/* ── RIGHT SMART PANEL ── */}
        <div className="hidden xl:block space-y-6 shrink-0 relative">
          <div className="sticky top-[1.5rem]">
            <SmartPanel suggestions={suggestions} events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}

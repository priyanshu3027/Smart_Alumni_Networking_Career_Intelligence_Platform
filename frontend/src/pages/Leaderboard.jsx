import { useState, useEffect } from 'react';
import { Trophy, Star, Crown, Medal, Zap, TrendingUp, Users } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ── Podium Card ──────────────────────────────────────── */
function PodiumCard({ leader, rank }) {
  const configs = {
    1: { borderColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.4)', height: 'h-36', avatarSize: 'w-20 h-20', textSize: 'text-lg', zIndex: 'z-10' },
    2: { borderColor: '#94a3b8', glowColor: 'rgba(148,163,184,0.3)', height: 'h-28', avatarSize: 'w-16 h-16', textSize: 'text-base', zIndex: 'z-0' },
    3: { borderColor: '#cd7f32', glowColor: 'rgba(205,127,50,0.3)', height: 'h-24', avatarSize: 'w-14 h-14', textSize: 'text-sm', zIndex: 'z-0' },
  };
  const { borderColor, glowColor, height, avatarSize, textSize, zIndex } = configs[rank];

  return (
    <div className={`flex flex-col items-center ${zIndex}`}>
      <div className="relative mb-3">
        {rank === 1 && (
          <Crown
            size={28}
            fill="currentColor"
            className="absolute -top-9 left-1/2 -translate-x-1/2 text-amber-400 crown-animate badge-glow"
          />
        )}
        <img
          src={leader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=6366f1&color=fff`}
          className={`${avatarSize} rounded-full object-cover`}
          style={{
            outline: `3px solid ${borderColor}`,
            outlineOffset: '3px',
            boxShadow: `0 0 25px ${glowColor}`,
          }}
        />
        <span
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white"
          style={{
            background: borderColor,
            boxShadow: `0 0 10px ${glowColor}`,
          }}
        >
          {rank}
        </span>
      </div>

      {/* Podium base */}
      <div
        className={`w-full ${height} rounded-t-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden`}
        style={{
          background: rank === 1
            ? 'linear-gradient(180deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))'
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${borderColor}30`,
          borderBottom: 'none',
        }}
      >
        {/* Glow orb */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
        />
        <p className={`${textSize} font-bold text-white truncate text-center relative z-10 w-full px-1`}>
          {leader.name}
        </p>
        <p className="text-[11px] font-bold relative z-10" style={{ color: borderColor }}>
          {leader.points} XP
        </p>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');

  useEffect(() => { fetchLeaderboard(); }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/gamification/leaderboard');
      setLeaders(res.data.leaderboard || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const myRank = leaders.findIndex(l => l._id === user?._id) + 1;

  return (
    <div className="page-shell animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
            boxShadow: '0 0 30px rgba(245,158,11,0.4)',
          }}
        >
          <Trophy size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Leaderboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Top contributors in the AlumSphere community</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {['global','weekly'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-1.5 rounded-lg text-[13px] font-semibold capitalize transition-all"
                style={activeTab === tab ? {
                  background: 'linear-gradient(135deg,#6366f1,#3b82f6)',
                  color: 'white',
                  boxShadow: '0 0 12px rgba(99,102,241,0.4)',
                } : { color: '#64748b' }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Podium */}
          {!loading && leaders.length >= 3 && (
            <div className="pt-10 pb-0">
              <p className="section-heading text-center mb-8">🏆 Top Performers</p>
              <div className="grid grid-cols-3 gap-3 items-end max-w-md mx-auto">
                <PodiumCard leader={leaders[1]} rank={2} />
                <PodiumCard leader={leaders[0]} rank={1} />
                <PodiumCard leader={leaders[2]} rank={3} />
              </div>
            </div>
          )}

          {/* Rankings Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-indigo-400" /> Network Rankings
              </h3>
              <span className="badge badge-indigo">Live</span>
            </div>

            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton w-6 h-6 rounded" />
                    <div className="skeleton w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton h-3 w-28 rounded" />
                      <div className="skeleton h-2 w-20 rounded" />
                    </div>
                    <div className="skeleton w-12 h-5 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                {leaders.slice(3).map((leader, idx) => {
                  const isMe = leader._id === user?._id;
                  return (
                    <div
                      key={leader._id}
                      className="px-5 py-3.5 flex items-center gap-4 transition-all group"
                      style={isMe ? { background: 'rgba(99,102,241,0.08)', borderLeft: '2px solid #6366f1' } : {}}
                      onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span className="w-6 text-[13px] font-bold text-slate-600 text-right shrink-0">
                        {idx + 4}
                      </span>
                      <img
                        src={leader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=6366f1&color=fff`}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                        style={{ outline: isMe ? '2px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)', outlineOffset: '1px' }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-[13px] font-bold truncate ${isMe ? 'text-indigo-300' : 'text-white'}`}>
                          {leader.name} {isMe && <span className="badge badge-indigo ml-1 py-0">You</span>}
                        </h4>
                        <p className="text-[11px] text-slate-600 capitalize">{leader.role}</p>
                      </div>

                      {/* XP bar */}
                      <div className="flex-1 max-w-[100px] hidden sm:block">
                        <div className="progress-bar" style={{ height: '4px' }}>
                          <div className="progress-fill" style={{ width: `${Math.min(100, (leader.points / 3000) * 100)}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Star size={13} className="text-amber-400" fill="currentColor" />
                        <span className="text-[12px] font-bold text-amber-400">{leader.points}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Your Stats ── */}
        <div className="space-y-4">
          {/* My standing card */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.05))',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            {/* Glow orb */}
            <div
              className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)' }}
            />
            <h3 className="section-heading mb-5 relative z-10">Your Standing</h3>

            <div className="flex flex-col items-center relative z-10">
              <div className="relative mb-4">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=6366f1&color=fff`}
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ outline: '3px solid rgba(99,102,241,0.5)', outlineOffset: '3px', boxShadow: '0 0 25px rgba(99,102,241,0.3)' }}
                />
                <div
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', boxShadow: '0 0 10px rgba(16,185,129,0.5)', border: '2px solid #020617' }}
                >
                  <Zap size={14} className="text-white" fill="currentColor" />
                </div>
              </div>
              <h2 className="text-base font-black text-white">{user?.name}</h2>
              <span className="badge badge-indigo mt-1">Elite Member</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 relative z-10">
              {[
                { label: 'Global Rank', val: myRank > 0 ? `#${myRank}` : '#—', icon: Trophy, color: '#f59e0b' },
                { label: 'Total XP', val: user?.points || 0, icon: Zap, color: '#6366f1' },
              ].map(({ label, val, icon: Icon, color }) => (
                <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Icon size={16} className="mx-auto mb-1" style={{ color }} />
                  <p className="text-[10px] text-slate-600 uppercase font-bold">{label}</p>
                  <p className="text-lg font-black text-white">{val}</p>
                </div>
              ))}
            </div>

            {/* Badges */}
            {user?.badges?.length > 0 && (
              <div className="mt-5 relative z-10">
                <p className="text-[10px] text-slate-600 uppercase font-bold mb-2">Recent Badges</p>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map(badge => (
                    <div
                      key={badge}
                      className="w-10 h-10 rounded-xl flex items-center justify-center tooltip transition-all hover:scale-110"
                      data-tip={badge}
                      style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
                    >
                      <Medal size={18} className="text-amber-400 badge-glow" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* XP breakdown */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="section-heading mb-4">XP Breakdown</p>
            {[
              { label: 'Posts',        pts: 120, max: 500, color: 'progress-fill' },
              { label: 'Connections',  pts: 80,  max: 500, color: 'progress-fill-green' },
              { label: 'Events',       pts: 200, max: 500, color: 'progress-fill-amber' },
            ].map(({ label, pts, max, color }) => (
              <div key={label} className="mb-3">
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-slate-400 font-medium">{label}</span>
                  <span className="text-slate-500">{pts}</span>
                </div>
                <div className="progress-bar">
                  <div className={color} style={{ width: `${(pts/max)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

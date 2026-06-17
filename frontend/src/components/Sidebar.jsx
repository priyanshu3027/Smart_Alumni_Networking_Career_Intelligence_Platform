import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, MessageSquare,
  Calendar, Zap, Trophy, Settings, LogOut,
  ChevronRight, Gamepad2, Globe
} from 'lucide-react';
import AlumSphereLogo from './AlumSphereLogo';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Users,           label: 'Network',   to: '/network' },
  { icon: Briefcase,       label: 'Jobs',       to: '/jobs' },
  { icon: MessageSquare,   label: 'Chat',       to: '/chat' },
  { icon: Calendar,        label: 'Events',     to: '/events' },
  { icon: Zap,             label: 'AI Hub',     to: '/ai-hub' },
  { icon: Trophy,          label: 'Leaderboard',to: '/leaderboard' },
  { icon: Globe,           label: 'Community',  to: '/community' },
  { icon: Gamepad2,        label: 'Arcade',     to: '/games' },
];

export default function Sidebar({ className = '', collapsed = false }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={`flex flex-col h-full ${className}`}
      style={{
        background: 'rgba(10, 14, 30, 0.97)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* ── Logo ───────────────────────────────────── */}
      <Link 
        to="/dashboard" 
        className={`px-5 py-6 flex items-center shrink-0 group transition-all duration-300 cursor-pointer ${collapsed ? 'justify-center px-0' : 'gap-3.5'}`}
      >
        <div className="transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
          <AlumSphereLogo size={36} />
        </div>

        {!collapsed && (
          <div className="flex flex-col justify-center">
            <span
              className="font-black text-[16px] tracking-tight transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #ffffff, #a5b4fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 10px rgba(165,180,252,0.1)'
              }}
            >
              AlumSphere
            </span>
            <div className="flex items-center gap-1.5 mt-[2px]">
              <span className="w-1 h-1 rounded-full bg-emerald-400 group-hover:animate-pulse" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
              <p className="text-[8px] text-slate-500 font-bold tracking-[0.2em] uppercase">
                Premium
              </p>
            </div>
          </div>
        )}
      </Link>

      {/* ── Nav Section ─────────────────────────────── */}
      <div className="px-3 mb-2 flex justify-center">
        {!collapsed ? (
          <p className="section-heading px-3 mb-2 w-full text-left">Navigate</p>
        ) : (
          <div className="w-4 border-b border-slate-700 mb-2 mt-1"></div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
          const active =
            to === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`nav-sidebar-item group ${active ? 'active' : ''} ${collapsed ? 'justify-center !px-0 tooltip' : ''}`}
              data-tip={collapsed ? label : ''}
            >
              <Icon
                size={17}
                className={
                  active
                    ? 'text-indigo-400 shrink-0'
                    : 'text-slate-500 group-hover:text-slate-300 shrink-0 transition-colors'
                }
              />
              {!collapsed && <span className="flex-1 truncate">{label}</span>}
              {!collapsed && active && (
                <ChevronRight size={13} className="text-indigo-400 shrink-0 opacity-70" />
              )}
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className={`nav-sidebar-item group ${location.pathname === '/admin' ? 'active' : ''} ${collapsed ? 'justify-center !px-0 tooltip' : ''}`}
            data-tip={collapsed ? 'Admin' : ''}
          >
            <Settings
              size={17}
              className={
                location.pathname === '/admin'
                  ? 'text-red-400 shrink-0'
                  : 'text-slate-500 group-hover:text-slate-300 shrink-0'
              }
            />
            {!collapsed && <span className="flex-1">Admin</span>}
          </Link>
        )}
      </nav>

      {/* ── User Profile Card ──────────────────────── */}
      <div
        className={`mx-3 mb-4 rounded-xl shrink-0 ${collapsed ? 'p-2 bg-transparent border-0 flex justify-center' : 'p-3'}`}
        style={collapsed ? {} : {
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className={`flex items-center ${collapsed ? 'justify-center flex-col gap-2' : 'gap-3'}`}>
          <Link to="/profile" className="relative shrink-0 flex justify-center">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'U'
                )}&background=6366f1&color=fff&size=80`
              }
              alt="avatar"
              className={`${collapsed ? 'w-10 h-10' : 'w-9 h-9'} rounded-full object-cover`}
              style={{ outline: '2px solid rgba(99,102,241,0.4)', outlineOffset: '2px' }}
            />
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 online-dot"
              style={{ borderColor: '#0a0e1e' }}
            />
          </Link>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <Link
                to="/profile"
                className="block text-[13px] font-semibold text-slate-200 truncate hover:text-white transition-colors leading-tight"
              >
                {user?.name || 'User'}
              </Link>
              <p className="text-[11px] text-slate-500 truncate capitalize font-medium">
                {user?.role || 'Member'}
              </p>
            </div>
          )}

          <button
            onClick={logout}
            className={`btn-icon rounded-lg shrink-0 tooltip ${collapsed ? 'w-10 h-10 bg-slate-800/50 hover:bg-red-500/10 hover:text-red-400 mt-1 border-transparent hover:border-red-500/30' : 'w-7 h-7'}`}
            data-tip="Sign out"
          >
            <LogOut size={14} className={collapsed ? 'text-slate-400' : 'text-slate-500 hover:text-red-400'} />
          </button>
        </div>

        {/* XP mini progress */}
        {!collapsed && user?.points !== undefined && (
          <div className="mt-2.5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-500 font-medium">XP Level</span>
              <span className="text-[10px] text-indigo-400 font-bold">{user.points || 0} pts</span>
            </div>
            <div className="progress-bar" style={{ height: '3px' }}>
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, ((user.points || 0) % 500) / 5)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

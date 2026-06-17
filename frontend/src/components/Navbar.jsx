import { useAuth } from '../context/AuthContext';
import {
  Bell, Search, ChevronDown, Trophy, Gamepad2, Brain,
  Shield, X, Settings, LogOut, User, Users, PanelLeftClose, PanelLeft,
  Moon, Sun
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AlumSphereLogo from './AlumSphereLogo';

export default function Navbar({ toggleSidebar, collapsed, theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const profileRef = useRef(null);
  const appsRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (appsRef.current && !appsRef.current.contains(e.target)) setShowApps(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'var(--bg-elevated)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
        height: '56px',
      }}
    >
      {/* Gradient line at very top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }}
      />

      <div className="flex items-center justify-between h-full px-4 lg:px-6">

        {/* ── Mobile Logo (Hidden on desktop because Sidebar has it) ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="group hidden lg:flex items-center justify-center w-[34px] h-[34px] rounded-xl transition-all duration-300 relative tooltip tooltip-bottom"
            data-tip={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative text-slate-400 group-hover:text-indigo-300 transition-colors">
              {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
            </div>
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 lg:hidden">
            <AlumSphereLogo size={32} />
          </Link>
        </div>

        {/* ── Search Bar ────────────────────────────────────────── */}
        <div className="hidden sm:flex flex-1 justify-center px-4">
          <div className="relative w-full max-w-[440px] flex items-center shadow-lg">
            <Search
              size={15}
              className="absolute left-4 text-slate-400 pointer-events-none z-10"
            />
            <input
              type="text"
              placeholder="Search alumni, jobs, events..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full h-10 text-[13px] placeholder-slate-500 rounded-xl outline-none transition-all duration-300"
              style={{
                paddingLeft: '44px',
                paddingRight: '60px',
                textAlign: 'left',
                background: searchFocused ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: searchFocused ? '1px solid var(--accent-light)' : '1px solid var(--border)',
                boxShadow: searchFocused ? '0 0 0 3px rgba(59,130,246,0.12), 0 0 20px rgba(59,130,246,0.08)' : 'inset 0 2px 6px rgba(15,23,42,0.08)',
                color: 'var(--text-primary)',
              }}
            />
            {searchVal && (
              <button onMouseDown={(e) => { e.preventDefault(); setSearchVal(''); }} className="absolute right-[46px] text-slate-400 hover:text-white z-10 p-1">
                <X size={14} />
              </button>
            )}
            <div className="absolute right-3 flex items-center gap-1 z-10 pointer-events-none">
              <kbd className="hidden md:flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 shadow-sm">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* Spacer for mobile */}
        <div className="flex-1 sm:hidden" />

        {/* ── Right Actions ─────────────────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-100/10 transition-colors tooltip tooltip-bottom" data-tip="Notifications">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{ background: 'linear-gradient(135deg,#ef4444,#f43f5e)' }}>3</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 hover:bg-indigo-100/70 dark:hover:bg-indigo-500/15 transition-all duration-200 shadow-sm tooltip tooltip-bottom"
            data-tip={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-[12px] font-semibold tracking-tight">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Apps Dropdown */}
          <div ref={appsRef} className="relative">
            <button
              onClick={() => { setShowApps(!showApps); setShowProfile(false); }}
              className={`p-2 rounded-xl transition-colors tooltip tooltip-bottom flex items-center justify-center ${showApps ? 'bg-white/5 text-indigo-400' : 'text-slate-400 hover:text-indigo-300 hover:bg-white/5'}`}
              data-tip="Apps"
            >
              <div className="grid grid-cols-2 gap-[2px] w-4 h-4">
                {Array(4).fill(0).map((_, i) => (
                  <span key={i} className="rounded-[2px]" style={{ background: showApps ? '#818cf8' : 'currentColor', width: '6px', height: '6px' }} />
                ))}
              </div>
            </button>

            {showApps && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-72 rounded-2xl p-4 animate-scale-in z-50"
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)',
                  backdropFilter: 'blur(24px)', boxShadow: '0 18px 45px rgba(15,23,42,0.16), 0 0 0 1px rgba(59,130,246,0.08)',
                }}>
                <p className="section-heading mb-3 px-1">Explore Apps</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { to: '/ai-hub',      icon: Brain,    label: 'AI Hub',    color: 'rgba(16,185,129,0.15)',   text: '#34d399' },
                    { to: '/games',       icon: Gamepad2, label: 'Arcade',    color: 'rgba(168,85,247,0.15)',  text: '#c084fc' },
                    { to: '/leaderboard', icon: Trophy,   label: 'Rankings',  color: 'rgba(245,158,11,0.15)',  text: '#fbbf24' },
                    { to: '/community',   icon: Users,    label: 'Community', color: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
                  ].map(({ to, icon: Icon, label, color, text }) => (
                    <Link
                      key={to} to={to} onClick={() => setShowApps(false)}
                      className="flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all group"
                      onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.borderColor = text + '40'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: color }}>
                        <Icon size={20} style={{ color: text }} />
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative ml-1 sm:ml-2">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowApps(false); }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover transition-all"
                  style={{ outline: showProfile ? '2px solid #6366f1' : '2px solid rgba(99,102,241,0.3)', outlineOffset: '2px' }}
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#020617]" />
              </div>
              <ChevronDown size={14} className={`text-slate-500 transition-transform hidden sm:block ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-64 rounded-2xl overflow-hidden animate-scale-in z-50"
                   style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', backdropFilter: 'blur(24px)', boxShadow: '0 18px 45px rgba(15,23,42,0.16)' }}>
                {/* Profile header */}
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start gap-3">
                    <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=6366f1&color=fff&size=80`}
                         className="w-12 h-12 rounded-xl object-cover" style={{ outline: '2px solid rgba(99,102,241,0.4)', outlineOffset: '2px' }} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[15px] truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</h3>
                      <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user?.role}</p>
                      <span className="badge badge-online mt-1.5 px-1.5 py-0.5" style={{ fontSize: '9px' }}>● Online</span>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setShowProfile(false)} className="btn-secondary w-full mt-3 text-[12px] h-8 justify-center rounded-lg">
                    <User size={13} /> View Profile
                  </Link>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <Link to="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                    <Settings size={15} className="text-slate-500" /> Settings & Privacy
                  </Link>
                </div>

                <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <button onClick={() => { logout(); setShowProfile(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-[13px] text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}

import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid, Area, AreaChart,
} from 'recharts';
import {
  TrendingUp, Briefcase, Users, Building2, RefreshCw,
  Sparkles, BarChart2, Clock, Zap, Wifi,
} from 'lucide-react';

/* ── Color palettes ───────────────────────────────────────── */
const SKILL_COLORS  = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#06b6d4','#f97316','#14b8a6','#a855f7'];
const TYPE_COLORS   = { 'full-time':'#6366f1', 'part-time':'#3b82f6', internship:'#10b981', contract:'#f59e0b', remote:'#ec4899' };
const GRADIENT_LINE = { stroke: '#6366f1', fill: 'rgba(99,102,241,0.12)' };

/* ── Tooltip styles ───────────────────────────────────────── */
const TT_STYLE = {
  contentStyle: { background: '#0f172a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, fontSize: 12 },
  labelStyle:   { color: '#94a3b8' },
  itemStyle:    { color: '#e2e8f0' },
};

/* ── Demand badge ─────────────────────────────────────────── */
function DemandBadge({ demand }) {
  const cfg = {
    High:   { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
    Medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    Low:    { bg: 'rgba(100,116,139,0.12)', color: '#64748b', border: 'rgba(100,116,139,0.3)' },
  }[demand] || {};
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
      {demand}
    </span>
  );
}

/* ── Section Card ─────────────────────────────────────────── */
function Card({ title, icon: Icon, iconColor = '#6366f1', children, accentColor }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${accentColor || iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} style={{ color: accentColor || iconColor }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{title}</span>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>{children}</div>
    </div>
  );
}

/* ── Stat pill ────────────────────────────────────────────── */
function StatPill({ label, value, color }) {
  return (
    <div style={{ flex: 1, minWidth: 80, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function MarketInsights() {
  const [data,        setData]        = useState(null);
  const [aiSummary,   setAiSummary]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error,       setError]       = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const res = await api.get('/ai/market-insights');
      if (res.data.success) {
        setData(res.data.data);
        setAiSummary(res.data.aiSummary);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Market insights error:', err);
      setError('Could not load market data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Loading skeleton ─────────────────────────────────── */
  if (loading) return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={14} style={{ color: '#6366f1' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Market Insights</span>
        <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
      </div>
      {[80, 60, 90, 50].map((w, i) => (
        <div key={i} className="skeleton" style={{ height: 10, borderRadius: 6, width: `${w}%`, marginBottom: 10 }} />
      ))}
    </div>
  );

  if (error) return (
    <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
      <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
      <button onClick={() => load()} style={{ marginTop: 8, fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
    </div>
  );

  if (!data) return null;

  const { topSkills, jobTypes, daily, topCompanies, salaryDist, stats } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(16,185,129,0.06))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.2),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', boxShadow: '0 0 14px rgba(99,102,241,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={16} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>Market Insights</div>
            <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <Wifi size={9} style={{ color: '#10b981' }} />
              Live · {lastUpdated ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
            </div>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            title="Refresh data"
            style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <RefreshCw size={13} style={{ color: '#6366f1', animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* ── AI Summary ── */}
      {aiSummary && (
        <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10 }}>
          <Sparkles size={14} style={{ color: '#818cf8', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: '#c7d2fe', lineHeight: 1.6, margin: 0 }}>{aiSummary}</p>
        </div>
      )}

      {/* ── Platform stats ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <StatPill label="Active Jobs"   value={stats.totalJobs}    color="#6366f1" />
        <StatPill label="Members"       value={stats.totalUsers}   color="#3b82f6" />
        <StatPill label="Events"        value={stats.totalEvents}  color="#f59e0b" />
        <StatPill label="Remote"        value={stats.remoteJobs}   color="#10b981" />
      </div>

      {/* ── Top Skills — Bar Chart ── */}
      {topSkills.length > 0 && (
        <Card title="Top Skills in Demand" icon={BarChart2} iconColor="#6366f1">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={topSkills} margin={{ top: 4, right: 4, left: -22, bottom: 30 }}>
              <XAxis dataKey="skill" tick={{ fontSize: 10, fill: '#64748b' }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip {...TT_STYLE} formatter={(v) => [v, 'Job listings']} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {topSkills.map((_, i) => (
                  <Cell key={i} fill={SKILL_COLORS[i % SKILL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Demand labels */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {topSkills.slice(0, 6).map(s => (
              <div key={s.skill} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>{s.skill}</span>
                <DemandBadge demand={s.demand} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── 14-Day Posting Trend — Area Chart ── */}
      <Card title="Job Posting Trend (14 days)" icon={TrendingUp} iconColor="#10b981" accentColor="#10b981">
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={daily} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#475569' }} interval={2} />
            <YAxis tick={{ fontSize: 9, fill: '#475569' }} allowDecimals={false} />
            <Tooltip {...TT_STYLE} formatter={(v) => [v, 'Jobs posted']} />
            <Area type="monotone" dataKey="jobs" stroke={GRADIENT_LINE.stroke} fill="url(#lineGrad)" strokeWidth={2} dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Job Type — Pie Chart ── */}
      {jobTypes.length > 0 && (
        <Card title="Job Type Distribution" icon={Briefcase} iconColor="#f59e0b" accentColor="#f59e0b">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={jobTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {jobTypes.map((entry) => (
                  <Cell key={entry.name} fill={TYPE_COLORS[entry.name] || '#6366f1'} />
                ))}
              </Pie>
              <Tooltip {...TT_STYLE} formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── Salary Distribution ── */}
      {salaryDist.some(s => s.count > 0) && (
        <Card title="Salary Distribution (LPA)" icon={Zap} iconColor="#ec4899" accentColor="#ec4899">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={salaryDist} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip {...TT_STYLE} formatter={(v) => [v, 'Jobs']} />
              <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── Top Hiring Companies ── */}
      {topCompanies.length > 0 && (
        <Card title="Top Hiring Companies" icon={Building2} iconColor="#3b82f6" accentColor="#3b82f6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topCompanies.slice(0, 6).map((c, i) => {
              const maxVal = topCompanies[0].openings;
              const pct    = Math.round((c.openings / maxVal) * 100);
              return (
                <div key={c.company}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>{c.company}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{c.openings} listing{c.openings > 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${SKILL_COLORS[i % SKILL_COLORS.length]}, ${SKILL_COLORS[(i + 2) % SKILL_COLORS.length]})`, borderRadius: 999, transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Last updated ── */}
      <div style={{ textAlign: 'center', paddingBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Clock size={9} /> Data refreshed from live platform database
        </span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

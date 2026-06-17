import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, ArrowLeft, Lock, Zap, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import AlumSphereLogo from '../components/AlumSphereLogo';

const DEMO_ACCOUNTS = [
  { label: 'Student Demo',  email: 'priyanshu@cu.ac.in',    sub: 'B.Tech CSE, 3rd Year' },
  { label: 'Alumni Demo',   email: 'rahul.verma@tcs.com',   sub: 'SWE at TCS (Verified)' },
  { label: 'Admin Demo',    email: 'admin@alumsphere.com',   sub: 'Platform Administrator' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const redirectMessage = location.state?.message;
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(false);
  const [otp, setOtp]           = useState('');
  const [userId, setUserId]     = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.requires2FA) {
        setTwoFAStep(true);
        setUserId(res.userId);
        toast.success('Enter the OTP from your authenticator app');
      } else {
        toast.success('Welcome back! 🎉');
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials or start the backend server.');
    } finally { setLoading(false); }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-2fa', { userId, token: otp });
      localStorage.setItem('alumsphere_token', data.token);
      localStorage.setItem('alumsphere_user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const quickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setLoading(true);
    try {
      const res = await login(demoEmail, 'Password@123');
      if (res.requires2FA) { setTwoFAStep(true); setUserId(res.userId); }
      else { toast.success('Welcome! 🎉'); navigate(from, { replace: true }); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Is the backend server running?');
    } finally { setLoading(false); }
  };

  /* ── Shared field style ──────────────────────── */
  const fieldStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '11px 14px',
    fontSize: '14px', color: 'white',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT PANEL ─────────────────────────────── */}
      <div style={{
        width: '44%', flexShrink: 0,
        background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)',
        padding: '40px 40px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}
        className="hidden lg:flex"
      >
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.07,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Glow blob top */}
        <div style={{ position: 'absolute', top: '-80px', left: '-40px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)', pointerEvents: 'none' }} />
        {/* Glow blob bottom */}
        <div style={{ position: 'absolute', bottom: '-60px', right: '-30px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlumSphereLogo size={36} />
          <span style={{ background: 'linear-gradient(135deg,#60a5fa,#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900, fontSize: '17px' }}>AlumSphere</span>
        </div>

        {/* Headline + pills */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '30px', fontWeight: 900, color: 'white', lineHeight: 1.25, margin: '0 0 10px' }}>
            Your next career<br />
            breakthrough starts
          </h2>
          <h2 style={{ fontSize: '30px', fontWeight: 900, lineHeight: 1.25, margin: '0 0 16px', background: 'linear-gradient(135deg,#60a5fa,#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            right here.
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.65, margin: '0 0 28px', maxWidth: '320px' }}>
            Join 15,000+ professionals connecting, mentoring, and growing together on AlumSphere.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { emoji: '🎯', text: 'AI-powered job matching & referrals' },
              { emoji: '🤝', text: 'Connect with verified alumni mentors' },
              { emoji: '⚡', text: 'Career roadmaps powered by AI' },
            ].map(({ emoji, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.14)' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{emoji}</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#cbd5e1' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { val: '15K+', label: 'Members' },
            { val: '850+', label: 'Placements' },
            { val: '120+', label: 'Events' },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: '0 0 2px' }}>{val}</p>
              <p style={{ fontSize: '10px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: Auth Card ──────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflowY: 'auto' }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 25%, rgba(99,102,241,0.06), transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', textDecoration: 'none', marginBottom: '20px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#cbd5e1'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
            <ArrowLeft size={14} /> Back to home
          </Link>

          {/* Redirect notice banner */}
          {redirectMessage && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', marginBottom: '16px',
              borderRadius: '10px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.25)',
            }}>
              <span style={{ fontSize: '16px' }}>🎟️</span>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', margin: '0 0 2px' }}>Sign in required</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{redirectMessage}</p>
              </div>
            </div>
          )}

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '20px', padding: '32px', backdropFilter: 'blur(20px)' }}>
            {/* Mobile logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '24px' }} className="lg:hidden">
              <AlumSphereLogo size={30} />
              <span style={{ fontWeight: 900, fontSize: '16px', color: 'white' }}>AlumSphere</span>
            </div>

            <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'white', margin: '0 0 4px' }}>Welcome back</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px' }}>Sign in to your account</p>

            {!twoFAStep ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                  <input
                    type="email" placeholder="you@university.edu"
                    value={email} onChange={e => setEmail(e.target.value)} required
                    style={{ ...fieldStyle }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                    <input
                      type={showPass ? 'text' : 'password'} placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)} required
                      style={{ ...fieldStyle, padding: '11px 42px 11px 40px' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                  background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
                  color: 'white', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 20px rgba(99,102,241,0.3)', transition: 'opacity 0.15s', marginTop: '4px',
                }}>
                  {loading ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handle2FA} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>Enter the 6-digit OTP from your authenticator app</p>
                <input
                  type="text" maxLength={6} placeholder="000000" value={otp}
                  onChange={e => setOtp(e.target.value)} required
                  style={{ ...fieldStyle, textAlign: 'center', fontSize: '22px', letterSpacing: '0.4em', padding: '14px' }}
                />
                <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                  {loading ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> : 'Verify OTP'}
                </button>
              </form>
            )}

            {/* Demo accounts */}
            <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#334155', textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                <Zap size={10} style={{ display: 'inline', marginRight: '4px', color: '#6366f1' }} fill="#6366f1" />
                Quick Demo Login
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {DEMO_ACCOUNTS.map(({ label, email: dEm, sub }) => (
                  <button key={dEm} type="button" disabled={loading} onClick={() => quickLogin(dEm)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{label}</span>
                    <span style={{ fontSize: '11px', color: '#475569' }}>{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#475569' }}>
            Don't have an account?{' '}
            <Link to="/register" state={{ from }} style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
              Join AlumSphere free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

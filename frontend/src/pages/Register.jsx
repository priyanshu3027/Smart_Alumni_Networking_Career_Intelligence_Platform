import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, GraduationCap, Briefcase, ArrowLeft, ArrowRight, User, Mail, Lock, Building2, CheckCircle } from 'lucide-react';
import AlumSphereLogo from '../components/AlumSphereLogo';

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

const labelStyle = {
  display: 'block',
  fontSize: '11px', fontWeight: 600, color: '#94a3b8',
  marginBottom: '6px',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student',
    institution: '', course: '', graduationYear: '', company: '', designation: ''
  });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Welcome to AlumSphere! 🚀');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Is the backend server running?');
    } finally { setLoading(false); }
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = 'rgba(99,102,241,0.5)';
    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT PANEL ─────────────────────────────── */}
      <div style={{
        width: '40%', flexShrink: 0,
        background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)',
        padding: '40px 36px',
        display: 'none',  /* hidden on mobile, shown via media queries below */
        flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}
        className="hidden lg:flex"
      >
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.07, backgroundImage: 'linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'absolute', top: '-60px', right: '-30px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-30px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlumSphereLogo size={36} />
          <span style={{ background: 'linear-gradient(135deg,#60a5fa,#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900, fontSize: '17px' }}>AlumSphere</span>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', lineHeight: 1.25, margin: '0 0 8px' }}>
            Join thousands of<br />professionals building
          </h2>
          <h2 style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1.25, margin: '0 0 16px', background: 'linear-gradient(135deg,#c084fc,#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            careers together.
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.65, margin: '0 0 28px', maxWidth: '300px' }}>
            Free account. No credit card. Instant access to the entire alumni network.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { n: '01', color: '#6366f1', title: 'Create your profile',   desc: 'Set up your professional identity' },
              { n: '02', color: '#a855f7', title: 'Explore the network',   desc: 'Find alumni and mentors' },
              { n: '03', color: '#10b981', title: 'Get referred',           desc: 'Land opportunities through connections' },
            ].map(({ n, color, title, desc }) => (
              <div key={n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color, background: color + '15', border: `1px solid ${color}30`, padding: '3px 8px', borderRadius: '5px', flexShrink: 0, marginTop: '2px' }}>{n}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', margin: '0 0 2px' }}>{title}</p>
                  <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: 'relative', zIndex: 1, fontSize: '11px', color: '#1e293b', margin: 0 }}>
          AlumSphere © 2026 · Free for students &amp; alumni
        </p>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflowY: 'auto' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 20%, rgba(168,85,247,0.05), transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', textDecoration: 'none', marginBottom: '24px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#cbd5e1'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
            <ArrowLeft size={14} /> Back to home
          </Link>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.18)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(20px)' }}>
            {/* Mobile logo */}
            <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
              <AlumSphereLogo size={30} />
              <span style={{ fontWeight: 900, fontSize: '16px', color: 'white' }}>AlumSphere</span>
            </div>

            <h1 style={{ fontSize: '21px', fontWeight: 900, color: 'white', margin: '0 0 4px' }}>Create your account</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>Join the premier professional alumni network</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Role selector */}
              <div>
                <label style={labelStyle}>I am a…</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { val: 'student', icon: GraduationCap, label: 'Student' },
                    { val: 'alumni',  icon: Briefcase,     label: 'Alumni'  },
                  ].map(({ val, icon: Icon, label }) => (
                    <button key={val} type="button" onClick={() => setFormData({ ...formData, role: val })}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
                        ...(formData.role === val ? {
                          background: 'rgba(99,102,241,0.14)', color: '#a5b4fc', outline: '1px solid rgba(99,102,241,0.4)',
                          boxShadow: '0 0 10px rgba(99,102,241,0.15)',
                        } : {
                          background: 'rgba(255,255,255,0.04)', color: '#64748b', outline: '1px solid rgba(255,255,255,0.08)',
                        }),
                      }}>
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name + Email row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input name="name" type="text" placeholder="Priya Sharma" value={formData.name} onChange={handleChange} required style={fieldStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input name="email" type="email" placeholder="you@college.edu" value={formData.email} onChange={handleChange} required style={fieldStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <input name="password" type="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required minLength={6} style={fieldStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              {/* Role-specific fields */}
              {formData.role === 'student' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Institution</label>
                    <input name="institution" type="text" placeholder="CU Chandigarh" value={formData.institution} onChange={handleChange} style={fieldStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Course</label>
                    <input name="course" type="text" placeholder="MCA / B.Tech" value={formData.course} onChange={handleChange} style={fieldStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Company</label>
                    <input name="company" type="text" placeholder="TCS / Google" value={formData.company} onChange={handleChange} style={fieldStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Designation</label>
                    <input name="designation" type="text" placeholder="Software Engineer" value={formData.designation} onChange={handleChange} style={fieldStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg,#a855f7,#6366f1)',
                  color: 'white', fontSize: '14px', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 20px rgba(168,85,247,0.3)',
                  opacity: loading ? 0.7 : 1, marginTop: '4px',
                }}>
                {loading
                  ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                  : <><span>Create Account</span><ArrowRight size={15} /></>
                }
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#475569' }}>
            Already have an account?{' '}
            <Link to="/login" state={{ from }} style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

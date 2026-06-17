import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, Calendar, ArrowRight,
  Zap, Shield, TrendingUp, Star, Brain, CheckCircle,
  Mail, MapPin, ExternalLink
} from 'lucide-react';
import { useState, useEffect } from 'react';
import AlumSphereLogo from '../components/AlumSphereLogo';

const LinkedinIcon = ({ size = 18, color = '#0a66c2' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GithubIcon = ({ size = 18, color = '#e2e8f0' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString()}{suffix}</>;
}

const FEATURES = [
  { icon: Users,      title: 'Smart Mentoring',  desc: 'AI matches students with perfectly aligned alumni mentors.', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', to: '/network'    },
  { icon: Briefcase,  title: 'Exclusive Jobs',   desc: 'Internships & roles posted directly by alumni hiring managers.', color: '#a855f7', bg: 'rgba(168,85,247,0.08)', to: '/jobs'  },
  { icon: Calendar,   title: 'Live Events',      desc: 'Webinars, mock interviews, and AMAs with alumni leaders.', color: '#10b981', bg: 'rgba(16,185,129,0.08)', to: '/events'        },
  { icon: Zap,        title: 'AI Career Hub',    desc: 'Resume analysis, roadmaps, and market insights - AI-powered.', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', to: '/ai-hub'  },
  { icon: TrendingUp, title: 'Leaderboard',      desc: 'Gamified XP, badges, and rankings for active contributors.', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', to: '/leaderboard' },
  { icon: Shield,     title: 'Verified Alumni',  desc: 'Every alumni is institution-verified for authentic networking.', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', to: '/network' },
];

const STATS = [
  { val: 5000,  suffix: '+', label: 'Alumni',     color: '#818cf8' },
  { val: 10000, suffix: '+', label: 'Students',   color: '#c084fc' },
  { val: 850,   suffix: '+', label: 'Hires',      color: '#34d399' },
  { val: 120,   suffix: '+', label: 'Events',     color: '#fbbf24' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma',  role: 'SWE at Google',             text: 'AlumSphere connected me with the exact alumni I needed - a 15-min call led to my Google offer!', init: 'P', color: '#6366f1' },
  { name: 'Arjun Mehta',   role: 'Product Manager, Flipkart', text: 'The AI resume analyzer gave me specific feedback that increased my interview calls by 3x.', init: 'A', color: '#a855f7' },
  { name: 'Sneha Iyer',    role: 'Data Scientist, Amazon',    text: 'Found my mentor, got referrals, attended incredible events. Best platform for career growth.', init: 'S', color: '#10b981' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEventClick = () => {
    navigate('/login', { state: { from: '/events', message: 'Please sign in to view & enroll in events.' } });
  };

  return (
    <div style={{ background: '#020617', color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(2,6,23,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        height: '56px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <AlumSphereLogo size={32} />
            <span style={{ background: 'linear-gradient(135deg,#60a5fa,#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900, fontSize: '16px' }}>AlumSphere</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {['Features', 'Events', 'About'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#94a3b8', textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.target.style.color = '#94a3b8'; e.target.style.background = 'transparent'; }}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/login" style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              Sign in
            </Link>
            <Link to="/register" style={{ padding: '7px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: 'white', textDecoration: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 0 16px rgba(99,102,241,0.35)' }}>
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-60%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.12), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40px', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '28px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a5b4fc' }}>The Premier Alumni Network</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', color: 'white' }}>
            Unite Past &amp;{' '}
            <span style={{ background: 'linear-gradient(135deg,#60a5fa,#a5b4fc,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Future Talent
            </span>
          </h1>

          <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: 1.7, maxWidth: '580px', margin: '0 auto 36px' }}>
            A premium digital space connecting ambitious students with accomplished alumni.
            Grow your network, land referrals, and accelerate your career with AI-powered intelligence.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
            <Link to="/register"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 0 25px rgba(99,102,241,0.4)' }}>
              Join the Network <ArrowRight size={16} />
            </Link>
            <Link to="/login"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', fontWeight: 600, fontSize: '14px', textDecoration: 'none', background: 'rgba(255,255,255,0.04)' }}>
              Sign In
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {['#6366f1','#a855f7','#10b981','#f59e0b','#3b82f6'].map((c, i) => (
                <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: '2px solid #020617', marginLeft: i > 0 ? '-10px' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white', zIndex: 5 - i }}>
                  {['P','A','S','R','M'][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                {Array(5).fill(0).map((_, i) => <Star key={i} size={12} style={{ color: '#fbbf24', fill: '#fbbf24' }} />)}
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Trusted by 15,000+ professionals</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 60px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {STATS.map(({ val, suffix, label, color }, idx) => (
              <div key={label} style={{ padding: '28px 16px', textAlign: 'center', borderRight: idx < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <p style={{ fontSize: '36px', fontWeight: 900, color: 'white', margin: '0 0 4px' }}>
                  <Counter target={val} /><span style={{ color }}>{suffix}</span>
                </p>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6366f1', marginBottom: '12px' }}>Capabilities</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white', margin: '0 0 14px', lineHeight: 1.15 }}>
              Everything you need to{' '}
              <span style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>succeed</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
              Premium features designed to help you connect, grow, and achieve your career goals.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {FEATURES.map(({ icon: Icon, title, desc, color, bg, to }) => (
              <div
                key={title}
                onClick={() => title === 'Live Events' ? handleEventClick() : navigate(to)}
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', transition: 'all 0.25s', cursor: 'pointer', textDecoration: 'none', display: 'block' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.background = bg; e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <ArrowRight size={16} style={{ color: color, opacity: 0.6, marginTop: '4px' }} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'white', margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 24px', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#10b981', marginBottom: '12px' }}>Process</p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: 'white', margin: '0 0 48px', lineHeight: 1.2 }}>Get started in 3 simple steps</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', icon: CheckCircle, title: 'Create your profile', desc: 'Sign up and set up your professional identity in minutes.', color: '#6366f1' },
              { step: '02', icon: Users,       title: 'Explore the network', desc: 'Browse verified alumni, mentors, and job opportunities.', color: '#a855f7' },
              { step: '03', icon: TrendingUp,  title: 'Get referred',        desc: 'Land opportunities through warm alumni introductions.', color: '#10b981' },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} style={{ padding: '28px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color, letterSpacing: '0.1em', background: color + '15', border: `1px solid ${color}30`, padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginBottom: '16px' }}>{step}</div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'white', margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '12px' }}>Success Stories</p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: 'white', margin: 0 }}>
              Real people, real{' '}
              <span style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>results</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {TESTIMONIALS.map(({ name, role, text, init, color }) => (
              <div key={name}
                style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
                  {Array(5).fill(0).map((_, i) => <Star key={i} size={13} style={{ color: '#fbbf24', fill: '#fbbf24' }} />)}
                </div>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, margin: '0 0 18px', fontStyle: 'italic' }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0 }}>{init}</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', margin: '0 0 2px' }}>{name}</p>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="events" style={{ padding: '60px 24px', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#10b981', marginBottom: '12px' }}>Upcoming</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white', margin: '0 0 14px' }}>
              Live <span style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Events</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>Webinars, mock interviews & AMAs hosted by alumni industry leaders.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
            {[
              { tag: 'Webinar', tagColor: '#6366f1', title: 'Cracking Product Interviews at FAANG', date: 'Apr 12, 2026', time: '7:00 PM IST', host: 'Rahul Verma, PM @ Google', location: 'Online - Zoom', seats: '240 registered', color: '#6366f1' },
              { tag: 'AMA Session', tagColor: '#a855f7', title: 'From Tier-3 College to Dream Job Abroad', date: 'Apr 18, 2026', time: '8:30 PM IST', host: 'Sneha Kapoor, SDE @ Microsoft', location: 'Online - Google Meet', seats: '185 registered', color: '#a855f7' },
              { tag: 'Mock Interview', tagColor: '#f59e0b', title: 'System Design Masterclass for SDEs', date: 'Apr 25, 2026', time: '6:00 PM IST', host: 'Arjun Mehta, Staff Eng @ Stripe', location: 'Online - Zoom', seats: '98 spots left', color: '#f59e0b' },
            ].map(({ tag, tagColor, title, date, time, host, location, seats, color }) => (
              <div key={title}
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '16px', padding: '24px', transition: 'all 0.25s', cursor: 'default', display: 'flex', flexDirection: 'column', gap: '14px' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = color + '50'; e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: tagColor, background: tagColor + '18', border: `1px solid ${tagColor}30`, padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.06em' }}>{tag}</span>
                  <span style={{ fontSize: '11px', color: '#475569' }}>{seats}</span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.4 }}>{title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                    <Calendar size={13} style={{ color: tagColor }} />{date} - {time}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                    <Users size={13} style={{ color: tagColor }} />{host}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                    <MapPin size={13} style={{ color: tagColor }} />{location}
                  </div>
                </div>
                <button
                  onClick={handleEventClick}
                  style={{ marginTop: 'auto', padding: '9px 0', borderRadius: '8px', background: color + '18', border: `1px solid ${color}40`, color: tagColor, fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = color + '30'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = color + '18'; }}>
                  Sign In to Register →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 24px 80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '64px 48px', borderRadius: '24px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white', margin: '0 0 14px', lineHeight: 1.15 }}>
              Your Career{' '}
              <span style={{ background: 'linear-gradient(135deg,#60a5fa,#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Accelerated.</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.65, maxWidth: '440px', margin: '0 auto 28px' }}>
              Join instantly and propel your career forward by networking with proven industry leaders.
            </p>
            <Link to="/register"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 32px', borderRadius: '10px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
              Create Your Free Profile <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section id="about" style={{ padding: '60px 24px', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: '12px' }}>The Creator</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white', margin: 0 }}>
              About <span style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Me</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '48px', alignItems: 'center', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '24px', padding: '40px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 900, color: 'white', boxShadow: '0 0 40px rgba(99,102,241,0.4)', flexShrink: 0 }}>P</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="https://www.linkedin.com/in/priyanshu-singh-2672912a5/" target="_blank" rel="noopener noreferrer"
                  style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(10,102,194,0.15)', border: '1px solid rgba(10,102,194,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }}>
                  <LinkedinIcon size={18} />
                </a>
                <a href="https://github.com/priyanshu3027" target="_blank" rel="noopener noreferrer"
                  style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }}>
                  <GithubIcon size={18} />
                </a>
                <a href="mailto:ritash3027@gmail.com"
                  style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(234,67,53,0.12)', border: '1px solid rgba(234,67,53,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }}>
                  <Mail size={18} style={{ color: '#ea4335' }} />
                </a>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'white', margin: '0 0 6px' }}>Priyanshu Singh</h3>
              <p style={{ fontSize: '13px', color: '#6366f1', fontWeight: 600, margin: '0 0 16px', letterSpacing: '0.04em' }}>MCA Student - Full-Stack Developer - AI Enthusiast</p>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.75, margin: '0 0 24px' }}>
                Building AlumSphere to bridge the gap between students and alumni - creating a platform where knowledge, mentorship, and opportunity flow freely. Passionate about crafting meaningful products with modern tech stacks.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="https://www.linkedin.com/in/priyanshu-singh-2672912a5/" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>
                  <LinkedinIcon size={15} />
                  linkedin.com/in/priyanshu-singh-2672912a5
                  <ExternalLink size={11} style={{ color: '#475569' }} />
                </a>
                <a href="https://github.com/priyanshu3027" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>
                  <GithubIcon size={15} />
                  github.com/priyanshu3027
                  <ExternalLink size={11} style={{ color: '#475569' }} />
                </a>
                <a href="mailto:ritash3027@gmail.com"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>
                  <Mail size={15} style={{ color: '#ea4335' }} />
                  ritash3027@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#334155', margin: '0 0 8px' }}>AlumSphere © 2026 - Built for ambitious professionals</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          <a href="https://www.linkedin.com/in/priyanshu-singh-2672912a5/" target="_blank" rel="noopener noreferrer" style={{ color: '#334155', transition: 'color 0.2s' }}><LinkedinIcon size={15} /></a>
          <a href="https://github.com/priyanshu3027" target="_blank" rel="noopener noreferrer" style={{ color: '#334155', transition: 'color 0.2s' }}><GithubIcon size={15} /></a>
          <a href="mailto:ritash3027@gmail.com" style={{ color: '#334155', transition: 'color 0.2s' }}><Mail size={15} /></a>
        </div>
      </footer>
    </div>
  );
}

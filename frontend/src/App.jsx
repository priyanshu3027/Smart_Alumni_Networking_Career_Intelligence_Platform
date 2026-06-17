import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Events from './pages/Events';
import Network from './pages/Network';
import Chat from './pages/Chat';
import AIHub from './pages/AIHub';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Games from './pages/Games';
import Leaderboard from './pages/Leaderboard';
import Community from './pages/Community';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AlumSphereLogo from './components/AlumSphereLogo';
import ChatbotWidget from './components/ChatbotWidget';

/* ── Futuristic Loading Screen ───────────────────────── */
function LoadingScreen() {
  return (
    <div
      className="flex h-screen items-center justify-center"
      style={{ background: '#020617' }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Orbital rings loader */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Core logo */}
          <div className="z-10">
            <AlumSphereLogo size={48} />
          </div>
          {/* Ring 1 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '1px solid rgba(99,102,241,0.3)',
              animation: 'spin 2s linear infinite',
            }}
          />
          {/* Orbiting dot 1 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              style={{
                width: '8px',
                height: '8px',
                background: '#6366f1',
                borderRadius: '50%',
                boxShadow: '0 0 12px rgba(99,102,241,0.8)',
                transformOrigin: '0 -38px',
                animation: 'orbit 2s linear infinite',
              }}
            />
          </div>
          {/* Orbiting dot 2 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              style={{
                width: '5px',
                height: '5px',
                background: '#3b82f6',
                borderRadius: '50%',
                boxShadow: '0 0 8px rgba(59,130,246,0.8)',
                transformOrigin: '0 30px',
                animation: 'orbit2 3s linear infinite',
              }}
            />
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1
            className="text-2xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg,#60a5fa,#a5b4fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AlumSphere
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium tracking-widest uppercase">
            Launching…
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="w-40 h-0.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg,#3b82f6,#6366f1)',
              width: '60%',
              animation: 'shimmer 1.5s ease-in-out infinite',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Protected Layout (3-column) ─────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;

  return (
    <div
      className="flex h-screen overflow-hidden selection:bg-indigo-500/30"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* LEFT SIDEBAR — Full height vertical nav (Hidden on small screens) */}
      <div
        className="hidden lg:flex flex-col shrink-0 transition-all duration-300"
        style={{ width: sidebarCollapsed ? '88px' : '240px', zIndex: 40 }}
      >
        <Sidebar className="flex-1 overflow-y-auto" collapsed={sidebarCollapsed} />
      </div>

      {/* CENTER & RIGHT — Top Navbar + Main Content */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        <Navbar
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          collapsed={sidebarCollapsed}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        
        <main className="flex-1 overflow-y-auto scroll-smooth relative z-10 w-full">
          <div className="mx-auto max-w-[1600px] h-full">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{
          background: 'var(--bg-elevated)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {[
          { icon: '⊞', label: 'Home',    to: '/dashboard' },
          { icon: '⊹', label: 'Network', to: '/network' },
          { icon: '⊕', label: 'Jobs',    to: '/jobs' },
          { icon: '⊗', label: 'Chat',    to: '/chat' },
          { icon: '⊛', label: 'Profile', to: '/profile' },
        ].map(({ icon, label, to }) => (
          <a
            key={to}
            href={to}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-slate-500 hover:text-white transition-colors"
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
};

const LandingRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" />;
  return <LandingPage />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem('theme');
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(10,14,30,0.97)',
                color: '#e2e8f0',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '14px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
                fontSize: '13px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#34d399', secondary: '#020617' },
              },
              error: {
                iconTheme: { primary: '#f87171', secondary: '#020617' },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingRoute />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/jobs"        element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/events"      element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/network"     element={<ProtectedRoute><Network /></ProtectedRoute>} />
            <Route path="/chat"        element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/ai-hub"      element={<ProtectedRoute><AIHub /></ProtectedRoute>} />
            <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/community"   element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/admin"       element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/games"       element={<ProtectedRoute><Games /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>

          {/* Global floating chatbot — visible on ALL pages */}
          <ChatbotWidget />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

import { useState, useRef, useEffect } from 'react';
import {
  Zap, FileText, Map as PathIcon, TrendingUp,
  ArrowRight, Upload, Target, BrainCircuit,
  CheckCircle2, AlertCircle, Send, Sparkles,
  Bot, User, Loader2, X
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

/* Suggestion chips */
const CHIPS = [
  'Review my resume for ATS score',
  'Find jobs matching my profile',
  'Suggest alumni to connect with',
  'Build my career roadmap',
  'Top skills for my role',
];

/* Animated typing cursor */
function Cursor() {
  return (
    <span
      className="inline-block w-0.5 h-4 ml-0.5 rounded-full animate-pulse"
      style={{ background: '#818cf8', verticalAlign: 'middle' }}
    />
  );
}

/* Message bubble */
function ChatBubble({ role, content, isTyping }) {
  const isBot = role === 'bot';
  return (
    <div className={`flex items-start gap-3 animate-slide-up ${!isBot ? 'flex-row-reverse' : ''}`}>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: isBot
            ? 'linear-gradient(135deg,#6366f1,#3b82f6)'
            : 'rgba(255,255,255,0.08)',
          boxShadow: isBot ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
          border: isBot ? 'none' : '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {isBot
          ? <Bot size={16} className="text-white" />
          : <User size={16} className="text-slate-400" />
        }
      </div>
      <div
        className="max-w-[78%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed"
        style={isBot ? {
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.15)',
          color: '#e2e8f0',
          borderRadius: '1rem 1rem 1rem 0.25rem',
        } : {
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
          color: 'white',
          boxShadow: '0 4px 15px rgba(99,102,241,0.25)',
          borderRadius: '1rem 1rem 0.25rem 1rem',
        }}
      >
        {isTyping
          ? <span className="flex items-center gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="typing-dot" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </span>
          : <>{content}<Cursor /></>
        }
      </div>
    </div>
  );
}

export default function AIHub() {
  const [activeTool, setActiveTool] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', content: "Hi! I'm AlumSphere's AI assistant. I can help you with resume reviews, career roadmaps, job matching, and alumni connections. What would you like to explore today?" }
  ]);
  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [goal, setGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const handleChip = (chip) => {
    setInput(chip);
  };

  const handleChatSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiTyping(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsAiTyping(false);
    setChatMessages(prev => [...prev, {
      role: 'bot',
      content: `I'm processing your request: "${userMsg}". Please use the specialized tools below for detailed analysis—Resume Analyzer, Career Roadmap, or Market Insights.`
    }]);
  };

  const handleAnalyzeResume = async () => {
    setLoading(true);
    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        res = await api.post('/ai/analyze-resume', formData);
      } else {
        res = await api.post('/ai/analyze-resume');
      }
      if (!res.data.success) throw new Error(res.data.message || 'Error analyzing resume');
      setAnalysis(res.data.analysis);
      toast.success('Analysis complete!');
    } catch (err) { 
      console.error('Resume Analysis Error:', err);
      toast.error(err.response?.data?.message || err.message || 'Error analyzing resume'); 
    }
    finally { setLoading(false); }
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    const finalGoal = goal === '__other__' ? customGoal.trim() : goal.trim();
    if (!finalGoal) return toast.error('Please select or enter a career goal');
    setLoading(true);
    try {
      const res = await api.post('/ai/career-roadmap', { goal: finalGoal });
      setRoadmap(res.data.roadmap);
      toast.success('Roadmap generated!');
    } catch (err) {
      console.error('Roadmap error:', err);
      toast.error(err.response?.data?.message || 'Error generating roadmap');
    } finally { setLoading(false); }
  };

  const tools = [
    { id: 'resume',   title: 'Resume Analyzer', desc: 'ATS scoring, strengths & improvements', icon: FileText,   color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { id: 'roadmap',  title: 'Career Roadmap',  desc: 'Personalized path to your dream role',  icon: PathIcon,   color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
    { id: 'insights', title: 'Market Insights',  desc: 'Skill demands & hiring trends',          icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  ];

  return (
    <div className="page-shell animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg,#6366f1,#3b82f6)',
            boxShadow: '0 0 30px rgba(99,102,241,0.5)',
            animation: 'neonPulseIndigo 2.5s ease-in-out infinite',
          }}
        >
          <Zap size={28} className="text-white" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Hub</h1>
          <p className="text-slate-500 text-sm mt-0.5">Powered by AlumSphere Intelligence — your personal career AI</p>
        </div>
      </div>

      {!activeTool ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

          {/* ── AI Chat Interface ── */}
          <div
            className="rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(99,102,241,0.15)',
              minHeight: '520px',
            }}
          >
            {/* Chat header */}
            <div
              className="px-5 py-4 flex items-center gap-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}
              >
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-white">AlumSphere AI</h3>
                <p className="text-[11px] text-emerald-400">● Always online</p>
              </div>
              <div className="ml-auto">
                <span className="badge badge-indigo">Beta</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {chatMessages.map((msg, i) => (
                <ChatBubble key={i} role={msg.role} content={msg.content} />
              ))}
              {isAiTyping && <ChatBubble role="bot" isTyping />}
              <div ref={chatEndRef} />
            </div>

            {/* Chips */}
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleChip(chip)}
                  className="text-[12px] font-medium px-3 py-1.5 rounded-xl transition-all"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#a5b4fc',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.16)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={handleChatSend}
              className="px-4 pb-4"
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything about your career…"
                  className="flex-1 bg-transparent outline-none text-[14px] text-slate-200 placeholder-slate-600"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: input.trim() ? 'linear-gradient(135deg,#6366f1,#3b82f6)' : 'rgba(255,255,255,0.05)',
                    boxShadow: input.trim() ? '0 0 10px rgba(99,102,241,0.4)' : 'none',
                  }}
                >
                  <Send size={14} className={input.trim() ? 'text-white' : 'text-slate-600'} />
                </button>
              </div>
            </form>
          </div>

          {/* ── Tool Cards ── */}
          <div className="space-y-4">
            <p className="section-heading mb-3">Specialized Tools</p>
            {tools.map(tool => (
              <div
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className="rounded-2xl p-5 cursor-pointer group transition-all"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = tool.bg;
                  e.currentTarget.style.borderColor = tool.color + '40';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 15px 30px rgba(0,0,0,0.3), 0 0 20px ${tool.color}15`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ background: tool.bg, border: `1px solid ${tool.color}30` }}
                  >
                    <tool.icon size={20} style={{ color: tool.color }} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-white">{tool.title}</h3>
                    <p className="text-[12px] text-slate-500">{tool.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: tool.color }}>
                  Launch Tool <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}

            {/* Stats */}
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} className="text-amber-400" />
                <span className="text-[13px] font-semibold text-white">AI Impact</span>
              </div>
              {[
                { label: 'Resumes Analyzed', val: '2.4K' },
                { label: 'Roadmaps Generated', val: '890' },
                { label: 'Jobs Matched', val: '3.2K' },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between items-center py-1.5">
                  <span className="text-[12px] text-slate-500">{label}</span>
                  <span className="text-[13px] font-bold text-amber-400">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Tool Detail Views ── */
        <div className="max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => { setActiveTool(null); setAnalysis(null); setRoadmap(null); }}
            className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-white transition-colors group"
          >
            <ArrowRight size={15} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to AI Hub
          </button>

          {/* Resume Tool */}
          {activeTool === 'resume' && (
            <div className="rounded-3xl p-8 animate-scale-in" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(99,102,241,0.15)' }}>
              {!analysis ? (
                <div className="text-center py-10">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', animation: 'neonPulseIndigo 2s ease-in-out infinite' }}
                  >
                    <Upload size={32} className="text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Analyze Your Resume</h2>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    Get instant ATS compatibility scoring, identify skill gaps, and receive tailored improvement suggestions.
                  </p>
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <input 
                      type="file" 
                      id="resume-upload" 
                      className="hidden" 
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <label 
                      htmlFor="resume-upload" 
                      className="cursor-pointer px-6 py-3 rounded-xl border-2 border-dashed border-indigo-500/50 hover:bg-indigo-500/10 transition-colors text-sm text-indigo-300 font-medium"
                    >
                      {selectedFile ? selectedFile.name : "+ Choose a file to upload (PDF)"}
                    </label>
                  </div>
                  <button onClick={handleAnalyzeResume} disabled={loading} className="btn-primary h-12 px-10 text-base mx-auto">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Zap size={16} fill="currentColor" /> {selectedFile ? "Analyze Uploaded File" : "Analyze Profile Data"}</>}
                  </button>
                  <p className="text-[11px] text-slate-600 mt-4">Supported: PDF, DOCX, TXT · Max 5MB (Or continue to just scan profile data)</p>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ATS Score</p>
                      <p className="text-6xl font-black text-white">{analysis.atsScore}<span className="text-2xl text-slate-600">/100</span></p>
                    </div>
                    <div className="flex-1 w-full">
                      <p className="text-[11px] text-indigo-400 font-bold mb-2">Competitiveness Level</p>
                      <div className="progress-bar h-3">
                        <div className="progress-fill" style={{ width: `${analysis.atsScore}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1">Industry Average: 65%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2 mb-3"><CheckCircle2 size={16} className="text-emerald-400" /> Strengths</h4>
                      <div className="space-y-2">
                        {analysis.strengths?.map(s => (
                          <div key={s} className="p-3 rounded-xl text-[13px] text-slate-300" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>{s}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2 mb-3"><AlertCircle size={16} className="text-amber-400" /> Improvements</h4>
                      <div className="space-y-2">
                        {analysis.improvements?.map(i => (
                          <div key={i} className="p-3 rounded-xl text-[13px] text-slate-300" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>{i}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <h4 className="font-bold text-white flex items-center gap-2 mb-3"><BrainCircuit size={16} className="text-indigo-400" /> AI Recommendations</h4>
                    <p className="text-sm text-slate-400 leading-relaxed italic">"{analysis.suggestions}"</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Roadmap Tool */}
          {activeTool === 'roadmap' && (
            <div className="rounded-3xl p-8 animate-scale-in" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(168,85,247,0.15)' }}>
              {!roadmap ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', animation: 'neonPulseIndigo 2s ease-in-out infinite' }}>
                    <Target size={32} className="text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Define Your Career Goal</h2>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">Choose a role from the list or type your own — we'll build a complete step-by-step roadmap.</p>

                  <form onSubmit={handleGenerateRoadmap} className="max-w-md mx-auto space-y-4">
                    {/* Dropdown */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        Select a Career Path
                      </label>
                      <select
                        className="input-field h-12 text-center"
                        style={{ appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: goal ? '#e2e8f0' : '#64748b' }}
                        value={goal}
                        onChange={e => setGoal(e.target.value)}
                      >
                        <option value="" style={{ background: '#0f172a' }}>— Choose a role —</option>
                        <optgroup label="🖥️ Development" style={{ background: '#0f172a' }}>
                          <option value="Full Stack Developer" style={{ background: '#0f172a' }}>Full Stack Developer</option>
                          <option value="Frontend Developer" style={{ background: '#0f172a' }}>Frontend Developer</option>
                          <option value="Backend Developer" style={{ background: '#0f172a' }}>Backend Developer</option>
                          <option value="Android Developer" style={{ background: '#0f172a' }}>Android Developer</option>
                          <option value="Software Engineer" style={{ background: '#0f172a' }}>Software Engineer</option>
                        </optgroup>
                        <optgroup label="🤖 AI & Data" style={{ background: '#0f172a' }}>
                          <option value="Data Scientist" style={{ background: '#0f172a' }}>Data Scientist</option>
                          <option value="Machine Learning Engineer" style={{ background: '#0f172a' }}>Machine Learning Engineer</option>
                          <option value="Data Analyst" style={{ background: '#0f172a' }}>Data Analyst</option>
                        </optgroup>
                        <optgroup label="☁️ Cloud & Infrastructure" style={{ background: '#0f172a' }}>
                          <option value="DevOps Engineer" style={{ background: '#0f172a' }}>DevOps Engineer</option>
                          <option value="Cloud Architect" style={{ background: '#0f172a' }}>Cloud Architect</option>
                          <option value="Cybersecurity Analyst" style={{ background: '#0f172a' }}>Cybersecurity Analyst</option>
                        </optgroup>
                        <optgroup label="🎨 Design & Product" style={{ background: '#0f172a' }}>
                          <option value="UI UX Designer" style={{ background: '#0f172a' }}>UI/UX Designer</option>
                          <option value="Product Manager" style={{ background: '#0f172a' }}>Product Manager</option>
                        </optgroup>
                        <optgroup label="✏️ Other" style={{ background: '#0f172a' }}>
                          <option value="__other__" style={{ background: '#0f172a' }}>Other (type below)</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Custom input for "Other" */}
                    {goal === '__other__' && (
                      <div className="animate-fade-in">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#a855f7', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                          ✏️ Type your custom career role
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Blockchain Developer, iOS Developer, Game Designer..."
                          className="input-field h-12 text-center"
                          value={customGoal}
                          onChange={e => setCustomGoal(e.target.value)}
                          autoFocus
                        />
                        {customGoal.trim() && (
                          <p style={{ fontSize: '11px', color: '#10b981', marginTop: '6px', textAlign: 'center' }}>
                            ✓ Will generate roadmap for: <strong>{customGoal}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Popular quick select chips */}
                    <div>
                      <p style={{ fontSize: '11px', color: '#475569', marginBottom: '8px', fontWeight: 600 }}>⚡ Quick select:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                        {['Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'UI UX Designer', 'Machine Learning Engineer'].map(r => (
                          <button key={r} type="button" onClick={() => setGoal(r)}
                            style={{
                              fontSize: '11px', padding: '4px 12px', borderRadius: '20px', border: '1px solid',
                              borderColor: goal === r ? 'rgba(168,85,247,0.6)' : 'rgba(168,85,247,0.2)',
                              background: goal === r ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.05)',
                              color: goal === r ? '#d8b4fe' : '#94a3b8',
                              cursor: 'pointer', transition: 'all 0.15s', fontWeight: 600,
                            }}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      disabled={loading || !goal || (goal === '__other__' && !customGoal.trim())}
                      type="submit"
                      className="btn-primary w-full h-12 text-base justify-center"
                      style={{ background: 'linear-gradient(135deg,#a855f7,#6366f1)', marginTop: '8px' }}>
                      {loading
                        ? <><Loader2 size={18} className="animate-spin" /> Generating Roadmap...</>
                        : <><Sparkles size={16} /> Generate My Roadmap</>}
                    </button>
                    <p style={{ fontSize: '11px', color: '#334155', textAlign: 'center' }}>
                      AI-powered • Works offline • 12 career paths available
                    </p>
                  </form>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in">
                  {/* Roadmap Header */}
                  <div style={{ textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid rgba(168,85,247,0.15)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', borderRadius: '100px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', marginBottom: '14px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 8px rgba(168,85,247,0.8)', display: 'inline-block' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d8b4fe' }}>AI Career Roadmap</span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-white mb-2">{roadmap.goal}</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94a3b8' }}>
                        <span style={{ fontSize: '16px' }}>⏱️</span>
                        <span>Estimated: <strong style={{ color: '#d8b4fe' }}>{roadmap.estimatedTime}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94a3b8' }}>
                        <span style={{ fontSize: '16px' }}>📊</span>
                        <span><strong style={{ color: '#d8b4fe' }}>{roadmap.phases?.length || 5}</strong> phases</span>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {roadmap.certifications && roadmap.certifications.length > 0 && (
                    <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>🏅 Recommended Certifications</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {roadmap.certifications.map(cert => (
                          <span key={cert} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', fontWeight: 600 }}>{cert}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phases */}
                  <div className="space-y-5">
                    {roadmap.phases?.map((phase, idx) => {
                      const phaseColors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#3b82f6'];
                      const color = phaseColors[idx % phaseColors.length];
                      return (
                        <div key={idx} style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${color}25` }}>
                          {/* Phase header */}
                          <div style={{ padding: '14px 20px', background: `linear-gradient(135deg, ${color}12, transparent)`, borderBottom: `1px solid ${color}20`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: 'white', boxShadow: `0 0 12px ${color}60`, flexShrink: 0 }}>
                              {idx + 1}
                            </div>
                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'white', margin: 0 }}>{phase.phase}</h4>
                          </div>
                          {/* Phase content */}
                          <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.015)' }}>
                            <div>
                              <p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>🎯 Topics to learn</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {phase.topics?.map(t => (
                                  <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                                    <span style={{ color, marginTop: '2px', flexShrink: 0 }}>▸</span>
                                    <span>{t}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>📚 Resources</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {phase.resources?.map(r => (
                                  <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                                    <ArrowRight size={10} style={{ color, marginTop: '4px', flexShrink: 0 }} />
                                    {r}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reset */}
                  <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                    <button
                      onClick={() => { setRoadmap(null); setGoal(''); setCustomGoal(''); }}
                      className="btn-outline flex-1 h-11 justify-center"
                      style={{ borderColor: 'rgba(168,85,247,0.3)', color: '#a855f7' }}>
                      ← Generate New Roadmap
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Insights Tool */}
          {activeTool === 'insights' && (
            <div className="rounded-3xl p-8 animate-scale-in" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="text-center py-10">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <TrendingUp size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Market Insights</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">Real-time hiring trends and skill demand analysis.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                  {['React', 'Python', 'Machine Learning', 'Cloud AWS', 'Node.js', 'Data Analysis'].map(skill => (
                    <div key={skill} className="p-3 rounded-xl text-sm font-medium text-emerald-400 transition-all" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <TrendingUp size={12} className="inline mr-1" /> {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

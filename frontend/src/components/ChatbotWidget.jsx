import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import axios from 'axios';

const QUICK_PROMPTS = [
  '🎯 What is AlumSphere?',
  '💼 How to find jobs?',
  '🤝 How to connect with alumni?',
  '🚀 Resume tips for freshers',
];

const TypingDots = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '12px 16px' }}>
    {[0, 1, 2].map(i => (
      <div
        key={i}
        style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#6366f1',
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
    <style>{`
      @keyframes bounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-6px); opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes popIn {
        0%   { transform: scale(0.5); opacity: 0; }
        80%  { transform: scale(1.05); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes pulse-ring {
        0%   { transform: scale(1);   opacity: 0.6; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    `}</style>
  </div>
);

export default function ChatbotWidget() {
  const [open, setOpen]       = useState(false);
  const [minimized, setMin]   = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm **AlumBot** 🤖 — your AI guide for AlumSphere.\n\nAsk me anything about the platform, career tips, or how to connect with alumni!",
    },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread]   = useState(0);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const userMsg = { role: 'user', content: userText };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const payload = updated.map(m => ({ role: m.role, content: m.content }));
      const { data } = await axios.post('/api/ai/chatbot', { messages: payload });
      const botMsg = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, botMsg]);
      if (!open) setUnread(n => n + 1);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Sorry, I had trouble connecting. Please try again in a moment!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderText = (text) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

  return (
    <>
      {/* ── Floating Button ──────────────────────── */}
      <div
        style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px',
        }}
      >
        {/* Chat Window */}
        {open && !minimized && (
          <div
            style={{
              width: '360px',
              height: '520px',
              borderRadius: '20px',
              background: 'rgba(8,12,28,0.97)',
              border: '1px solid rgba(99,102,241,0.3)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideUp 0.25s ease',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 16px',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.2))',
                borderBottom: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', gap: '10px',
                flexShrink: 0,
              }}
            >
              {/* Bot avatar */}
              <div
                style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(99,102,241,0.5)',
                }}
              >
                <Bot size={18} color="white" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'white' }}>AlumBot</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.8)', display: 'inline-block' }} />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Powered by GPT-4o-mini</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setMin(true)}
                  style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >
                  <Minimize2 size={15} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1, overflowY: 'auto', padding: '14px 14px 8px',
                display: 'flex', flexDirection: 'column', gap: '10px',
                scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent',
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    animation: 'slideUp 0.2s ease',
                  }}
                >
                  {/* Bot icon */}
                  {msg.role === 'assistant' && (
                    <div
                      style={{
                        width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0, marginRight: '8px', marginTop: '2px',
                        background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Bot size={13} color="white" />
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: '78%',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      ...(msg.role === 'user'
                        ? {
                            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                            color: 'white',
                            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#cbd5e1',
                          }),
                    }}
                    dangerouslySetInnerHTML={{ __html: renderText(msg.content) }}
                  />
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', animation: 'slideUp 0.2s ease' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={13} color="white" />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 4px' }}>
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div style={{ padding: '0 14px 8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    style={{
                      padding: '5px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 500,
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                      color: '#a5b4fc', cursor: 'pointer', transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              style={{
                padding: '12px 14px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: '8px', flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask AlumBot anything…"
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                  padding: '9px 13px', fontSize: '13px', color: 'white',
                  outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: '38px', height: '38px', borderRadius: '10px', border: 'none',
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg,#3b82f6,#6366f1)'
                    : 'rgba(255,255,255,0.06)',
                  color: input.trim() && !loading ? 'white' : '#475569',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', flexShrink: 0,
                  boxShadow: input.trim() && !loading ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Minimized bar */}
        {open && minimized && (
          <div
            onClick={() => setMin(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', borderRadius: '12px', cursor: 'pointer',
              background: 'rgba(8,12,28,0.97)', border: '1px solid rgba(99,102,241,0.3)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'slideUp 0.2s ease',
            }}
          >
            <Bot size={16} color="#818cf8" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>AlumBot</span>
            <Maximize2 size={13} color="#475569" />
          </div>
        )}

        {/* Trigger Button */}
        <button
          onClick={() => { setOpen(o => !o); setMin(false); }}
          style={{
            width: '56px', height: '56px', borderRadius: '18px', border: 'none',
            background: open
              ? 'rgba(99,102,241,0.2)'
              : 'linear-gradient(135deg,#3b82f6,#6366f1)',
            boxShadow: open
              ? '0 0 0 2px rgba(99,102,241,0.4)'
              : '0 0 30px rgba(99,102,241,0.55), 0 8px 24px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.3s',
            animation: open ? 'none' : 'popIn 0.4s ease',
          }}
          onMouseEnter={e => { if (!open) e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {/* Pulse ring */}
          {!open && (
            <div style={{
              position: 'absolute', inset: '-4px', borderRadius: '22px',
              border: '2px solid rgba(99,102,241,0.5)',
              animation: 'pulse-ring 2s ease-out infinite',
              pointerEvents: 'none',
            }} />
          )}

          {open
            ? <X size={22} color="#818cf8" />
            : <Sparkles size={22} color="white" />
          }

          {/* Unread badge */}
          {unread > 0 && !open && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-6px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: '#ef4444', fontSize: '10px', fontWeight: 800, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 8px rgba(239,68,68,0.6)',
            }}>
              {unread}
            </span>
          )}
        </button>
      </div>
    </>
  );
}

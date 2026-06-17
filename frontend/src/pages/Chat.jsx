import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Search, Phone, Video,
  Info, CheckCheck, Smile, Paperclip, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

/* ── Typing indicator ───────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <span className="text-[10px] text-indigo-400">…</span>
      </div>
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {[0,1,2].map(i => (
          <span
            key={i}
            className="typing-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (selectedChat) {
      setMsgLoading(true);
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    socket.on('receiveMessage', (message) => {
      if (selectedChat && (message.sender._id === selectedChat._id || message.sender === selectedChat._id)) {
        setMessages(prev => [...prev, message]);
      }
      fetchConversations();
    });
    socket.on('userTyping', ({ senderId }) => {
      if (selectedChat?._id === senderId) setIsTyping(true);
    });
    socket.on('userStopTyping', ({ senderId }) => {
      if (selectedChat?._id === senderId) setIsTyping(false);
    });
    return () => {
      socket.off('receiveMessage');
      socket.off('userTyping');
      socket.off('userStopTyping');
    };
  }, [socket, selectedChat]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/chat/messages/${userId}`);
      setMessages(res.data.messages);
    } catch {
      toast.error('Could not load messages');
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    const msgData = { receiverId: selectedChat._id, senderId: user._id, content: newMessage, senderName: user.name, senderAvatar: user.avatar };
    const temp = { _id: Date.now().toString(), sender: user._id, content: newMessage, createdAt: new Date(), isRead: false };
    setMessages(prev => [...prev, temp]);
    setNewMessage('');
    try {
      await api.post('/chat/send', { receiverId: selectedChat._id, content: newMessage });
      socket?.emit('sendMessage', msgData);
      socket?.emit('stopTyping', { receiverId: selectedChat._id, senderId: user._id });
    } catch {
      toast.error('Failed to send');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedChat) return;
    socket.emit('typing', { receiverId: selectedChat._id, senderId: user._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('stopTyping', { receiverId: selectedChat._id, senderId: user._id });
    }, 1200);
  };

  const isOnline = (id) => onlineUsers?.includes(id);
  const filteredConvos = conversations.filter(c => {
    const other = c.participants?.find(p => p._id !== user._id);
    return other?.name?.toLowerCase().includes(searchVal.toLowerCase());
  });

  return (
    <div
      className="flex animate-fade-in"
      style={{
        height: 'calc(100vh - 56px)',
        background: 'transparent',
      }}
    >
      {/* ── LEFT: Conversation list ──────────────────── */}
      <div
        className="flex flex-col shrink-0"
        style={{
          width: '300px',
          background: 'rgba(5,8,20,0.9)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-400" /> Messages
            </h2>
            <span className="badge badge-indigo text-[10px]">
              {conversations.length}
            </span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search…"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] text-slate-300 rounded-xl outline-none placeholder-slate-600 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex gap-3 p-2">
                  <div className="skeleton w-11 h-11 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-2.5 w-32 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvos.length > 0 ? (
            filteredConvos.map(conv => {
              const other = conv.participants?.find(p => p._id !== user._id);
              if (!other) return null;
              const isActive = selectedChat?._id === other._id;
              return (
                <div
                  key={conv._id}
                  onClick={() => setSelectedChat(other)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                  style={{
                    background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                    borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="relative shrink-0">
                    <img
                      src={other.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name)}&background=6366f1&color=fff`}
                      className="w-11 h-11 rounded-full object-cover"
                      style={{
                        outline: isActive ? '2px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                        outlineOffset: '1px',
                      }}
                    />
                    {isOnline(other._id) && (
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{ background: '#10b981', borderColor: '#050814' }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-white truncate">{other.name}</span>
                      <span className="text-[10px] text-slate-600 shrink-0 ml-1">
                        {conv.lastMessage?.createdAt ? format(new Date(conv.lastMessage.createdAt), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-600 truncate mt-0.5">
                      {conv.lastMessage?.content || 'Start a conversation'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}
                    >
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare size={28} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-600">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Chat window ───────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: 'rgba(3,7,18,0.6)' }}>
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div
              className="flex items-center justify-between px-5 py-3 shrink-0"
              style={{
                background: 'rgba(5,8,20,0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}&background=6366f1&color=fff`}
                    className="w-9 h-9 rounded-full object-cover"
                    style={{ outline: '2px solid rgba(99,102,241,0.3)', outlineOffset: '1px' }}
                  />
                  {isOnline(selectedChat._id) && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2" style={{ borderColor: '#050814' }} />
                  )}
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white">{selectedChat.name}</h3>
                  <p className="text-[11px] font-medium" style={{ color: isTyping ? '#34d399' : isOnline(selectedChat._id) ? '#34d399' : '#475569' }}>
                    {isTyping ? 'typing…' : isOnline(selectedChat._id) ? '● Online' : '○ Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {[Phone, Video, Info].map((Icon, i) => (
                  <button key={i} className="btn-icon w-8 h-8 rounded-xl">
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {/* Grid background */}
              <div
                className="fixed inset-0 pointer-events-none opacity-[0.025]"
                style={{
                  backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {msgLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-float"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    <MessageSquare size={28} className="text-indigo-400" />
                  </div>
                  <p className="text-slate-500 text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender === user._id || msg.sender?._id === user._id;
                  const showAvatar = !isMe && (i === 0 || messages[i-1]?.sender !== msg.sender);

                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      {!isMe && (
                        <div className="w-7 h-7 shrink-0">
                          {showAvatar && (
                            <img
                              src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}&background=6366f1&color=fff`}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          )}
                        </div>
                      )}

                      <div className={`space-y-1 max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`msg-bubble ${isMe ? 'msg-sent' : 'msg-received'}`}>
                          {msg.content}
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] text-slate-600 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                          {isMe && (
                            <CheckCheck
                              size={12}
                              className={msg.isRead ? 'text-indigo-400' : 'text-slate-600'}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="px-4 py-3 shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,8,20,0.8)', backdropFilter: 'blur(20px)' }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-2xl transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={() => {}}
              >
                <button type="button" className="btn-icon w-7 h-7 rounded-lg shrink-0">
                  <Paperclip size={14} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent outline-none text-[14px] text-slate-200 placeholder-slate-600"
                />
                <button type="button" className="btn-icon w-7 h-7 rounded-lg shrink-0">
                  <Smile size={14} />
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: newMessage.trim() ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'rgba(255,255,255,0.06)',
                    boxShadow: newMessage.trim() ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                  }}
                >
                  <Send size={14} className={newMessage.trim() ? 'text-white' : 'text-slate-600'} />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 animate-float"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(59,130,246,0.1))',
                border: '1px solid rgba(99,102,241,0.2)',
                boxShadow: '0 0 40px rgba(99,102,241,0.1)',
              }}
            >
              <MessageSquare size={36} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Your messages</h2>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              Select a conversation from the left to start chatting with alumni and colleagues.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Search, 
  Zap, 
  MapPin, 
  Briefcase, 
  UserCircle 
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Network() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const [reqRes, suggestRes] = await Promise.all([
        api.get('/connections/pending'),
        api.get('/ai/connection-suggestions')
      ]);
      setRequests(reqRes.data.requests || []);
      setSuggestions(suggestRes.data.suggestions || []);
    } catch (err) {
      console.error('Error fetching network data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      await api.put(`/connections/respond/${requestId}`, { status: action });
      toast.success(`Request ${action}ed`);
      fetchNetworkData();
    } catch (err) {
      toast.error('Error responding to request');
    }
  };

  const sendRequest = async (receiverId) => {
    try {
      await api.post('/connections/send', { receiverId });
      toast.success('Connection request sent!');
      fetchNetworkData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending request');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/users/search?query=${searchTerm}`);
      setSearchResults(res.data.users);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">My Network</h1>
        <p className="text-gray-400">Manage your connections and discover new professional opportunities.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Pending Requests */}
          {requests.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#6366f1] rounded-full"></span>
                Pending Requests ({requests.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map(req => (
                  <div key={req._id} className="glass p-5 rounded-2xl border border-[#1e2a40] flex items-center gap-4 hover:border-[#6366f1]/30 transition-all">
                    <img 
                      src={req.sender.avatar || `https://ui-avatars.com/api/?name=${req.sender.name}&background=6366f1&color=fff`} 
                      className="w-14 h-14 rounded-full border border-white/10" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate">{req.sender.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{req.sender.role} • {req.sender.institution || req.sender.company}</p>
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => handleAction(req._id, 'accepted')}
                          className="flex-1 h-9 rounded-lg bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/30 text-xs font-bold hover:bg-[#6366f1] hover:text-white transition-all flex items-center justify-center gap-1"
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button 
                          onClick={() => handleAction(req._id, 'rejected')}
                          className="flex-1 h-9 rounded-lg bg-white/5 text-gray-400 border border-white/5 text-xs font-bold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center gap-1"
                        >
                          <X size={14} /> Ignore
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Search Users */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#a855f7] rounded-full"></span>
              Find Someone New
            </h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, skill, or role..." 
                className="input-field pl-12 h-12 pr-32"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 bg-[#6366f1] text-white rounded-lg text-xs font-bold hover:bg-[#4f46e5] transition-all"
              >
                {searching ? '...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {searchResults.map(u => (
                  <div key={u._id} className="glass p-4 rounded-2xl border border-[#1e2a40] flex items-center gap-3">
                    <img src={u.avatar} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-white truncate">{u.name}</h5>
                      <p className="text-[0.7rem] text-gray-500 truncate">{u.role} at {u.company || u.institution}</p>
                    </div>
                    <button 
                      onClick={() => sendRequest(u._id)}
                      className="p-2 rounded-lg bg-[#6366f1]/10 text-[#818cf8] hover:bg-[#6366f1] hover:text-white transition-all"
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Suggestions */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#10b981] rounded-full"></span>
              AI Suggested Mentors & Peers
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 4].map(i => <div key={i} className="h-32 skeleton"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map(s => (
                  <div key={s._id} className="glass p-5 rounded-2xl border border-[#1e2a40] hover:border-[#10b981]/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 bg-[#10b981]/10 rounded-bl-2xl text-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap size={14} fill="currentColor" />
                    </div>
                    <div className="flex items-start gap-4">
                      <img src={s.avatar} className="w-12 h-12 rounded-full border border-white/5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate group-hover:text-[#34d399] transition-colors">{s.name}</h4>
                        <p className="text-xs text-gray-400 truncate mb-1">{s.role} • {s.company || s.institution}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.sharedSkills?.map(skill => (
                            <span key={skill} className="text-[0.6rem] px-2 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5 uppercase font-bold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => sendRequest(s._id)}
                        className="flex-1 h-9 rounded-lg bg-white/5 text-gray-400 text-xs font-bold hover:bg-[#10b981]/20 hover:text-[#34d399] hover:border-[#10b981]/30 border border-transparent transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus size={14} /> Connect
                      </button>
                      <button className="w-9 h-9 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center hover:bg-white/10 transition-all">
                        <UserCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Mini-stat */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-[#1e2a40] bg-gradient-to-br from-[#6366f1]/5 via-transparent to-transparent">
            <h3 className="font-bold text-white mb-4">Network Growth</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-extrabold text-white">{user?.connections?.length || 0}</span>
              <span className="text-gray-500 text-sm mb-1.5 font-medium">Connections</span>
            </div>
            <div className="progress-bar w-full mb-6">
              <div className="progress-fill" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your network is in the top 15% of alumni. Keep connecting to unlock more AI insights and career opportunities.
            </p>
          </div>

          <div className="glass p-5 rounded-3xl border border-[#1e2a40]">
            <h4 className="font-bold text-white text-sm mb-4">Quick Insights</h4>
            <div className="space-y-4">
              {[
                { label: 'Profile Views', value: '128', icon: Users, color: 'text-blue-400' },
                { label: 'Search Results', value: '42', icon: Search, color: 'text-purple-400' }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

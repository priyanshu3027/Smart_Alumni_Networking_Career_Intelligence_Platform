import { useState, useEffect } from 'react';
import { 
  Users, 
  PlusCircle, 
  MessageSquare, 
  ShieldCheck, 
  Globe, 
  Lock, 
  TrendingUp, 
  ArrowRight,
  MoreVertical,
  ThumbsUp,
  Share2
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Community() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/community/groups');
      setGroups(res.data.groups);
      if (res.data.groups.length > 0) {
        setActiveGroup(res.data.groups[0]);
        fetchPosts(res.data.groups[0]._id);
      }
    } catch (err) {
      toast.error('Error loading community data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (groupId) => {
    try {
      const res = await api.get(`/community/groups/${groupId}/posts`);
      setPosts(res.data.posts);
    } catch (err) {
      console.error('Error fetching posts');
    }
  };

  const handleGroupSelect = (group) => {
    setActiveGroup(group);
    fetchPosts(group._id);
  };

  return (
    <div className="flex min-h-full bg-[#0b0f19] animate-fade-in overflow-hidden">
      {/* Group Sidebar */}
      <div className="w-full lg:w-80 border-r border-[#1e2a40] flex flex-col glass z-10">
        <div className="p-6 border-b border-[#1e2a40]">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Groups</h2>
              <button className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                <PlusCircle size={20} />
              </button>
           </div>
           <div className="flex items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 group">
              <TrendingUp size={16} className="text-[#6366f1]" />
              <span className="text-xs font-bold text-gray-300">Discover Communities</span>
              <ArrowRight size={14} className="ml-auto text-gray-600 group-hover:translate-x-1 transition-transform" />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-16 skeleton rounded-xl"></div>)
          ) : groups.map(group => (
            <div 
              key={group._id} 
              onClick={() => handleGroupSelect(group)}
              className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${activeGroup?._id === group._id ? 'bg-[#6366f1]/10 border-[#6366f1]/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e2a40] to-[#0b0f19] flex items-center justify-center text-[#818cf8] border border-white/5">
                <Users size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold truncate ${activeGroup?._id === group._id ? 'text-white' : 'text-gray-400'}`}>{group.name}</h4>
                <p className="text-[0.65rem] text-gray-500 font-medium">{group.members?.length || 0} members</p>
              </div>
              {group.isLocked && <Lock size={12} className="text-gray-600" />}
            </div>
          ))}
        </div>
      </div>

      {/* Group Content/Feed */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {activeGroup ? (
          <div className="p-4 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
            {/* Group Header */}
            <div className="glass p-8 rounded-3xl border border-[#1e2a40] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Users size={120} />
               </div>
               <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                     <Users size={40} />
                  </div>
                  <div className="text-center md:text-left">
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                        <h1 className="text-3xl font-black text-white">{activeGroup.name}</h1>
                        <span className="badge badge-primary text-[0.6rem]">{activeGroup.category}</span>
                     </div>
                     <p className="text-gray-500 font-medium text-sm max-w-xl">{activeGroup.description}</p>
                     <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                        <button className="btn-primary h-11 px-8 text-xs">Join Community</button>
                        <button className="btn-secondary h-11 px-6 text-xs text-gray-400"><Share2 size={16} /></button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Post Feed */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#6366f1] rounded-full"></span>
                    Recent Discussions
                  </h3>
                  <button className="text-xs font-bold text-[#818cf8] hover:underline">Most Recent</button>
               </div>

               {posts.length > 0 ? posts.map(post => (
                 <div key={post._id} className="glass p-6 rounded-3xl border border-[#1e2a40] space-y-4 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <img src={post.author?.avatar} className="w-9 h-9 rounded-full border border-white/5" />
                          <div>
                             <h4 className="text-sm font-bold text-white mb-0.5">{post.author?.name}</h4>
                             <p className="text-[0.65rem] text-gray-500 font-medium">Global Mentor • 2 hours ago</p>
                          </div>
                       </div>
                       <button className="p-1.5 rounded-lg text-gray-600 hover:text-white transition-all"><MoreVertical size={16} /></button>
                    </div>
                    <div className="space-y-3">
                       <h3 className="font-bold text-white leading-tight">{post.title}</h3>
                       <p className="text-sm text-gray-400 leading-relaxed">{post.content}</p>
                    </div>
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                         {post.tags.map(tag => <span key={tag} className="tag text-[0.65rem] py-1">#{tag}</span>)}
                      </div>
                    )}
                    <div className="divider opacity-30"></div>
                    <div className="flex items-center gap-6">
                       <button className="flex items-center gap-2 text-gray-500 hover:text-[#6366f1] transition-all text-xs font-bold">
                          <ThumbsUp size={16} /> 24 Helpful
                       </button>
                       <button className="flex items-center gap-2 text-gray-500 hover:text-[#6366f1] transition-all text-xs font-bold">
                          <MessageSquare size={16} /> 8 Comments
                       </button>
                    </div>
                 </div>
               )) : (
                 <div className="py-20 text-center glass rounded-3xl border border-dashed border-[#1e2a40]">
                    <MessageSquare size={48} className="text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No discussions yet</h3>
                    <p className="text-gray-500">Be the first to start a conversation in this community.</p>
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
             <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-[#6366f1] mb-6 animate-float">
                <Globe size={48} />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Explore Communities</h2>
             <p className="text-gray-500 max-w-sm">Join niche groups, share your expertise, and build your professional circle on AlumSphere.</p>
          </div>
        )}
      </div>
    </div>
  );
}

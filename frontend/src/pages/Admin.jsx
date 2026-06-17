import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  UserX, 
  BarChart3, 
  AlertTriangle, 
  Search, 
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, pendingAlumni: 0, jobsPosted: 0, activeEvents: 0 });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [userRes, statRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);
      setUsers(userRes.data.users);
      setStats(statRes.data.stats);
    } catch (err) {
      toast.error('Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, action) => {
    try {
      await api.put(`/admin/verify-alumni/${userId}`, { status: action });
      toast.success(`Alumni ${action === 'approved' ? 'verified' : 'rejected'}`);
      fetchAdminData();
    } catch (err) {
      toast.error('Error updating verification status');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <ShieldCheck size={32} className="text-[#6366f1]" />
             Admin Dashboard
          </h1>
          <p className="text-gray-400 font-medium">Manage AlumSphere platform, verify alumni, and monitor system health.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Pending Verifications', value: stats.pendingAlumni, icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Jobs Posted', value: stats.jobsPosted, icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Platform Activity', value: 'High', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' }
        ].map(stat => (
          <div key={stat.label} className="glass p-6 rounded-2xl border border-[#1e2a40]">
             <div className="flex items-center justify-between mb-4">
               <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                 <stat.icon size={20} />
               </div>
               <TrendingUp size={14} className="text-emerald-500" />
             </div>
             <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
             <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
             <div className="flex items-center gap-2">
               <FilterTabs current={filter} set={setFilter} />
             </div>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
               <input type="text" placeholder="Search users..." className="input-field pl-9 py-2 text-xs w-48 bg-transparent" />
             </div>
          </div>

          <div className="glass rounded-2xl border border-[#1e2a40] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-[#1e2a40]">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a40]">
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">Loading data...</td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} className="w-9 h-9 rounded-full border border-white/5" />
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-[#6366f1] transition-colors">{u.name}</p>
                          <p className="text-[0.7rem] text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[0.65rem] font-bold px-2 py-1 rounded-md uppercase ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : u.role === 'alumni' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'alumni' ? (
                        u.isVerified ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold"><CheckCircle2 size={12} /> Verified</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-amber-500 font-bold"><AlertTriangle size={12} /> Pending</span>
                        )
                      ) : (
                        <span className="text-xs text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {u.role === 'alumni' && !u.isVerified && (
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleVerify(u._id, 'approved')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                            >
                              <UserCheck size={14} />
                            </button>
                            <button 
                              onClick={() => handleVerify(u._id, 'rejected')}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            >
                              <UserX size={14} />
                            </button>
                         </div>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
           <div className="glass p-6 rounded-2xl border border-[#1e2a40]">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 size={18} className="text-[#6366f1]" /> Platform Pulse
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Daily New Users', val: 12, pct: 45 },
                   { label: 'Job Applications', val: 84, pct: 72 },
                   { label: 'Event Enrollments', val: 215, pct: 88 }
                 ].map(i => (
                   <div key={i.label} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-medium">{i.label}</span>
                        <span className="text-white font-bold">{i.val}</span>
                      </div>
                      <div className="progress-bar w-full h-1.5">
                        <div className="progress-fill" style={{ width: `${i.pct}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function FilterTabs({current, set}) {
  return (
    <div className="flex gap-1">
      {['all', 'alumni', 'student'].map(t => (
        <button 
          key={t}
          onClick={() => set(t)}
          className={`px-3 py-1.5 rounded-lg text-[0.7rem] font-bold uppercase tracking-wider transition-all ${current === t ? 'bg-[#6366f1] text-white' : 'text-gray-500 hover:bg-white/5'}`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

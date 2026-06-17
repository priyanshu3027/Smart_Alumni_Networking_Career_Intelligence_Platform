import { useState, useEffect } from 'react';
import {
  User, Mail, MapPin, Briefcase, GraduationCap,
  Pencil, Camera, ShieldCheck, Trash2, Plus,
  Save, FileText, X, Link as LinkIcon, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${user._id}`);
      const u = res.data.user;
      setProfileData({
        ...user,
        ...u,
        skills: u.skills || [],
        experience: u.experience || [],
        education: u.education || [],
        points: u.points || 0,
      });
    } catch {
      toast.error('Error loading profile');
      setProfileData({ ...user, skills: [], experience: [], education: [], points: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.put('/users/profile', profileData);
      setUser(res.data.user);
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
  };

  const addSkill = () => {
    const s = prompt('Enter a skill:');
    if (s?.trim()) setProfileData(p => ({ ...p, skills: [...(p.skills || []), s.trim()] }));
  };
  const removeSkill = (i) => setProfileData(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }));

  if (loading) return (
    <div className="page-shell space-y-6">
      <div className="skeleton h-52 rounded-3xl opacity-40" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="skeleton h-64 rounded-2xl opacity-40" />)}
      </div>
    </div>
  );

  if (!profileData) return null;

  const roleLabel = profileData.role
    ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)
    : 'Member';
  const institutionLabel = profileData.institution || profileData.company || 'AlumSphere';

  return (
    <div className="page-shell space-y-6 animate-fade-in">

      {/* ── Cover Banner + Avatar ── */}
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Banner */}
        <div
          className="h-36 lg:h-52 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #1e40af 75%, #1e3a8a 100%)',
          }}
        >
          {/* Animated gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(99,102,241,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.2) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
              opacity: 0.3,
            }}
          />
          {/* Glow orbs */}
          <div className="absolute top-4 left-8 w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6), transparent 70%)' }} />
          <div className="absolute bottom-0 right-12 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)' }} />

          {/* Edit banner btn */}
          {isEditing && (
            <button
              className="absolute top-3 right-3 btn-ghost text-xs h-8 px-3"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
            >
              <Camera size={13} /> Change Cover
            </button>
          )}
        </div>

        {/* Profile section */}
        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <img
                src={
                  profileData.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'U')}&background=6366f1&color=fff&size=256`
                }
                className="w-28 h-28 lg:w-36 lg:h-36 rounded-3xl object-cover"
                style={{
                  outline: '3px solid rgba(99,102,241,0.5)',
                  outlineOffset: '3px',
                  boxShadow: '0 0 30px rgba(99,102,241,0.3)',
                  background: '#0f172a',
                }}
              />
              {isEditing && (
                <button
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}
                >
                  <Camera size={15} className="text-white" />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left pb-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1 flex-wrap">
                {isEditing ? (
                  <input
                    className="input-field text-2xl font-black h-12 w-full md:max-w-xs"
                    value={profileData.name || ''}
                    onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                  />
                ) : (
                  <h1 className="text-2xl lg:text-3xl font-black text-white">{profileData.name}</h1>
                )}
                {profileData.isVerified && (
                  <span className="badge badge-success">
                    <ShieldCheck size={12} /> Verified Alumni
                  </span>
                )}
              </div>
              {isEditing ? (
                <input
                  className="input-field text-sm h-9 mt-1"
                  placeholder="Headline (e.g. Full Stack Dev at Google)"
                  value={profileData.headline || ''}
                  onChange={e => setProfileData(p => ({ ...p, headline: e.target.value }))}
                />
              ) : (
                <p className="text-slate-400 font-medium text-[14px] mt-0.5">
                  {profileData.headline || `${roleLabel} · ${institutionLabel}`}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-500">
                {profileData.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-indigo-500" />{profileData.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-indigo-500" />{profileData.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400" fill="currentColor" />
                  {profileData.points} pts
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pb-1 shrink-0">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-ghost h-9 px-4 text-sm"
                  >
                    <X size={15} /> Cancel
                  </button>
                  <button onClick={handleSave} className="btn-primary h-9 px-5 text-sm">
                    <Save size={15} /> Save
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn-secondary h-9 px-5 text-sm">
                  <Pencil size={15} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="space-y-5">

          {/* About */}
          <section
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-white mb-3">
              <User size={16} className="text-indigo-400" /> About
            </h3>
            {isEditing ? (
              <textarea
                className="input-field text-sm"
                rows={4}
                placeholder="Tell your story…"
                value={profileData.bio || ''}
                onChange={e => setProfileData(p => ({ ...p, bio: e.target.value }))}
              />
            ) : (
              <p className="text-[13px] text-slate-400 leading-relaxed">
                {profileData.bio || 'No bio added yet.'}
              </p>
            )}
          </section>

          {/* Skills */}
          <section
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-white mb-3">
              <Star size={16} className="text-indigo-400" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills?.length > 0 ? profileData.skills.map((skill, i) => (
                <span
                  key={i}
                  className="tag flex items-center gap-1.5 group"
                >
                  {skill}
                  {isEditing && (
                    <button onClick={() => removeSkill(i)} className="text-indigo-400 hover:text-red-400 transition-colors">
                      <X size={11} />
                    </button>
                  )}
                </span>
              )) : (
                <p className="text-[13px] text-slate-600 italic">No skills added.</p>
              )}
              {isEditing && (
                <button
                  onClick={addSkill}
                  className="tag border-dashed hover:text-white transition-colors"
                  style={{ borderColor: 'rgba(99,102,241,0.3)', color: '#6366f1' }}
                >
                  <Plus size={12} /> Add skill
                </button>
              )}
            </div>
          </section>

          {/* Reputation */}
          {profileData.points > 0 && (
            <section
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))',
                border: '1px solid rgba(245,158,11,0.15)',
              }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Star size={60} className="text-amber-400" fill="currentColor" />
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <ShieldCheck size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-white">Reputation Score</h3>
                  <p className="text-[12px] text-amber-400 font-bold">{profileData.points} XP earned</p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right two columns */}
        <div className="lg:col-span-2 space-y-5">

          {/* Experience */}
          <section
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
                <Briefcase size={17} className="text-indigo-400" /> Experience
              </h3>
              {isEditing && (
                <button className="btn-icon w-8 h-8">
                  <Plus size={15} />
                </button>
              )}
            </div>
            {profileData.experience?.length > 0 ? (
              <div className="space-y-6 relative">
                {/* Vertical timeline line */}
                <div
                  className="absolute left-5 top-2 bottom-2 w-px"
                  style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.4), rgba(99,102,241,0.05))' }}
                />
                {profileData.experience.map((exp, idx) => (
                  <div key={idx} className="flex gap-5 relative">
                    {/* Timeline dot */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10"
                      style={{
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        boxShadow: '0 0 12px rgba(99,102,241,0.2)',
                      }}
                    >
                      <Briefcase size={16} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h4 className="text-[15px] font-bold text-white">{exp.title}</h4>
                          <p className="text-indigo-400 text-[13px] font-semibold mt-0.5">{exp.company}</p>
                        </div>
                        <span
                          className="text-[11px] text-slate-500 font-medium px-3 py-1 rounded-lg shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          {exp.from} – {exp.to || 'Present'}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-600 italic">No experience added yet.</p>
            )}
          </section>

          {/* Education */}
          <section
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
                <GraduationCap size={17} className="text-indigo-400" /> Education
              </h3>
              {isEditing && (
                <button className="btn-icon w-8 h-8">
                  <Plus size={15} />
                </button>
              )}
            </div>
            {profileData.education?.length > 0 ? (
              <div className="space-y-5">
                {profileData.education.map((edu, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <GraduationCap size={16} className="text-emerald-400" />
                    </div>
                    <div className="flex-1 border-b pb-5 last:border-0 last:pb-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h4 className="text-[14px] font-bold text-white">{edu.degree}</h4>
                          <p className="text-indigo-400 text-[13px] font-semibold">{edu.institution}</p>
                        </div>
                        <span
                          className="text-[11px] text-slate-500 font-medium px-3 py-1 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          {edu.year}
                        </span>
                      </div>
                      {edu.grade && (
                        <p className="text-[12px] text-slate-500 mt-1 font-medium">Grade: {edu.grade}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-600 italic">No education added yet.</p>
            )}
          </section>

          {/* Resume */}
          <section
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-white mb-4">
              <FileText size={17} className="text-indigo-400" /> Resume
            </h3>
            <div
              className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-xl relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(99,102,241,0.2)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <FileText size={28} className="text-red-400" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-[14px] font-bold text-white">Resume.pdf</h4>
                <p className="text-[12px] text-slate-500 mt-0.5">Last updated March 25, 2026</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost text-xs h-9 px-4">Download</button>
                <button className="btn-primary text-xs h-9 px-4">Upload New</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Search, 
  Filter, 
  Zap, 
  Clock, 
  ChevronRight,
  PlusCircle,
  X,
  CheckCircle2,
  Building2,
  Users,
  Calendar,
  AlignLeft,
  Tag
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const emptyJobForm = {
  title: '',
  company: '',
  location: '',
  type: 'full-time',
  salary: '',
  experience: '0-2 years',
  openings: 1,
  deadline: '',
  description: '',
  skills: '',
  aboutCompany: '',
};

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  // Post Job Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [filterType]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      if (searchTerm) params.search = searchTerm;
      
      const res = await api.get('/jobs', { params });
      setJobs(res.data.jobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!coverLetter.trim()) return toast.error('Please provide a cover letter');
    setIsApplying(true);
    try {
      await api.post(`/jobs/${selectedJob._id}/apply`, { coverLetter });
      toast.success('Application submitted successfully!');
      setSelectedJob(null);
      setCoverLetter('');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error applying for job');
    } finally {
      setIsApplying(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.description) {
      return toast.error('Please fill all required fields');
    }
    setIsPosting(true);
    try {
      const payload = {
        ...jobForm,
        skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        openings: Number(jobForm.openings) || 1,
        deadline: jobForm.deadline || undefined,
      };
      await api.post('/jobs', payload);
      toast.success('Job posted successfully! 🎉');
      setShowPostModal(false);
      setJobForm(emptyJobForm);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setIsPosting(false);
    }
  };

  const handleFormChange = (e) => {
    setJobForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-gray-400';
  };

  const canPostJob = user?.role === 'alumni' || user?.role === 'admin';

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Job Portal</h1>
          <p className="text-gray-400">Discover your next career move with AI-powered matching.</p>
        </div>
        {canPostJob && (
          <button 
            className="btn-primary"
            onClick={() => setShowPostModal(true)}
          >
            <PlusCircle size={18} />
            Post a Job
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search titles, skills, or companies..." 
            className="input-field pl-12 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
          />
        </div>
        <div>
          <select 
            className="input-field h-12"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Job Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <button 
          onClick={fetchJobs}
          className="btn-secondary h-12 justify-center"
        >
          <Filter size={18} />
          Apply Filters
        </button>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 skeleton bg-[#1a2235]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.length > 0 ? jobs.map(job => (
            <div 
              key={job._id}
              className="glass p-6 rounded-2xl border border-[#1e2a40] hover:border-[#6366f1]/30 transition-all group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#6366f1]/10 group-hover:border-[#6366f1]/50 transition-all">
                  <Briefcase size={26} className="text-gray-400 group-hover:text-[#818cf8] transition-all" />
                </div>
                {job.matchScore > 0 && (
                  <div className={`flex items-center gap-1.5 font-bold text-sm ${getMatchColor(job.matchScore)} bg-white/5 px-3 py-1.5 rounded-lg border border-white/5`}>
                    <Zap size={14} fill="currentColor" />
                    {job.matchScore}% Match
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#818cf8] transition-colors line-clamp-1">{job.title}</h3>
              <p className="text-gray-400 text-sm mb-4 font-medium">{job.company}</p>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2.5 text-gray-500 text-sm">
                  <MapPin size={16} />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-500 text-sm">
                  <DollarSign size={16} />
                  <span>{job.salary || 'Competitive'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-500 text-sm">
                  <Clock size={16} />
                  <span>{job.type.charAt(0).toUpperCase() + job.type.slice(1)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="tag">{skill}</span>
                ))}
                {job.skills.length > 3 && (
                  <span className="text-[0.7rem] text-gray-500 flex items-center">+{job.skills.length - 3} more</span>
                )}
              </div>

              <button 
                onClick={() => setSelectedJob(job)}
                className="btn-secondary w-full justify-center group-hover:bg-[#6366f1] group-hover:text-white group-hover:border-[#6366f1]"
              >
                View Details
                <ChevronRight size={16} />
              </button>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center glass rounded-2xl border border-dashed border-[#1e2a40]">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search filters or check back later.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Post Job Modal ─── */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-[#6366f1]/30 relative">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center">
                  <Briefcase size={20} className="text-[#818cf8]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Post a Job</h2>
                  <p className="text-xs text-gray-500">Fill in the details to publish your listing</p>
                </div>
              </div>
              <button
                onClick={() => { setShowPostModal(false); setJobForm(emptyJobForm); }}
                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePostJob} className="p-6 space-y-5">
              {/* Title & Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Job Title <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Senior React Developer"
                      className="input-field pl-9 h-11"
                      value={jobForm.title}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Company <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      name="company"
                      placeholder="e.g. Google, Infosys"
                      className="input-field pl-9 h-11"
                      value={jobForm.company}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. Bangalore, Remote"
                      className="input-field pl-9 h-11"
                      value={jobForm.location}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Job Type</label>
                  <select name="type" className="input-field h-11" value={jobForm.type} onChange={handleFormChange}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>

              {/* Salary & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Salary / Package</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      name="salary"
                      placeholder="e.g. 8-12 LPA or ₹50k/month"
                      className="input-field pl-9 h-11"
                      value={jobForm.salary}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Experience Required</label>
                  <select name="experience" className="input-field h-11" value={jobForm.experience} onChange={handleFormChange}>
                    <option value="0-1 years">0-1 years (Fresher)</option>
                    <option value="0-2 years">0-2 years</option>
                    <option value="2-4 years">2-4 years</option>
                    <option value="4-6 years">4-6 years</option>
                    <option value="6+ years">6+ years</option>
                  </select>
                </div>
              </div>

              {/* Openings & Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">No. of Openings</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="number"
                      name="openings"
                      min="1"
                      max="999"
                      className="input-field pl-9 h-11"
                      value={jobForm.openings}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Application Deadline</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="date"
                      name="deadline"
                      className="input-field pl-9 h-11"
                      value={jobForm.deadline}
                      onChange={handleFormChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Required Skills <span className="text-gray-600">(comma-separated)</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    name="skills"
                    placeholder="e.g. React, Node.js, MongoDB, AWS"
                    className="input-field pl-9 h-11"
                    value={jobForm.skills}
                    onChange={handleFormChange}
                  />
                </div>
                {jobForm.skills && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {jobForm.skills.split(',').map((s, i) => s.trim() && (
                      <span key={i} className="tag text-xs">{s.trim()}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Job Description <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3.5 text-gray-500" size={16} />
                  <textarea
                    name="description"
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    className="input-field pl-9 min-h-[120px] resize-none"
                    value={jobForm.description}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              {/* About Company (optional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  About Company <span className="text-gray-600">(optional)</span>
                </label>
                <textarea
                  name="aboutCompany"
                  placeholder="Brief description about your company culture, mission, perks..."
                  className="input-field min-h-[80px] resize-none"
                  value={jobForm.aboutCompany}
                  onChange={handleFormChange}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowPostModal(false); setJobForm(emptyJobForm); }}
                  className="btn-secondary flex-1 justify-center h-12"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="btn-primary flex-[2] justify-center h-12"
                >
                  {isPosting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Posting...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      Publish Job
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#1e2a40] p-6 lg:p-8 relative">
            <button 
              onClick={() => setSelectedJob(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-6 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Briefcase size={36} className="text-[#818cf8]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedJob.title}</h2>
                <p className="text-[#818cf8] font-semibold">{selectedJob.company}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {selectedJob.location}</span>
                  <span className="flex items-center gap-1.5"><DollarSign size={14} /> {selectedJob.salary}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {selectedJob.type}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#6366f1] rounded-full"></span>
                  Job Description
                </h4>
                <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedJob.description}
                </div>
              </div>

              <div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#6366f1] rounded-full"></span>
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map(skill => (
                    <span key={skill} className="tag text-xs py-1.5 px-3">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="divider opacity-30"></div>

              {selectedJob.applicants?.some(a => a.user?._id === user?._id || a.user === user?._id) ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 size={24} />
                  <div>
                    <p className="font-bold">Already Applied</p>
                    <p className="text-xs opacity-80">Your application has been received and is under review.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#10b981] rounded-full"></span>
                    Apply for this position
                  </h4>
                  <textarea 
                    className="input-field min-h-[120px] resize-none"
                    placeholder="Tell us why you're a great fit for this role... (Cover Letter)"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  ></textarea>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedJob(null)}
                      className="btn-secondary flex-1 justify-center"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleApply}
                      disabled={isApplying}
                      className="btn-primary flex-[2] justify-center h-12"
                    >
                      {isApplying ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

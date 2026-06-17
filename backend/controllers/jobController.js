const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { awardPoints } = require('./userController');

// @desc   Get all jobs
// @route  GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const { q, location, skills, type, minSalary, maxSalary, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (q) filter.$or = [{ title: { $regex: q, $options: 'i' } }, { company: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }];
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type) filter.type = type;
    if (skills) { const sk = skills.split(',').map(s => s.trim()); filter.skills = { $in: sk.map(s => new RegExp(s, 'i')) }; }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name avatar company')
      .sort('-createdAt')
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await Job.countDocuments(filter);
    res.json({ success: true, jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get single job
// @route  GET /api/jobs/:id
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name avatar company designation');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    job.views += 1;
    await job.save();
    res.json({ success: true, job });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Create job (verified alumni only)
// @route  POST /api/jobs
const createJob = async (req, res) => {
  try {
    if (req.user.role === 'alumni' && !req.user.isVerified) {
      return res.status(403).json({ success: false, message: 'Only verified alumni can post jobs' });
    }
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ success: true, job });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Update job
// @route  PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, job });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Delete job
// @route  DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Apply for job
// @route  POST /api/jobs/:id/apply
const applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    const alreadyApplied = job.applicants.find(a => a.user.toString() === req.user._id.toString());
    if (alreadyApplied) return res.status(400).json({ success: false, message: 'Already applied' });
    job.applicants.push({ user: req.user._id, coverLetter: req.body.coverLetter });
    await job.save();
    // Award points
    await awardPoints(req.user._id, 20, 'Job application');
    // Notify poster
    await Notification.create({
      user: job.postedBy, type: 'job_application', title: 'New Application',
      message: `${req.user.name} applied for "${job.title}"`,
      fromUser: req.user._id, link: `/jobs/${job._id}`
    });
    res.json({ success: true, message: 'Applied successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Save/unsave job
// @route  POST /api/jobs/:id/save
const saveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    const isSaved = job.savedBy.includes(req.user._id);
    if (isSaved) job.savedBy = job.savedBy.filter(id => id.toString() !== req.user._id.toString());
    else job.savedBy.push(req.user._id);
    await job.save();
    res.json({ success: true, saved: !isSaved });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get saved jobs
// @route  GET /api/jobs/saved
const getSavedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ savedBy: req.user._id, isActive: true }).populate('postedBy', 'name avatar company');
    res.json({ success: true, jobs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get my jobs (poster)
// @route  GET /api/jobs/my-jobs
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort('-createdAt');
    res.json({ success: true, jobs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get user's applications
// @route  GET /api/jobs/my-applications
const getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ 'applicants.user': req.user._id }).populate('postedBy', 'name avatar company');
    const applications = jobs.map(job => {
      const app = job.applicants.find(a => a.user.toString() === req.user._id.toString());
      return { job: { _id: job._id, title: job.title, company: job.company, location: job.location, salary: job.salary }, status: app.status, appliedAt: app.appliedAt };
    });
    res.json({ success: true, applications });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Calculate job match score
// @route  GET /api/jobs/:id/match
const getMatchScore = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    const userSkills = req.user.skills.map(s => s.toLowerCase());
    const jobSkills = job.skills.map(s => s.toLowerCase());
    if (jobSkills.length === 0) return res.json({ success: true, score: 50 });
    const matched = userSkills.filter(s => jobSkills.some(j => j.includes(s) || s.includes(j)));
    const score = Math.round((matched.length / jobSkills.length) * 100);
    res.json({ success: true, score, matched, missing: jobSkills.filter(j => !userSkills.some(s => s.includes(j) || j.includes(s))) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob, applyJob, saveJob, getSavedJobs, getMyJobs, getMyApplications, getMatchScore };

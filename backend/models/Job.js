const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'], default: 'full-time' },
  salary: { type: String, default: '' },
  salaryMin: { type: Number },
  salaryMax: { type: Number },
  skills: [{ type: String }],
  experience: { type: String, default: '0-2 years' },
  openings: { type: Number, default: 1 },
  deadline: { type: Date },
  aboutCompany: { type: String, default: '' },
  companyLogo: { type: String, default: '' },

  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'], default: 'pending' },
    resume: { type: String },
    coverLetter: { type: String }
  }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);

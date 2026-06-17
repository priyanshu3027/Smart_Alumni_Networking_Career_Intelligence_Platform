const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },

  // Student-specific
  institution: { type: String, default: '' },
  course: { type: String, default: '' },
  graduationYear: { type: Number },
  education: [{
    degree: String, institution: String, year: String, grade: String
  }],

  // Alumni-specific
  company: { type: String, default: '' },
  designation: { type: String, default: '' },
  experience: [{
    title: String, company: String, from: String, to: String, description: String
  }],
  isVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'none'], default: 'none' },
  verificationDoc: { type: String, default: '' },

  // Common
  skills: [{ type: String }],
  endorsements: [{
    skill: String,
    endorsedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  projects: [{
    title: String, description: String, link: String, github: String, tech: [String]
  }],
  resume: { type: String, default: '' },
  resumePublicId: { type: String, default: '' },

  // Connections
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Gamification
  points: { type: Number, default: 0 },
  badges: [{ type: String }],
  level: { type: String, default: 'Beginner' },

  // Analytics
  profileViews: { type: Number, default: 0 },
  profileViewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // 2FA
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: '' },

  // Notifications
  emailNotifications: { type: Boolean, default: true },

  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.index({ name: 'text', skills: 'text', bio: 'text' });

module.exports = mongoose.model('User', userSchema);

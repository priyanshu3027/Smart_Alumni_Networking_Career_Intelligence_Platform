const User = require('../models/User');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');

// @desc   Get user profile by ID
// @route  GET /api/users/:id
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -twoFactorSecret')
      .populate('connections', 'name avatar role company institution');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Track profile view
    if (req.user && req.user._id.toString() !== req.params.id) {
      if (!user.profileViewers.includes(req.user._id)) {
        user.profileViewers.push(req.user._id);
      }
      user.profileViews += 1;
      await user.save({ validateBeforeSave: false });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update profile
// @route  PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'phone', 'location', 'website', 'skills', 'education',
      'experience', 'institution', 'course', 'graduationYear', 'company', 'designation', 'projects'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
      .select('-password -twoFactorSecret');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Upload avatar
// @route  POST /api/users/upload-avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true }).select('-password');
    res.json({ success: true, avatar: avatarUrl, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Upload resume
// @route  POST /api/users/upload-resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { resume: resumeUrl }, { new: true }).select('-password');
    // Award points
    await awardPoints(req.user._id, 10, 'Uploaded resume');
    res.json({ success: true, resume: resumeUrl, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Search users
// @route  GET /api/users/search
const searchUsers = async (req, res) => {
  try {
    const { q, role, skills, location, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };
    if (role) filter.role = role;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillArr.map(s => new RegExp(s, 'i')) };
    }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } },
        { institution: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } }
      ];
    }
    const users = await User.find(filter)
      .select('name avatar role bio skills location company institution designation')
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Endorse a skill
// @route  POST /api/users/:id/endorse
const endorseSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'Cannot endorse your own skill' });
    }
    const existingIdx = targetUser.endorsements.findIndex(e => e.skill === skill);
    if (existingIdx > -1) {
      const alreadyEndorsed = targetUser.endorsements[existingIdx].endorsedBy.includes(req.user._id);
      if (alreadyEndorsed) {
        targetUser.endorsements[existingIdx].endorsedBy = targetUser.endorsements[existingIdx].endorsedBy.filter(
          id => id.toString() !== req.user._id.toString()
        );
      } else {
        targetUser.endorsements[existingIdx].endorsedBy.push(req.user._id);
      }
    } else {
      targetUser.endorsements.push({ skill, endorsedBy: [req.user._id] });
    }
    await targetUser.save();
    // Notify
    await Notification.create({
      user: targetUser._id, type: 'endorsement', title: 'Skill Endorsed',
      message: `${req.user.name} endorsed your skill: ${skill}`, fromUser: req.user._id
    });
    res.json({ success: true, endorsements: targetUser.endorsements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get all users (admin)
// @route  GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const users = await User.find(filter).select('-password -twoFactorSecret')
      .skip((page - 1) * limit).limit(Number(limit)).sort('-createdAt');
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get suggested users based on shared skills/connections
// @route  GET /api/users/suggestions
const getSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const Connection = require('../models/Connection');
    const myConnections = await Connection.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: { $in: ['accepted', 'pending'] }
    });
    const excludeIds = [req.user._id, ...myConnections.map(c =>
      c.sender.toString() === req.user._id.toString() ? c.receiver : c.sender
    )];

    const suggestions = await User.find({
      _id: { $nin: excludeIds },
      isActive: true,
      skills: user.skills.length > 0 ? { $in: user.skills.map(s => new RegExp(s, 'i')) } : { $exists: true }
    }).select('name avatar role bio skills company institution designation location')
      .limit(10);
    res.json({ success: true, suggestions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper: award points
const awardPoints = async (userId, points, reason) => {
  try {
    const user = await User.findById(userId);
    user.points = (user.points || 0) + points;
    // Badge logic
    if (user.points >= 100 && !user.badges.includes('Active Member')) user.badges.push('Active Member');
    if (user.points >= 250 && !user.badges.includes('Rising Star')) user.badges.push('Rising Star');
    if (user.points >= 500 && !user.badges.includes('Top Contributor')) user.badges.push('Top Contributor');
    await user.save({ validateBeforeSave: false });
  } catch (err) { console.error('Award points error:', err); }
};

module.exports = { getUserProfile, updateProfile, uploadAvatar, uploadResume, searchUsers, endorseSkill, getAllUsers, getSuggestions, awardPoints };

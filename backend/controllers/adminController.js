const User = require('../models/User');
const Job = require('../models/Job');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');

// @desc   Get dashboard stats (admin)
const getAdminStats = async (req, res) => {
  try {
    const [users, jobs, events, alumni, students] = await Promise.all([
      User.countDocuments(), Job.countDocuments(), Event.countDocuments(),
      User.countDocuments({ role: 'alumni' }), User.countDocuments({ role: 'student' })
    ]);
    const pendingVerifications = await User.countDocuments({ role: 'alumni', verificationStatus: 'pending' });
    res.json({ success: true, stats: { users, jobs, events, alumni, students, pendingVerifications } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get pending alumni verifications
const getPendingVerifications = async (req, res) => {
  try {
    const alumni = await User.find({ role: 'alumni', verificationStatus: 'pending' }).select('-password');
    res.json({ success: true, alumni });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Approve or reject alumni verification
const verifyAlumni = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const user = await User.findByIdAndUpdate(req.params.id, {
      verificationStatus: status,
      isVerified: status === 'approved'
    }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await Notification.create({
      user: user._id, type: 'general', title: `Verification ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: status === 'approved' ? 'Congratulations! Your alumni profile is now verified. You can post jobs and events.' : 'Your verification request was rejected. Please contact admin for more info.'
    });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Toggle user active status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Delete any job (admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Job deleted by admin' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAdminStats, getPendingVerifications, verifyAlumni, toggleUserStatus, deleteJob };

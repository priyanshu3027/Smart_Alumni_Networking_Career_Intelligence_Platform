const User = require('../models/User');

// @desc   Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { role, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (role) filter.role = role;
    const users = await User.find(filter)
      .select('name avatar role points badges level institution company')
      .sort('-points').limit(Number(limit));
    res.json({ success: true, leaderboard: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get user gamification stats
const getMyStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('points badges level name avatar');
    const rank = await User.countDocuments({ points: { $gt: user.points }, isActive: true }) + 1;
    const nextBadgeThresholds = { 'Active Member': 100, 'Rising Star': 250, 'Top Contributor': 500, 'Elite Networker': 1000 };
    const nextBadge = Object.entries(nextBadgeThresholds).find(([badge, pts]) => !user.badges.includes(badge) && pts > user.points);
    res.json({ success: true, stats: { points: user.points, badges: user.badges, level: user.level, rank, nextBadge: nextBadge ? { name: nextBadge[0], required: nextBadge[1], remaining: nextBadge[1] - user.points } : null } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getLeaderboard, getMyStats };

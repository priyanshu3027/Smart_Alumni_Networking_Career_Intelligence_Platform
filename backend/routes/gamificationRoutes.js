const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLeaderboard, getMyStats } = require('../controllers/gamificationController');

router.get('/leaderboard', getLeaderboard);
router.get('/my-stats', protect, getMyStats);

module.exports = router;

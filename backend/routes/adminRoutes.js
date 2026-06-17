const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAdminStats, getPendingVerifications, verifyAlumni, toggleUserStatus, deleteJob } = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/stats', getAdminStats);
router.get('/verifications', getPendingVerifications);
router.put('/verify/:id', verifyAlumni);
router.put('/users/:id/toggle', toggleUserStatus);
router.delete('/jobs/:id', deleteJob);

module.exports = router;

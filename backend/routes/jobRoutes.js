const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getJobs, getJob, createJob, updateJob, deleteJob, applyJob, saveJob, getSavedJobs, getMyJobs, getMyApplications, getMatchScore } = require('../controllers/jobController');

router.get('/saved', protect, getSavedJobs);
router.get('/my-jobs', protect, getMyJobs);
router.get('/my-applications', protect, getMyApplications);
router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/', protect, authorize('alumni', 'admin'), createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.post('/:id/apply', protect, applyJob);
router.post('/:id/save', protect, saveJob);
router.get('/:id/match', protect, getMatchScore);

module.exports = router;

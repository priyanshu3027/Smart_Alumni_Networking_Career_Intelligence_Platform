const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getUserProfile, updateProfile, uploadAvatar, uploadResume, searchUsers, endorseSkill, getAllUsers, getSuggestions } = require('../controllers/userController');

router.get('/search', protect, searchUsers);
router.get('/suggestions', protect, getSuggestions);
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', optionalAuth, getUserProfile);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);
router.post('/:id/endorse', protect, endorseSkill);

module.exports = router;

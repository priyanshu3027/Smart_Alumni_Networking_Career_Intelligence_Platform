const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');

router.get('/', optionalAuth, getAnnouncements);
router.post('/', protect, authorize('admin', 'alumni'), createAnnouncement);
router.delete('/:id', protect, authorize('admin'), deleteAnnouncement);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, enrollEvent, getMyEvents } = require('../controllers/eventController');

router.get('/my-events', protect, getMyEvents);
router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEvent);
router.post('/', protect, authorize('alumni', 'admin'), createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/enroll', protect, enrollEvent);

module.exports = router;

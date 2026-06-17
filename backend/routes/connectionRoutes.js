const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendRequest, respondRequest, getConnections, getPendingRequests, getSentRequests, removeConnection, getConnectionStatus } = require('../controllers/connectionController');

router.post('/send', protect, sendRequest);
router.put('/:id/respond', protect, respondRequest);
router.get('/my', protect, getConnections);
router.get('/pending', protect, getPendingRequests);
router.get('/sent', protect, getSentRequests);
router.delete('/:userId/remove', protect, removeConnection);
router.get('/status/:userId', protect, getConnectionStatus);

module.exports = router;

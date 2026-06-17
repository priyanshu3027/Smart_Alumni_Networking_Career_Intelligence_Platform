const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConversation, getMessages, sendMessage, getConversations, getUnreadCount } = require('../controllers/chatController');

router.get('/conversations', protect, getConversations);
router.get('/unread', protect, getUnreadCount);
router.get('/conversation/:userId', protect, getConversation);
router.get('/messages/:userId', protect, getMessages);
router.post('/send', protect, sendMessage);

module.exports = router;

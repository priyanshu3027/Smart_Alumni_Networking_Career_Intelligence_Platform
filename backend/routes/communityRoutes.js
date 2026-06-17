const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { getGroups, createGroup, joinGroup, getPosts, createPost, likePost, addComment } = require('../controllers/communityController');

router.get('/groups', optionalAuth, getGroups);
router.post('/groups', protect, createGroup);
router.post('/groups/:id/join', protect, joinGroup);
router.get('/posts', optionalAuth, getPosts);
router.post('/posts', protect, createPost);
router.post('/posts/:id/like', protect, likePost);
router.post('/posts/:id/comment', protect, addComment);

module.exports = router;

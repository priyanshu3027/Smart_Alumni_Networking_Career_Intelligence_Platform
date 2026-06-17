const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createPost,
  getFeed,
  likePost,
  addComment,
  deletePost
} = require('../controllers/postController');

router.route('/')
  .post(protect, upload.single('postImage'), createPost)
  .get(protect, getFeed);

router.route('/:id/like').put(protect, likePost);
router.route('/:id/comments').post(protect, addComment);
router.route('/:id').delete(protect, deletePost);

module.exports = router;

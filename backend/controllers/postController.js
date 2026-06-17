const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const fs = require('fs');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { content, visibility } = req.body;
    
    if (!content) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const postFields = {
      author: req.user._id,
      content,
      visibility: visibility || 'public'
    };

    if (req.file) {
      postFields.image = `/uploads/posts/${req.file.filename}`;
    }

    const post = await Post.create(postFields);
    await post.populate('author', 'name avatar role headline company institution');

    res.status(201).json({ success: true, post });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(error);
  }
};

// @desc    Get feed (all posts)
// @route   GET /api/posts
// @access  Private
exports.getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'name avatar role headline company institution')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name avatar headline' }
      })
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await Post.countDocuments();

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like or Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like
      post.likes.push(req.user._id);

      // Create notification if liking someone else's post
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: post.author,
          type: 'like',
          title: 'New Like',
          message: `${req.user.name} liked your post.`,
          relatedId: post._id,
          onModel: 'Post'
        });
      }
    }

    await post.save();
    
    res.status(200).json({ success: true, likes: post.likes });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      author: req.user._id,
      post: post._id,
      content
    });

    post.comments.push(comment._id);
    await post.save();

    await comment.populate('author', 'name avatar headline');

    // Create notification
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: post.author,
        type: 'comment',
        title: 'New Comment',
        message: `${req.user.name} commented on your post.`,
        relatedId: post._id,
        onModel: 'Post'
      });
    }

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this post' });
    }

    // Remove associated image
    if (post.image) {
      const imgPath = `.${post.image}`;
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

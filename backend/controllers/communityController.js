const { Group, Post } = require('../models/Group');
const Notification = require('../models/Notification');

// Groups
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ isActive: true }).populate('createdBy', 'name avatar').sort('-createdAt');
    res.json({ success: true, groups });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createGroup = async (req, res) => {
  try {
    const group = await Group.create({ ...req.body, createdBy: req.user._id, members: [req.user._id], moderators: [req.user._id] });
    res.status(201).json({ success: true, group });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const isMember = group.members.includes(req.user._id);
    if (isMember) group.members = group.members.filter(id => id.toString() !== req.user._id.toString());
    else group.members.push(req.user._id);
    await group.save();
    res.json({ success: true, joined: !isMember, memberCount: group.members.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Posts/Q&A
const getPosts = async (req, res) => {
  try {
    const { groupId, type } = req.query;
    const filter = {};
    if (groupId) filter.group = groupId;
    if (type) filter.type = type;
    const posts = await Post.find(filter).populate('author', 'name avatar role').sort('-createdAt').limit(30);
    res.json({ success: true, posts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createPost = async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, author: req.user._id });
    const populated = await post.populate('author', 'name avatar role');
    res.status(201).json({ success: true, post: populated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ success: true, liked: !liked, likesCount: post.likes.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ author: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('comments.author', 'name avatar');
    res.json({ success: true, comments: post.comments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getGroups, createGroup, joinGroup, getPosts, createPost, likePost, addComment };

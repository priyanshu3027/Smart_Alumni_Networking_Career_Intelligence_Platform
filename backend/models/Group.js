const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  type: { type: String, enum: ['post', 'question', 'answer', 'announcement'], default: 'post' },
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  isAccepted: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
}, { timestamps: true });

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  avatar: { type: String, default: '' },
  banner: { type: String, default: '' },
  type: { type: String, enum: ['public', 'private'], default: 'public' },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);
const Post = mongoose.model('GroupPost', postSchema);

module.exports = { Group, Post };

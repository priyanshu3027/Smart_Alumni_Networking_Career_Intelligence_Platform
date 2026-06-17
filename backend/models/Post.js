const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  visibility: { type: String, enum: ['public', 'connections'], default: 'public' }
}, { timestamps: true });

postSchema.index({ content: 'text' });

module.exports = mongoose.model('Post', postSchema);

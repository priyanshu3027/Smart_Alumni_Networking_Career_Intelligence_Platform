const { Message, Conversation } = require('../models/Message');
const User = require('../models/User');

// Helper: generate conversation ID from two user IDs
const getConversationId = (id1, id2) => [id1, id2].sort().join('_');

// @desc   Get or create conversation
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const convId = getConversationId(req.user._id.toString(), userId);
    let conversation = await Conversation.findOne({ participants: { $all: [req.user._id, userId] } });
    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, userId] });
    }
    res.json({ success: true, conversationId: convId, conversation });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get messages in a conversation
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const convId = getConversationId(req.user._id.toString(), userId);
    const { page = 1, limit = 30 } = req.query;
    const messages = await Message.find({ conversationId: convId })
      .populate('sender', 'name avatar').populate('receiver', 'name avatar')
      .sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    // Mark as read
    await Message.updateMany({ conversationId: convId, receiver: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, messages: messages.reverse() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Send message (REST fallback / persistence)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const convId = getConversationId(req.user._id.toString(), receiverId);
    const message = await Message.create({
      conversationId: convId, sender: req.user._id,
      receiver: receiverId, content
    });
    // Update conversation last message
    await Conversation.findOneAndUpdate(
      { participants: { $all: [req.user._id, receiverId] } },
      { lastMessage: message._id, lastMessageAt: new Date() },
      { upsert: true }
    );
    const populated = await message.populate('sender', 'name avatar');
    res.status(201).json({ success: true, message: populated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get all conversations for user
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar role lastSeen')
      .populate({ path: 'lastMessage', select: 'content createdAt isRead sender' })
      .sort('-lastMessageAt');
    res.json({ success: true, conversations });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.json({ success: true, count });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getConversation, getMessages, sendMessage, getConversations, getUnreadCount };

const Connection = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { awardPoints } = require('./userController');

// @desc   Send connection request
const sendRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
    }
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: 'User not found' });

    const existing = await Connection.findOne({
      $or: [{ sender: req.user._id, receiver: receiverId }, { sender: receiverId, receiver: req.user._id }]
    });
    if (existing) return res.status(400).json({ success: false, message: 'Connection already exists' });

    const connection = await Connection.create({ sender: req.user._id, receiver: receiverId, message });
    await Notification.create({
      user: receiverId, type: 'connection_request', title: 'Connection Request',
      message: `${req.user.name} sent you a connection request`, fromUser: req.user._id
    });
    res.status(201).json({ success: true, connection });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Respond to connection request (accept/reject)
const respondRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ success: false, message: 'Connection not found' });
    if (connection.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    connection.status = status;
    await connection.save();

    if (status === 'accepted') {
      // Add to both users' connections list
      await User.findByIdAndUpdate(connection.sender, { $addToSet: { connections: connection.receiver } });
      await User.findByIdAndUpdate(connection.receiver, { $addToSet: { connections: connection.sender } });
      // Award points to both
      await awardPoints(connection.sender, 25, 'Connection made');
      await awardPoints(connection.receiver, 25, 'Connection made');
      // Notify sender
      await Notification.create({
        user: connection.sender, type: 'connection_accepted', title: 'Connection Accepted',
        message: `${req.user.name} accepted your connection request`, fromUser: req.user._id
      });
    }
    res.json({ success: true, connection });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get my connections
const getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('connections', 'name avatar role bio company institution designation skills');
    res.json({ success: true, connections: user.connections });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get pending requests (received)
const getPendingRequests = async (req, res) => {
  try {
    const requests = await Connection.find({ receiver: req.user._id, status: 'pending' })
      .populate('sender', 'name avatar role company institution bio skills');
    res.json({ success: true, requests });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get sent pending requests
const getSentRequests = async (req, res) => {
  try {
    const requests = await Connection.find({ sender: req.user._id, status: 'pending' })
      .populate('receiver', 'name avatar role company institution bio');
    res.json({ success: true, requests });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Remove connection
const removeConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    await Connection.deleteOne({
      $or: [{ sender: req.user._id, receiver: userId }, { sender: userId, receiver: req.user._id }]
    });
    await User.findByIdAndUpdate(req.user._id, { $pull: { connections: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { connections: req.user._id } });
    res.json({ success: true, message: 'Connection removed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Check connection status with a user
const getConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await Connection.findOne({
      $or: [{ sender: req.user._id, receiver: userId }, { sender: userId, receiver: req.user._id }]
    });
    if (!connection) return res.json({ success: true, status: 'none' });
    res.json({ success: true, status: connection.status, connectionId: connection._id, isReceiver: connection.receiver.toString() === req.user._id.toString() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { sendRequest, respondRequest, getConnections, getPendingRequests, getSentRequests, removeConnection, getConnectionStatus };

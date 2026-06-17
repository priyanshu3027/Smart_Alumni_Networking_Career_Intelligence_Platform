const Notification = require('../models/Notification');

// @desc   Get notifications for user
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ user: req.user._id })
      .populate('fromUser', 'name avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit).limit(Number(limit));
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, notifications, unread });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Mark notification as read
const markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Mark all notifications as read
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Delete notification
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };

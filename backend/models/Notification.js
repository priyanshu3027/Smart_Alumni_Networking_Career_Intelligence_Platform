const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['connection_request', 'connection_accepted', 'job_alert', 'event_reminder', 'job_application', 'message', 'endorsement', 'announcement', 'badge_earned', 'general'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

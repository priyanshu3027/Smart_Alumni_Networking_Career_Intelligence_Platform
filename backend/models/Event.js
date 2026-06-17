const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['conference', 'webinar', 'workshop', 'placement-talk', 'meetup', 'other'], default: 'webinar' },
  date: { type: Date, required: true },
  endDate: { type: Date },
  time: { type: String, default: '' },
  venue: { type: String, default: 'Online' },
  link: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  tags: [{ type: String }],
  maxAttendees: { type: Number, default: 100 },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  reminders: [{ user: mongoose.Schema.Types.ObjectId, sentAt: Date }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

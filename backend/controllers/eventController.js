const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { awardPoints } = require('./userController');

// @desc   Get all events
const getEvents = async (req, res) => {
  try {
    const { type, q, upcoming, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (q) filter.$or = [{ title: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }];
    if (upcoming === 'true') filter.date = { $gte: new Date() };
    const events = await Event.find(filter).populate('createdBy', 'name avatar company')
      .sort('date').skip((page - 1) * limit).limit(Number(limit));
    const total = await Event.countDocuments(filter);
    res.json({ success: true, events, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get single event
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name avatar company designation')
      .populate('attendees', 'name avatar role');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Create event
const createEvent = async (req, res) => {
  try {
    if (req.user.role === 'alumni' && !req.user.isVerified) {
      return res.status(403).json({ success: false, message: 'Only verified alumni can create events' });
    }
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, event });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Update event
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, event });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Enroll/unenroll in event
const enrollEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const isEnrolled = event.attendees.includes(req.user._id);
    if (isEnrolled) {
      event.attendees = event.attendees.filter(id => id.toString() !== req.user._id.toString());
    } else {
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        return res.status(400).json({ success: false, message: 'Event is full' });
      }
      event.attendees.push(req.user._id);
      await awardPoints(req.user._id, 15, 'Event enrollment');
      await Notification.create({
        user: event.createdBy, type: 'general', title: 'New Attendee',
        message: `${req.user.name} enrolled in "${event.title}"`, fromUser: req.user._id
      });
    }
    await event.save();
    res.json({ success: true, enrolled: !isEnrolled, attendeeCount: event.attendees.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc   Get my enrolled events
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user._id }).populate('createdBy', 'name avatar');
    res.json({ success: true, events });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, enrollEvent, getMyEvents };

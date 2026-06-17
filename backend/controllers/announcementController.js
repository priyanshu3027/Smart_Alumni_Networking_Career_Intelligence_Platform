const Announcement = require('../models/Announcement');

const getAnnouncements = async (req, res) => {
  try {
    const filter = { $or: [{ targetRole: 'all' }, { targetRole: req.user?.role }] };
    const announcements = await Announcement.find(filter).populate('createdBy', 'name avatar').sort('-createdAt').limit(20);
    res.json({ success: true, announcements });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, announcement: ann });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };

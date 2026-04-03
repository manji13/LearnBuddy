const Announcement = require('../../Model/Announcement/Announcement');
const User = require('../../Model/User Management/UserModel'); // adjust path to your existing User model
const { sendAnnouncementEmail } = require('./Emailservice');





const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
 
    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements',
      error: error.message,
    });
  }
};
 
// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public (all logged in users)
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
 
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }
 
    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcement',
      error: error.message,
    });
  }
};
 
// @desc    Create announcement + notify all users via email
// @route   POST /api/announcements
// @access  Admin only
const createAnnouncement = async (req, res) => {
  try {
    const { topic, description } = req.body;
 
    if (!topic || !description) {
      return res.status(400).json({
        success: false,
        message: 'Topic and description are required',
      });
    }
 
    // Save announcement — no createdBy needed
    const announcement = await Announcement.create({ topic, description });
 
    // Send email to all users (non-blocking)
    User.find({}, 'email').lean().then((users) => {
      const emails = users.map((u) => u.email).filter(Boolean);
      sendAnnouncementEmail(emails, topic, description, announcement.createdAt)
        .then(() => console.log(`Notified ${emails.length} user(s) about: "${topic}"`))
        .catch((err) => console.error('Email notification failed:', err.message));
    });
 
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully. Users will be notified by email.',
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating announcement',
      error: error.message,
    });
  }
};
 
// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Admin only
const updateAnnouncement = async (req, res) => {
  try {
    const { topic, description } = req.body;
 
    if (!topic && !description) {
      return res.status(400).json({
        success: false,
        message: 'Topic or description is required to update',
      });
    }
 
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      {
        ...(topic && { topic }),
        ...(description && { description }),
      },
      { new: true, runValidators: true }
    );
 
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }
 
    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating announcement',
      error: error.message,
    });
  }
};
 
// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Admin only
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
 
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }
 
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting announcement',
      error: error.message,
    });
  }
};
 
module.exports = {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
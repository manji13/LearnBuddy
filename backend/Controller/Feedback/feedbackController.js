const Feedback = require('../../models/Feedback/FeedbackModel');
const Note = require('../../models/notes/noteModel');
const PastPaper = require('../../models/pastPaper/pastPaperModel');

// POST /api/feedback
exports.createFeedback = async (req, res) => {
  try {
    const { resourceType, resourceId, rating, comment, name } = req.body;

    if (!resourceType || !['note', 'pastpaper'].includes(resourceType)) {
      return res.status(400).json({ success: false, message: 'Invalid resource type' });
    }
    if (!resourceId) {
      return res.status(400).json({ success: false, message: 'resourceId is required' });
    }
    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Ensure referenced resource exists
    if (resourceType === 'note') {
      const note = await Note.findById(resourceId);
      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }
    } else {
      const paper = await PastPaper.findById(resourceId);
      if (!paper) {
        return res.status(404).json({ success: false, message: 'Past paper not found' });
      }
    }

    const feedback = await Feedback.create({
      resourceType,
      resourceId,
      rating: numericRating,
      comment: comment || '',
      name: name || '',
      status: 'approved',
    });

    return res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    console.error('Error creating feedback:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
};

// GET /api/feedback
// Query: resourceType, resourceId, status (optional, default approved)
exports.getFeedback = async (req, res) => {
  try {
    const { resourceType, resourceId, status } = req.query;
    const filter = {};

    if (resourceType) {
      filter.resourceType = resourceType;
    }
    if (resourceId) {
      filter.resourceId = resourceId;
    }
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'approved';
    }

    const items = await Feedback.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    console.error('Error fetching feedback:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
  }
};

// GET /api/feedback/admin
// Optional query: status
exports.getAllForAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const items = await Feedback.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    console.error('Error fetching admin feedback:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
  }
};

// PATCH /api/feedback/:id/approve
exports.approveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Feedback.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('Error approving feedback:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve feedback' });
  }
};

// DELETE /api/feedback/:id
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Feedback.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    return res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete feedback' });
  }
};

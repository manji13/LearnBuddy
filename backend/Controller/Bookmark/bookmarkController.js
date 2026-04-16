const Bookmark = require('../../models/Bookmark/BookmarkModel');
const Note = require('../../models/notes/noteModel');
const PastPaper = require('../../models/pastPaper/pastPaperModel');

// POST /api/bookmarks
// Body: { userId, resourceType: 'note' | 'pastpaper', resourceId }
exports.createBookmark = async (req, res) => {
  try {
    const { userId, resourceType, resourceId } = req.body;

    if (!userId || !resourceType || !resourceId) {
      return res.status(400).json({ success: false, message: 'userId, resourceType and resourceId are required' });
    }

    if (!['note', 'pastpaper'].includes(resourceType)) {
      return res.status(400).json({ success: false, message: 'Invalid resource type' });
    }

    // Ensure referenced resource exists
    if (resourceType === 'note') {
      const exists = await Note.exists({ _id: resourceId });
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }
    } else {
      const exists = await PastPaper.exists({ _id: resourceId });
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Past paper not found' });
      }
    }

    const bookmark = await Bookmark.findOneAndUpdate(
      { user: userId, resourceType, resourceId },
      { user: userId, resourceType, resourceId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ success: true, data: bookmark });
  } catch (err) {
    console.error('Error creating bookmark:', err);
    return res.status(500).json({ success: false, message: 'Failed to save bookmark' });
  }
};

// DELETE /api/bookmarks/:id
exports.deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Bookmark.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }
    return res.status(200).json({ success: true, message: 'Bookmark removed' });
  } catch (err) {
    console.error('Error deleting bookmark:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove bookmark' });
  }
};

// GET /api/bookmarks
// Query: userId, resourceType (optional)
exports.getBookmarks = async (req, res) => {
  try {
    const { userId, resourceType } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const filter = { user: userId };
    if (resourceType && ['note', 'pastpaper'].includes(resourceType)) {
      filter.resourceType = resourceType;
    }

    const bookmarks = await Bookmark.find(filter).lean();
    return res.json({ success: true, data: bookmarks });
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    return res.status(500).json({ success: false, message: 'Failed to load bookmarks' });
  }
};

// GET /api/bookmarks/user/:userId - populated resources for "My Saved Resources"
exports.getUserSavedResources = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const bookmarks = await Bookmark.find({ user: userId }).lean();

    const noteIds = bookmarks
      .filter((b) => b.resourceType === 'note')
      .map((b) => b.resourceId);
    const paperIds = bookmarks
      .filter((b) => b.resourceType === 'pastpaper')
      .map((b) => b.resourceId);

    const [notes, pastPapers] = await Promise.all([
      noteIds.length ? Note.find({ _id: { $in: noteIds } }).lean() : [],
      paperIds.length ? PastPaper.find({ _id: { $in: paperIds } }).lean() : [],
    ]);

    return res.json({
      success: true,
      data: {
        notes,
        pastPapers,
      },
    });
  } catch (err) {
    console.error('Error fetching user saved resources:', err);
    return res.status(500).json({ success: false, message: 'Failed to load saved resources' });
  }
};

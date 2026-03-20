const fs = require('fs');
const path = require('path');
const multer = require('multer');

const Note = require('../../models/notes/noteModel');

// Ensure uploads/notes directory exists
const notesUploadDir = path.join(__dirname, '..', '..', 'uploads', 'notes');
if (!fs.existsSync(notesUploadDir)) {
  fs.mkdirSync(notesUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, notesUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

exports.upload = upload;

// POST handler after multer
exports.uploadNote = async (req, res) => {
  try {
    const { title, moduleName, topic, uploadedBy } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required' });
    }

    if (!title || !moduleName) {
      return res.status(400).json({ success: false, message: 'Title and Module Name are required' });
    }

    const relativePath = path
      .join('uploads', 'notes', req.file.filename)
      .replace(/\\/g, '/');

    const note = await Note.create({
      title,
      moduleName,
      topic: topic || '',
      uploadedBy: uploadedBy || '',
      fileUrl: relativePath,
    });

    return res.status(201).json({ success: true, data: note });
  } catch (err) {
    console.error('Error uploading note:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload note' });
  }
};

// GET /api/notes
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: notes });
  } catch (err) {
    console.error('Error fetching notes:', err);
    return res.status(500).json({ success: false, message: 'Failed to load notes' });
  }
};

// GET /api/notes/search
exports.searchNotes = async (req, res) => {
  try {
    const { moduleName, topic } = req.query;

    const filter = {};
    if (moduleName) {
      filter.moduleName = { $regex: moduleName, $options: 'i' };
    }
    if (topic) {
      filter.topic = { $regex: topic, $options: 'i' };
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: notes });
  } catch (err) {
    console.error('Error searching notes:', err);
    return res.status(500).json({ success: false, message: 'Failed to search notes' });
  }
};

// GET /api/notes/download/:id
exports.downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const filePath = path.join(__dirname, '..', '..', note.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    return res.download(filePath, path.basename(filePath));
  } catch (err) {
    console.error('Error downloading note:', err);
    return res.status(500).json({ success: false, message: 'Failed to download note' });
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const filePath = path.join(__dirname, '..', '..', note.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    await Note.deleteOne({ _id: note._id });
    return res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete note' });
  }
};

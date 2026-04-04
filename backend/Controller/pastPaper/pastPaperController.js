const path = require('path');
const fs = require('fs');
const multer = require('multer');
const PastPaper = require('../../models/pastPaper/pastPaperModel');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${baseName}_${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// Controller functions
const uploadPastPaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required' });
    }

    const { title, moduleName, semester, year, uploadedBy } = req.body;

    if (!title || !moduleName || !semester || !year) {
      return res.status(400).json({
        success: false,
        message: 'title, moduleName, semester and year are required',
      });
    }

    const fileUrl = path.join('uploads', req.file.filename).replace(/\\/g, '/');

    const pastPaper = await PastPaper.create({
      title,
      moduleName,
      semester,
      year: Number(year),
      fileUrl,
      uploadedBy: uploadedBy || '',
    });

    return res.status(201).json({ success: true, data: pastPaper });
  } catch (error) {
    console.error('Error uploading past paper:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload past paper' });
  }
};

const getAllPastPapers = async (req, res) => {
  try {
    const pastPapers = await PastPaper.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: pastPapers });
  } catch (error) {
    console.error('Error fetching past papers:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch past papers' });
  }
};

const searchPastPapers = async (req, res) => {
  try {
    const { moduleName, semester, year } = req.query;

    const filter = {};

    if (moduleName) {
      filter.moduleName = { $regex: moduleName, $options: 'i' };
    }

    if (semester) {
      filter.semester = { $regex: semester, $options: 'i' };
    }

    if (year) {
      const parsedYear = Number(year);
      if (!Number.isNaN(parsedYear)) {
        filter.year = parsedYear;
      }
    }

    const pastPapers = await PastPaper.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: pastPapers });
  } catch (error) {
    console.error('Error searching past papers:', error);
    return res.status(500).json({ success: false, message: 'Failed to search past papers' });
  }
};

const downloadPastPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const pastPaper = await PastPaper.findById(id);

    if (!pastPaper) {
      return res.status(404).json({ success: false, message: 'Past paper not found' });
    }

    const filePath = path.join(__dirname, '..', '..', pastPaper.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    return res.download(filePath, path.basename(filePath));
  } catch (error) {
    console.error('Error downloading past paper:', error);
    return res.status(500).json({ success: false, message: 'Failed to download past paper' });
  }
};

const deletePastPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const pastPaper = await PastPaper.findByIdAndDelete(id);

    if (!pastPaper) {
      return res.status(404).json({ success: false, message: 'Past paper not found' });
    }

    const filePath = path.join(__dirname, '..', '..', pastPaper.fileUrl);

    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file from server:', err);
        }
      });
    }

    return res.status(200).json({ success: true, message: 'Past paper deleted successfully' });
  } catch (error) {
    console.error('Error deleting past paper:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete past paper' });
  }
};

module.exports = {
  upload,
  uploadPastPaper,
  getAllPastPapers,
  searchPastPapers,
  downloadPastPaper,
  deletePastPaper,
};

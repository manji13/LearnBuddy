const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  moduleName: {
    type: String,
    required: true,
    trim: true,
  },
  topic: {
    type: String,
    trim: true,
    default: '',
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Note', noteSchema);

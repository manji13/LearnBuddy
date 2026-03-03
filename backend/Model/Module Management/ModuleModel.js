const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Module name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Module code is required'],
    uppercase: true,
    trim: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required'],
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'Faculty is required'],
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: 1,
    max: 10,
  },
  description: {
    type: String,
    trim: true,
  },
  lecturer: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);

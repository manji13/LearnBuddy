const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Faculty name is required'],
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Faculty code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  dean: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);

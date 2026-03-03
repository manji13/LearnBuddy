const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Semester name is required'],
    trim: true,
  },
  number: {
    type: Number,
    required: [true, 'Semester number is required'],
    min: 1,
    max: 12,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'Faculty is required'],
  },
  academicYear: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Semester', semesterSchema);

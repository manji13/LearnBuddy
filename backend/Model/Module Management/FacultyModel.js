const mongoose = require('mongoose')

const facultySchema = new mongoose.Schema({
  name:        { type: String, required: [true, 'Faculty name is required'], trim: true },
  code:        { type: String, required: [true, 'Faculty code is required'], trim: true, unique: true, uppercase: true },
  description: { type: String, trim: true, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Faculty', facultySchema)

const mongoose = require('mongoose')

const semesterSchema = new mongoose.Schema({
  faculty:  { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: [true, 'Faculty is required'] },
  year:     { type: Number, required: [true, 'Year is required'], enum: { values: [1,2,3,4], message: 'Year must be 1-4' } },
  semester: { type: Number, required: [true, 'Semester is required'], enum: { values: [1,2], message: 'Semester must be 1 or 2' } },
}, { timestamps: true })

semesterSchema.index({ faculty: 1, year: 1, semester: 1 }, { unique: true })

module.exports = mongoose.model('Semester', semesterSchema)

const mongoose = require('mongoose')

const moduleSchema = new mongoose.Schema({
  faculty:      { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty',  required: [true, 'Faculty is required'] },
  semester:     { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: [true, 'Semester is required'] },
  moduleNumber: { type: String, required: [true, 'Module number is required'], trim: true },
  moduleName:   { type: String, required: [true, 'Module name is required'],   trim: true },
  description:  { type: String, trim: true, default: '' },
}, { timestamps: true })

moduleSchema.index({ semester: 1, moduleNumber: 1 }, { unique: true })

module.exports = mongoose.model('Module', moduleSchema)

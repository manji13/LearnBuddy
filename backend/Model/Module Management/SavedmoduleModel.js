const mongoose = require('mongoose')

const savedModuleSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  module:  { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  savedAt: { type: Date, default: Date.now },
}, { timestamps: true })

// one save per user per module
savedModuleSchema.index({ user: 1, module: 1 }, { unique: true })

module.exports = mongoose.model('SavedModule', savedModuleSchema)
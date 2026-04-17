const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reactionType: { type: String, enum: ['like', 'dislike'], default: 'like' }
}, { timestamps: true });

// A user can only like a resource once
likeSchema.index({ resourceId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);

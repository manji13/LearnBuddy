const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pastPaper: { type: mongoose.Schema.Types.ObjectId, ref: 'PastPaper', required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    answers: [{ type: Number, required: true }],
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizResult', quizResultSchema);

const QuizResult = require('../../models/pastPaper/quizResultModel');
const PastPaper = require('../../models/pastPaper/pastPaperModel');
const User = require('../../Model/User Management/UserModel');

// POST /api/pastpapers/quiz-results
exports.createQuizResult = async (req, res) => {
  try {
    const { userId, pastPaperId, difficulty, answers, score, totalQuestions } = req.body;

    if (!userId || !pastPaperId || !difficulty || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const trimmedDifficulty = String(difficulty).toLowerCase();
    if (!['easy', 'medium', 'hard'].includes(trimmedDifficulty)) {
      return res.status(400).json({ success: false, message: 'Invalid difficulty' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const pastPaper = await PastPaper.findById(pastPaperId);
    if (!pastPaper) {
      return res.status(404).json({ success: false, message: 'Past paper not found' });
    }

    const total = Number.isInteger(totalQuestions) ? totalQuestions : answers.length;

    const quizResult = await QuizResult.create({
      user: user._id,
      pastPaper: pastPaper._id,
      difficulty: trimmedDifficulty,
      answers,
      score: typeof score === 'number' ? score : 0,
      totalQuestions: total,
    });

    return res.status(201).json({ success: true, data: quizResult });
  } catch (err) {
    console.error('Error creating quiz result:', err);
    return res.status(500).json({ success: false, message: 'Failed to save quiz result' });
  }
};

// GET /api/pastpapers/quiz-results?userId=...
exports.getUserQuizResults = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const results = await QuizResult.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('pastPaper', 'title moduleName semester year')
      .lean();

    return res.json({ success: true, data: results });
  } catch (err) {
    console.error('Error fetching quiz results:', err);
    return res.status(500).json({ success: false, message: 'Failed to load quiz results' });
  }
};

// GET /api/pastpapers/weak-areas?userId=...&threshold=60
exports.getWeakAreas = async (req, res) => {
  try {
    const { userId } = req.query;
    const threshold = Number(req.query.threshold) || 60;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const results = await QuizResult.find({ user: userId })
      .populate('pastPaper', 'title moduleName semester year')
      .lean();

    const byModule = {};

    results.forEach((r) => {
      const paper = r.pastPaper;
      if (!paper || !paper.moduleName || !r.totalQuestions) return;

      const percent = (r.score / r.totalQuestions) * 100;
      if (percent >= threshold) return;

      const key = paper.moduleName;
      if (!byModule[key]) {
        byModule[key] = {
          moduleName: paper.moduleName,
          attempts: 0,
          lowAttempts: 0,
          percentSum: 0,
          papers: {},
        };
      }

      const bucket = byModule[key];
      bucket.attempts += 1;
      bucket.lowAttempts += 1;
      bucket.percentSum += percent;

      const pid = String(paper._id);
      if (!bucket.papers[pid]) {
        bucket.papers[pid] = {
          id: paper._id,
          title: paper.title,
          semester: paper.semester,
          year: paper.year,
          lowAttempts: 0,
        };
      }
      bucket.papers[pid].lowAttempts += 1;
    });

    const weakAreas = Object.values(byModule)
      .map((bucket) => {
        const avgPercent = bucket.lowAttempts ? bucket.percentSum / bucket.lowAttempts : 0;
        const suggestedPastPapers = Object.values(bucket.papers)
          .sort((a, b) => b.lowAttempts - a.lowAttempts)
          .slice(0, 3);

        return {
          moduleName: bucket.moduleName,
          attempts: bucket.attempts,
          lowAttempts: bucket.lowAttempts,
          avgWeakScore: Math.round(avgPercent),
          suggestedPastPapers,
        };
      })
      .sort((a, b) => b.lowAttempts - a.lowAttempts);

    return res.json({ success: true, data: weakAreas });
  } catch (err) {
    console.error('Error computing weak areas:', err);
    return res.status(500).json({ success: false, message: 'Failed to compute weak areas' });
  }
};

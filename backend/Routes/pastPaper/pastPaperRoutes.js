const express = require('express');
const pastPaperController = require('../../Controller/pastPaper/pastPaperController');
const qaController = require('../../Controller/pastPaper/qaController');
const quizResultController = require('../../Controller/pastPaper/quizResultController');
const examAnalysisController = require('../../Controller/pastPaper/examAnalysisController');

const router = express.Router();

// Helper to handle multer errors and then call controller
router.post('/upload', (req, res) => {
  pastPaperController.upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    return pastPaperController.uploadPastPaper(req, res);
  });
});

router.get('/', pastPaperController.getAllPastPapers);
router.get('/search', pastPaperController.searchPastPapers);
router.get('/download/:id', pastPaperController.downloadPastPaper);
router.delete('/:id', pastPaperController.deletePastPaper);

// AI QA generation
router.post('/generate-qa/:id', qaController.generateQAFromPDF);

// AI exam difficulty analysis
router.post('/analyse-exam/:id', examAnalysisController.analyseExamFromPDF);

// Quiz results (per student)
router.post('/quiz-results', quizResultController.createQuizResult);
router.get('/quiz-results', quizResultController.getUserQuizResults);

module.exports = router;

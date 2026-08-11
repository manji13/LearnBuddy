const express = require('express');
const pastPaperController = require('../../Controller/pastPaper/pastPaperController');
const qaController = require('../../Controller/pastPaper/qaController');
const quizResultController = require('../../Controller/pastPaper/quizResultController');
const examAnalysisController = require('../../Controller/pastPaper/examAnalysisController');

const router = express.Router();

// Helper to handle multer errors and then call controller (admin upload)
router.post('/upload', (req, res) => {
  pastPaperController.upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    return pastPaperController.uploadPastPaper(req, res);
  });
});

// Student upload endpoint: creates a pending past paper for approval
router.post('/upload-student', (req, res) => {
  pastPaperController.upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    return pastPaperController.uploadStudentPastPaper(req, res);
  });
});

// Specific routes (must come BEFORE generic :id routes)
router.get('/search', pastPaperController.searchPastPapers);
router.get('/download/:id', pastPaperController.downloadPastPaper);

// AI QA generation (before generic :id routes)
router.post('/generate-qa/:id', qaController.generateQAFromPDF);

// AI exam difficulty analysis (before generic :id routes)
router.post('/analyse-exam/:id', examAnalysisController.analyseExamFromPDF);

// Quiz results (specific routes)
router.post('/quiz-results', quizResultController.createQuizResult);
router.get('/quiz-results', quizResultController.getUserQuizResults);
router.get('/weak-areas', quizResultController.getWeakAreas);

// Approval for student-submitted past papers (after /quiz-results, before generic :id)
router.patch('/:id/approve', pastPaperController.approvePastPaper);

// Generic :id routes (must come LAST)
router.get('/', pastPaperController.getAllPastPapers);
router.delete('/:id', pastPaperController.deletePastPaper);

module.exports = router;

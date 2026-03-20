const express = require('express');
const noteController = require('../../Controller/notes/noteController');
const notesAiController = require('../../Controller/notes/notesAiController');

const router = express.Router();

// Upload lecture notes (PDF)
router.post('/upload', (req, res) => {
  noteController.upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    return noteController.uploadNote(req, res);
  });
});

router.get('/', noteController.getAllNotes);
router.get('/search', noteController.searchNotes);
router.get('/download/:id', noteController.downloadNote);
router.delete('/:id', noteController.deleteNote);

// AI endpoints
router.post('/:id/summarize', notesAiController.summarizeNote);
router.post('/:id/generate-questions', notesAiController.generateQuestionsFromNote);

module.exports = router;

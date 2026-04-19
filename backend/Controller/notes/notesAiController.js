const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PDFParse = require('pdf-parse').PDFParse;

const Note = require('../../models/notes/noteModel');

const PYTHON_QA_SERVICE_URL = process.env.PYTHON_QA_SERVICE_URL || 'http://localhost:8000';

async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  const textResult = await parser.getText();
  const text = (textResult && textResult.text ? textResult.text : '').trim();
  return text;
}

// POST /api/notes/:id/summarize
exports.summarizeNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const filePath = path.join(__dirname, '..', '..', note.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    const text = await extractTextFromPdf(filePath);
    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: 'Could not extract any text from the uploaded PDF' });
    }

    const response = await axios.post(`${PYTHON_QA_SERVICE_URL}/summarize-notes`, {
      text,
    });

    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('Error summarizing note:', err?.response?.data || err.message || err);
    const message = err.response?.data?.error || 'Failed to summarize note';
    return res.status(500).json({ success: false, message });
  }
};

// POST /api/notes/:id/generate-questions
exports.generateQuestionsFromNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const filePath = path.join(__dirname, '..', '..', note.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    const text = await extractTextFromPdf(filePath);
    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: 'Could not extract any text from the uploaded PDF' });
    }

    const response = await axios.post(`${PYTHON_QA_SERVICE_URL}/generate-qa`, {
      text,
      difficulty: (req.body.difficulty || 'medium').toLowerCase(),
    });

    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('Error generating questions from note:', err?.response?.data || err.message || err);
    const message = err.response?.data?.error || 'Failed to generate questions from note';
    return res.status(500).json({ success: false, message });
  }
};

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { PDFParse } = require('pdf-parse');

const PastPaper = require('../../models/pastPaper/pastPaperModel');

const PYTHON_EXAM_SERVICE_URL = process.env.PYTHON_EXAM_SERVICE_URL || 'http://localhost:8000/analyse-exam';

// POST /api/pastpapers/analyse-exam/:id
exports.analyseExamFromPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const pastPaper = await PastPaper.findById(id);
    if (!pastPaper) {
      return res.status(404).json({ success: false, message: 'Past paper not found' });
    }

    const filePath = path.join(__dirname, '..', '..', pastPaper.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const textResult = await parser.getText();
    const text = (textResult && textResult.text ? textResult.text : '').trim();

    if (!text) {
      return res.status(400).json({ success: false, message: 'No readable text found in PDF' });
    }

    const response = await axios.post(
      PYTHON_EXAM_SERVICE_URL,
      { text },
      { timeout: 60000 }
    );

    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error analysing exam from PDF:', error.response?.data || error.message || error);

    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.error || error.message || 'Failed to analyse exam from past paper';

    return res.status(statusCode).json({ success: false, message });
  }
};

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const NoteSchema = new mongoose.Schema({
  title: String,
  moduleName: String,
  topic: String,
  uploadedBy: String,
  fileUrl: String,
  status: { type: String, default: 'pending' },
  views: { type: Number, default: 0 }
}, { timestamps: true });

const Note = mongoose.model('Note', NoteSchema);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const notes = await Note.find({});
    const fallbackPdf = path.join(__dirname, 'uploads', 'notes', 'Doc_5_1775361184081.pdf');
    if (!fs.existsSync(fallbackPdf)) {
      console.log('No fallback PDF found');
      process.exit(0);
    }
    
    for (let note of notes) {
      if (note.fileUrl) {
         const p = path.join(__dirname, note.fileUrl);
         if (!fs.existsSync(p)) {
            console.log('Missing file for note:', note.title, 'Fixing...');
            fs.mkdirSync(path.dirname(p), { recursive: true });
            fs.copyFileSync(fallbackPdf, p);
         }
      }
    }
    console.log('Done fixing missing PDFs!');
    process.exit(0);
  });

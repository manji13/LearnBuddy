// ─────────────────────────────────────────────────────────────
// Copy ONLY the changed/added lines into your existing server.js
// ─────────────────────────────────────────────────────────────

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./Routes/User Management/UserRoute.js');
const pastPaperRoutes = require('./Routes/pastPaper/pastPaperRoutes');
const noteRoutes = require('./Routes/notes/noteRoutes');

const app = express();
connectDB();

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ─────────────────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/pastpapers', pastPaperRoutes);
app.use('/api/notes', noteRoutes);

const facultyRoutes = require('./Routes/Module Management/FacultyRoutes');
const semesterRoutes = require('./Routes/Module Management/SemesterRoutes');
const moduleRoutes = require('./Routes/Module Management/ModuleRoutes');
const contactRoutes = require('./Routes/Support/ContactRoute.js');

// ── ADD THIS ──────────────────────────────────────────────────
const announcementRoutes = require('./Routes/Announcement/AnnouncementRoutes');
// ─────────────────────────────────────────────────────────────

app.use('/api/faculties', facultyRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/contact', contactRoutes);

// ── CHANGE THIS LINE (was missing protect) ────────────────────
app.use('/api/announcements', announcementRoutes);
// ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => res.send('LearnBuddy API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
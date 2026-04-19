const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const connectDB = require('./db');

// --- ROUTE IMPORTS ---
const authRoutes = require('./Routes/User Management/UserRoute.js');
const facultyRoutes = require('./Routes/Module Management/FacultyRoutes');
const semesterRoutes = require('./Routes/Module Management/SemesterRoutes');
const moduleRoutes = require('./Routes/Module Management/ModuleRoutes');
const timeTableRoutes = require('./Routes/Time Table Management/TimeTableRoutes');
const pastPaperRoutes = require('./Routes/pastPaper/pastPaperRoutes');
const noteRoutes = require('./Routes/notes/noteRoutes');
const feedbackRoutes = require('./Routes/Feedback/feedbackRoutes');
const bookmarkRoutes = require('./Routes/Bookmark/bookmarkRoutes');
const contactRoutes = require('./Routes/Support/ContactRoute.js'); 
const savedModuleRoute = require('./Routes/Module Management/SavedmoduleRoute');
const announcementRoutes = require('./Routes/Announcement/AnnouncementRoutes');
const interactionRoutes = require('./Routes/Interaction/InteractionRoutes');

const app = express();
connectDB();

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-user-id'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/pastpapers', pastPaperRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/timetable', timeTableRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/resources', require('./Routes/ResourceFinder/ResourceFinderRoute.js'));
app.use('/api/saved-modules', savedModuleRoute);
app.use('/api/announcements', announcementRoutes);
app.use('/api/interactions', interactionRoutes);

app.get('/', (req, res) => res.send('LearnBuddy API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
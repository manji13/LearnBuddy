const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// 1. MUST LOAD ENVIRONMENT VARIABLES FIRST!
dotenv.config();

// 2. NOW we can import files that rely on those variables
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./Routes/User Management/UserRoute.js');
const pastPaperRoutes = require('./Routes/pastPaper/pastPaperRoutes');
const noteRoutes = require('./Routes/notes/noteRoutes');

const facultyRoutes = require('./Routes/Module Management/FacultyRoutes');
const semesterRoutes = require('./Routes/Module Management/SemesterRoutes');
const moduleRoutes = require('./Routes/Module Management/ModuleRoutes');

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors()); 
// INCREASED LIMIT: Base64 images require a larger payload limit
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files for uploaded PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pastpapers', pastPaperRoutes);
app.use('/api/notes', noteRoutes);

app.get('/', (req, res) => {
  res.send('LearnBuddy API is running...');
});

// module Routes
app.use('/api/faculties', facultyRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/modules', moduleRoutes);

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
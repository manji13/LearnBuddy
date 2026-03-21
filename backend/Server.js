const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// 1. THIS MUST BE CALLED IMMEDIATELY AFTER IMPORTING DOTENV!
dotenv.config(); 

const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./Routes/User Management/UserRoute.js');
const pastPaperRoutes = require('./Routes/pastPaper/pastPaperRoutes');
const noteRoutes = require('./Routes/notes/noteRoutes');

const app = express();

// Connect to the database
connectDB();

// CORS Configuration — allow requests from the Vite dev server
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

// INCREASED LIMIT: Base64 images require a larger payload limit
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files for uploaded PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pastpapers', pastPaperRoutes);
app.use('/api/notes', noteRoutes);

// Module Management routes (faculties, semesters, modules)
const facultyRoutes = require('./Routes/Module Management/FacultyRoutes');
const semesterRoutes = require('./Routes/Module Management/SemesterRoutes');
const moduleRoutes = require('./Routes/Module Management/ModuleRoutes');

// NEW: Contact Us Route
const contactRoutes = require('./Routes/Support/ContactRoute.js'); 

app.use('/api/faculties', facultyRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/modules', moduleRoutes);

// NEW: Mount the Contact Us API
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
  res.send('LearnBuddy API is running...');
});

// Define the port
const PORT = process.env.port || process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
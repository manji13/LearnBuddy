const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./Routes/User Management/UserRoute.js');
const pastPaperRoutes = require('./Routes/pastPaper/pastPaperRoutes');
const noteRoutes = require('./Routes/notes/noteRoutes');

dotenv.config();

const app = express();

// Connect to the database
connectDB();

// CORS Configuration — allow requests from the Vite dev server
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, Postman) or any localhost port
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
// Explicitly handle OPTIONS preflight for all routes (regex compatible with Express v5)
app.options(/(.*)/,  cors(corsOptions));
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

// Define the port
const PORT = process.env.port || process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
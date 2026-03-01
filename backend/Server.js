const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./Routes/User Management/UserRoute.js');

dotenv.config();

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors()); 
// INCREASED LIMIT: Base64 images require a larger payload limit
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('LearnBuddy API is running...');
});

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
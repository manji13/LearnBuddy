const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors()); // Allows your React frontend to communicate with the backend
app.use(express.json()); // Parses incoming JSON data from HTTP requests

// A simple test route to verify the server is working
app.get('/', (req, res) => {
  res.send('LearnBuddy API is running...');
});

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
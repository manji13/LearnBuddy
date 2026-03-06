const express = require('express');
const { 
  signup, 
  signin, 
  getAllUsers, 
  updateUser, 
  deleteUser, 
  getUserById,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getAnalytics
} = require('../../Controller/User Management/UserController.js');

const router = express.Router();

// Authentication Routes
router.post('/signup', signup);
router.post('/signin', signin);

// Analytics Route (MUST be before /users/:id)
router.get('/analytics', getAnalytics);

// User Management Routes
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id', getUserById);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
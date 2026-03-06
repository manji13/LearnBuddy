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
  resetPassword
} = require('../../Controller/User Management/UserController.js');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);

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
const express = require('express');
const { signup, signin, getAllUsers, updateUser, deleteUser , getUserById } = require('../../Controller/User Management/UserController.js');
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);

// New User Management Routes
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id', getUserById);

module.exports = router;
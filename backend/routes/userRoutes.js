const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create a new user
router.post('/create', userController.createUser);

// Sign in user
router.post('/signin', userController.signInUser);

// Get all users
router.get('/', userController.getAllUsers);

// Update a user
router.put('/:id', userController.updateUser);

// Update user's modules
router.put('/:id/modules', userController.updateUserModules);

// Delete a user
router.delete('/:id', userController.deleteUser);

// Reset user password
router.put('/:id/resetPassword', userController.resetPassword);

// Bulk upload users from Excel
router.post('/upload', userController.upload.single('file'), userController.uploadUsersFromExcel);

module.exports = router; 
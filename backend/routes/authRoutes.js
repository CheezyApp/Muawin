const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Sign in route
router.post('/signin', userController.signInUser);

// Verify token route
router.get('/verify', auth, (req, res) => {
  res.status(200).json({ 
    message: 'Token is valid',
    user: req.user 
  });
});

module.exports = router; 
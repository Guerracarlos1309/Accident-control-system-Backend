const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/auth/login
 * @desc    Get access token
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user information
 */
router.get('/me', protect, authController.getMe);

module.exports = router;

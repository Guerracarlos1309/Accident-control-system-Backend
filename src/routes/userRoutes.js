const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All user routes protected by JWT
router.use(protect);

/**
 * @route   POST /api/users
 * @desc    Create a new user (Only Admin)
 */
router.post('/', authorize('Administrador'), userController.createUser);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 */
router.put('/me', userController.updateMe);

/**
 * @route   PUT /api/users/me/change-password
 * @desc    User changes their own password (forced by admin reset)
 */
router.put('/me/change-password', userController.changeMyPassword);

/**
 * @route   GET /api/users
 * @desc    Get all users (Only Admin)
 */
router.get('/', authorize('Administrador'), userController.getAllUsers);

/**
 * @route   PUT /api/users/:id/reset-password
 * @desc    Admin resets a user's password and forces change on next login
 */
router.put('/:id/reset-password', authorize('Administrador'), userController.resetPassword);

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user (Only Admin)
 */
router.put('/:id', authorize('Administrador'), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user (Only Admin)
 */
router.delete('/:id', authorize('Administrador'), userController.deleteUser);

module.exports = router;

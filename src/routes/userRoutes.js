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
 * @route   GET /api/users
 * @desc    Get all users (Only Admin)
 */
router.get('/', authorize('Administrador'), userController.getAllUsers);

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

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * All role routes are protected by JWT and limited to Administrators
 */
router.use(protect);
router.use(authorize('Administrador'));

/**
 * @route   GET /api/roles
 * @desc    Get all roles
 */
router.get('/', roleController.getAllRoles);

/**
 * @route   POST /api/roles
 * @desc    Create a new role
 */
router.post('/', roleController.createRole);

module.exports = router;

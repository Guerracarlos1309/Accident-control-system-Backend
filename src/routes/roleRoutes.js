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

/**
 * @route   PUT /api/roles/:id
 * @desc    Update a role
 */
router.put('/:id', roleController.updateRole);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete a role
 */
router.delete('/:id', roleController.deleteRole);

module.exports = router;


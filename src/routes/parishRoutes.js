const express = require('express');
const router = express.Router();
const parishController = require('../controllers/parishController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/parishes
 * @desc    Get all parishes
 */
router.get('/', parishController.getAllParishes);

/**
 * @route   GET /api/parishes/:parish_id/locations
 * @desc    Get locations by parish
 */
router.get('/:parish_id/locations', parishController.getLocationsByParish);

/**
 * @route   POST /api/parishes
 * @desc    Create a new parish (Admin only)
 */
router.post('/', protect, authorize('Administrador'), parishController.createParish);

/**
 * @route   PUT /api/parishes/:id
 * @desc    Update a parish (Admin only)
 */
router.put('/:id', protect, authorize('Administrador'), parishController.updateParish);

/**
 * @route   DELETE /api/parishes/:id
 * @desc    Delete a parish (Admin only)
 */
router.delete('/:id', protect, authorize('Administrador'), parishController.deleteParish);

module.exports = router;


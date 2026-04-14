const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/locations
 * @desc    Get all locations
 */
router.get('/', locationController.getAllLocations);

/**
 * @route   POST /api/locations
 * @desc    Create a new location (Admin only)
 */
router.post('/', protect, authorize('Administrador'), locationController.createLocation);

/**
 * @route   PUT /api/locations/:id
 * @desc    Update a location (Admin only)
 */
router.put('/:id', protect, authorize('Administrador'), locationController.updateLocation);

/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete a location (Admin only)
 */
router.delete('/:id', protect, authorize('Administrador'), locationController.deleteLocation);

module.exports = router;


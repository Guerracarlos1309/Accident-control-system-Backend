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

module.exports = router;

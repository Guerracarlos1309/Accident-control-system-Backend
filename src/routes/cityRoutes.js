const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/cities
 * @desc    Get all cities
 */
router.get('/', cityController.getAllCities);

/**
 * @route   GET /api/cities/:city_id/parishes
 * @desc    Get parishes by city
 */
router.get('/:city_id/parishes', cityController.getParishesByCity);

/**
 * @route   POST /api/cities
 * @desc    Create a new city (Admin only)
 */
router.post('/', protect, authorize('Administrador'), cityController.createCity);

module.exports = router;

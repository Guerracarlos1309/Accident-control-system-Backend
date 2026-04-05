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

module.exports = router;

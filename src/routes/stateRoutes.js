const express = require('express');
const router = express.Router();
const stateController = require('../controllers/stateController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/states
 * @desc    Get all states
 */
router.get('/', stateController.getAllStates);

/**
 * @route   GET /api/states/:state_id/cities
 * @desc    Get cities by state
 */
router.get('/:state_id/cities', stateController.getCitiesByState);

/**
 * @route   POST /api/states
 * @desc    Create a new state (Admin only)
 */
router.post('/', protect, authorize('Administrador'), stateController.createState);

module.exports = router;

const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All fleet routes are protected by JWT
router.use(protect);

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles with details
 */
router.get('/', vehicleController.getVehicles);

/**
 * @route   POST /api/vehicles
 * @desc    Create a new vehicle (Admin only)
 */
router.post('/', authorize('Administrador'), vehicleController.createVehicle);

/**
 * @route   GET /api/vehicles/brands
 * @desc    Get all vehicle brands
 */
router.get('/brands', vehicleController.getBrands);

/**
 * @route   GET /api/vehicles/models
 * @desc    Get all vehicle models
 */
router.get('/models', vehicleController.getModels);

/**
 * @route   GET /api/vehicles/types
 * @desc    Get all vehicle types
 */
router.get('/types', vehicleController.getVehicleTypes);

/**
 * @route   GET /api/vehicles/accessories
 * @desc    Get all vehicle accessories
 */
router.get('/accessories', vehicleController.getAccessories);

module.exports = router;

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
 * @route   GET /api/vehicles/:plate
 * @desc    Get vehicle by plate
 */
router.get('/:plate', vehicleController.getVehicleByPlate);

/**
 * @route   POST /api/vehicles
 * @desc    Create a new vehicle (Admin only)
 */
router.post('/', authorize('Administrador'), vehicleController.createVehicle);

/**
 * @route   PUT /api/vehicles/:plate
 * @desc    Update a vehicle (Admin only)
 */
router.put('/:plate', authorize('Administrador'), vehicleController.updateVehicle);

/**
 * @route   DELETE /api/vehicles/:plate
 * @desc    Delete a vehicle (Admin only)
 */
router.delete('/:plate', authorize('Administrador'), vehicleController.deleteVehicle);

module.exports = router;


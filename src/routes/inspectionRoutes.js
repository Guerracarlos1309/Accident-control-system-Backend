const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');
const { protect } = require('../middlewares/authMiddleware');

// All inspection routes are protected by JWT
router.use(protect);

/**
 * @route   GET /api/inspections
 * @desc    Get all inspections with summary
 */
router.get('/', inspectionController.getAllInspections);

/**
 * @route   GET /api/inspections/:id
 * @desc    Get full inspection details by ID
 */
router.get('/:id', inspectionController.getInspectionById);

/**
 * @route   POST /api/inspections
 * @desc    Create a new complex inspection record (General, Extinguisher, Vehicle)
 */
router.post('/', inspectionController.createInspection);

module.exports = router;

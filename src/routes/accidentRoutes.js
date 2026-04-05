const express = require('express');
const router = express.Router();
const accidentController = require('../controllers/accidentController');
const { protect } = require('../middlewares/authMiddleware');

// All accident routes protected by JWT
router.use(protect);

/**
 * @route   GET /api/accidents
 * @desc    Get all accidents
 */
router.get('/', accidentController.getAllAccidents);

/**
 * @route   GET /api/accidents/:id
 * @desc    Get accident by ID including all details
 */
router.get('/:id', accidentController.getAccidentById);

/**
 * @route   POST /api/accidents
 * @desc    Create a new accident record with nested details
 */
router.post('/', accidentController.createAccident);

module.exports = router;

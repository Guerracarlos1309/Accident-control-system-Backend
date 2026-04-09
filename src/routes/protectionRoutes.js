const express = require('express');
const router = express.Router();
const protectionController = require('../controllers/protectionController');
const { protect } = require('../middlewares/authMiddleware');

// All protection routes protected by JWT
router.use(protect);

// Equipment
router.get('/equipment', protectionController.getEquipment);
router.put('/equipment/:id', protectionController.updateEquipment);

// Categories
router.get('/categories', protectionController.getCategories);

// Inspections
router.get('/inspections', protectionController.getProtectionInspections);
router.post('/inspections', protectionController.createProtectionInspection);

module.exports = router;

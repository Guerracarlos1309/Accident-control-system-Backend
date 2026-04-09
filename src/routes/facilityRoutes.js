const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');
const { protect } = require('../middlewares/authMiddleware');

// All facility routes protected by JWT
router.use(protect);

router.get('/', facilityController.getFacilities);
router.get('/:id', facilityController.getFacilityById);
router.post('/', facilityController.createFacility);
router.put('/:id', facilityController.updateFacility);
router.delete('/:id', facilityController.deleteFacility);

module.exports = router;

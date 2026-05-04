const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');
const { protect } = require('../middlewares/authMiddleware');
const uploadFacility = require('../middlewares/uploadFacility');

// All facility routes protected by JWT
router.use(protect);

router.get('/', facilityController.getFacilities);
router.get('/:id', facilityController.getFacilityById);
router.post('/', uploadFacility.array('images', 10), facilityController.createFacility);
router.put('/:id', uploadFacility.array('images', 10), facilityController.updateFacility);
router.put('/:id/reactivate', facilityController.reactivateFacility);
router.delete('/:id', facilityController.deleteFacility);

module.exports = router;

const express = require('express');
const router = express.Router();
const facilityCodeController = require('../controllers/facilityCodeController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all routes
router.use(protect);

router.get('/', facilityCodeController.getFacilityCodes);
router.get('/next-code', facilityCodeController.getNextCode);
router.get('/:id/report', facilityCodeController.downloadFacilityCodeReport);
router.post('/', facilityCodeController.createFacilityCode);
router.put('/:id', facilityCodeController.updateFacilityCode);
router.delete('/:id', facilityCodeController.deleteFacilityCode);

module.exports = router;

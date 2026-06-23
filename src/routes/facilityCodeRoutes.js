const express = require('express');
const router = express.Router();
const facilityCodeController = require('../controllers/facilityCodeController');
const { protect } = require('../middlewares/authMiddleware');
const uploadInspectionPdf = require('../middlewares/uploadInspectionPdf');

// Protect all routes
router.use(protect);

router.get('/', facilityCodeController.getFacilityCodes);
router.get('/next-code', facilityCodeController.getNextCode);
router.get('/:id/report', facilityCodeController.downloadFacilityCodeReport);
router.post('/', uploadInspectionPdf.single('pdfFile'), facilityCodeController.createFacilityCode);
router.put('/:id', uploadInspectionPdf.single('pdfFile'), facilityCodeController.updateFacilityCode);
router.delete('/:id', facilityCodeController.deleteFacilityCode);

module.exports = router;

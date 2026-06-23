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
router.post('/', uploadInspectionPdf.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'pdfFile2', maxCount: 1 }]), facilityCodeController.createFacilityCode);
router.put('/:id', uploadInspectionPdf.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'pdfFile2', maxCount: 1 }]), facilityCodeController.updateFacilityCode);
router.delete('/:id', facilityCodeController.deleteFacilityCode);

module.exports = router;

const express = require('express');
const router = express.Router();
const lookupController = require('../controllers/lookupController');

/**
 * Public/Protected endpoints to get lookup data for forms
 */
router.get('/accident-types', lookupController.getAccidentTypes);
router.get('/magnitudes', lookupController.getMagnitudes);
router.get('/periods', lookupController.getPeriods);
router.get('/file-documents', lookupController.getFileDocuments);
router.get('/affectation-subjects', lookupController.getAffectationSubjects);
router.get('/affectations', lookupController.getAffectations);
router.get('/contact-types', lookupController.getContactTypes);
router.get('/damage-agents', lookupController.getDamageAgents);
router.get('/injury-types', lookupController.getInjuryTypes);
router.get('/installation-types', lookupController.getInstallationTypes);
router.get('/protection-types', lookupController.getProtectionTypes);

module.exports = router;

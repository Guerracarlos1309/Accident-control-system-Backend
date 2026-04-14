const express = require('express');
const router = express.Router();
const lookupController = require('../controllers/lookupController');

// --- Accidents & Incidents Lookups ---
router.get('/accident-types', lookupController.getAccidentTypes);
router.post('/accident-types', lookupController.createAccidentType);
router.put('/accident-types/:id', lookupController.updateAccidentType);
router.delete('/accident-types/:id', lookupController.deleteAccidentType);

router.get('/magnitudes', lookupController.getMagnitudes);
router.post('/magnitudes', lookupController.createMagnitude);
router.put('/magnitudes/:id', lookupController.updateMagnitude);
router.delete('/magnitudes/:id', lookupController.deleteMagnitude);

router.get('/periods', lookupController.getPeriods);
router.post('/periods', lookupController.createPeriod);
router.put('/periods/:id', lookupController.updatePeriod);
router.delete('/periods/:id', lookupController.deletePeriod);

router.get('/file-documents', lookupController.getFileDocuments);
router.post('/file-documents', lookupController.createFileDocument);
router.put('/file-documents/:id', lookupController.updateFileDocument);
router.delete('/file-documents/:id', lookupController.deleteFileDocument);

router.get('/affectation-subjects', lookupController.getAffectationSubjects);
router.post('/affectation-subjects', lookupController.createAffectationSubject);
router.put('/affectation-subjects/:id', lookupController.updateAffectationSubject);
router.delete('/affectation-subjects/:id', lookupController.deleteAffectationSubject);

router.get('/affectations', lookupController.getAffectations);
router.post('/affectations', lookupController.createAffectation);
router.put('/affectations/:id', lookupController.updateAffectation);
router.delete('/affectations/:id', lookupController.deleteAffectation);

router.get('/contact-types', lookupController.getContactTypes);
router.post('/contact-types', lookupController.createContactType);
router.put('/contact-types/:id', lookupController.updateContactType);
router.delete('/contact-types/:id', lookupController.deleteContactType);

router.get('/damage-agents', lookupController.getDamageAgents);
router.post('/damage-agents', lookupController.createDamageAgent);
router.put('/damage-agents/:id', lookupController.updateDamageAgent);
router.delete('/damage-agents/:id', lookupController.deleteDamageAgent);

router.get('/injury-types', lookupController.getInjuryTypes);
router.post('/injury-types', lookupController.createInjuryType);
router.put('/injury-types/:id', lookupController.updateInjuryType);
router.delete('/injury-types/:id', lookupController.deleteInjuryType);

// --- Human Resources Lookups ---
router.get('/occupations', lookupController.getOccupations);
router.post('/occupations', lookupController.createOccupation);
router.put('/occupations/:id', lookupController.updateOccupation);
router.delete('/occupations/:id', lookupController.deleteOccupation);

router.get('/departments', lookupController.getDepartments);
router.post('/departments', lookupController.createDepartment);
router.put('/departments/:id', lookupController.updateDepartment);
router.delete('/departments/:id', lookupController.deleteDepartment);

router.get('/job-titles', lookupController.getJobTitles);
router.post('/job-titles', lookupController.createJobTitle);
router.put('/job-titles/:id', lookupController.updateJobTitle);
router.delete('/job-titles/:id', lookupController.deleteJobTitle);

// --- Facility & Geographic Lookups ---
router.get('/installation-types', lookupController.getInstallationTypes);
router.post('/installation-types', lookupController.createInstallationType);
router.put('/installation-types/:id', lookupController.updateInstallationType);
router.delete('/installation-types/:id', lookupController.deleteInstallationType);

// --- Vehicle Lookups ---
router.get('/brands', lookupController.getBrands);
router.post('/brands', lookupController.createBrand);
router.put('/brands/:id', lookupController.updateBrand);
router.delete('/brands/:id', lookupController.deleteBrand);

router.get('/models', lookupController.getModels);
router.post('/models', lookupController.createModel);
router.put('/models/:id', lookupController.updateModel);
router.delete('/models/:id', lookupController.deleteModel);

router.get('/vehicle-types', lookupController.getVehicleTypes);
router.post('/vehicle-types', lookupController.createVehicleType);
router.put('/vehicle-types/:id', lookupController.updateVehicleType);
router.delete('/vehicle-types/:id', lookupController.deleteVehicleType);

router.get('/vehicle-accessories', lookupController.getVehicleAccessories);
router.post('/vehicle-accessories', lookupController.createVehicleAccessory);
router.put('/vehicle-accessories/:id', lookupController.updateVehicleAccessory);
router.delete('/vehicle-accessories/:id', lookupController.deleteVehicleAccessory);

// --- Inspection Lookups ---
router.get('/agent-types', lookupController.getAgentTypes);
router.post('/agent-types', lookupController.createAgentType);
router.put('/agent-types/:id', lookupController.updateAgentType);
router.delete('/agent-types/:id', lookupController.deleteAgentType);

router.get('/inspection-status', lookupController.getInspectionStatus);
router.post('/inspection-status', lookupController.createInspectionStatus);
router.put('/inspection-status/:id', lookupController.updateInspectionStatus);
router.delete('/inspection-status/:id', lookupController.deleteInspectionStatus);

// --- Protection Lookups ---
router.get('/protection-types', lookupController.getProtectionTypes);
router.post('/protection-types', lookupController.createProtectionType);
router.put('/protection-types/:id', lookupController.updateProtectionType);
router.delete('/protection-types/:id', lookupController.deleteProtectionType);

router.get('/protection-equipment-categories', lookupController.getProtectionEquipmentCategories);
router.post('/protection-equipment-categories', lookupController.createProtectionEquipmentCategory);
router.put('/protection-equipment-categories/:id', lookupController.updateProtectionEquipmentCategory);
router.delete('/protection-equipment-categories/:id', lookupController.deleteProtectionEquipmentCategory);

module.exports = router;


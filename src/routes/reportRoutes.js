const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Endpoints for PDF reports
router.get("/payroll", reportController.downloadPayrollReport);
router.get("/accidents", reportController.downloadAccidentsListReport);
router.get("/accidents/:id", reportController.downloadAccidentReport);
router.get("/inspections", reportController.downloadInspectionsListReport);
router.get("/inspections/:id", reportController.downloadInspectionReport);

module.exports = router;

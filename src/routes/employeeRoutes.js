const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const upload = require('../middlewares/upload');

/**
 * @route   GET /api/employees
 * @desc    Get all employees
 */
router.get('/', employeeController.getAllEmployees);

/**
 * @route   GET /api/employees/:personal_number
 * @desc    Get employee by personal number
 */
router.get('/:personal_number', employeeController.getEmployeeByPersonalNumber);

/**
 * @route   POST /api/employees
 * @desc    Create a new employee
 */
router.post('/', upload.single('image'), employeeController.createEmployee);

/**
 * @route   PUT /api/employees/:personal_number
 * @desc    Update an employee
 */
router.put('/:personal_number', upload.single('image'), employeeController.updateEmployee);

/**
 * @route   DELETE /api/employees/:personal_number
 * @desc    Deactivate an employee (Soft delete)
 */
router.delete('/:personal_number', employeeController.deleteEmployee);

module.exports = router;

const { Employee, Department, JobTitle, Occupation } = require('../models');

/**
 * Get all employees with associations
 */
exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      include: [
        { model: Department, as: 'department' },
        { model: JobTitle, as: 'jobTitle' },
        { model: Occupation, as: 'occupation' }
      ]
    });
    res.status(200).json(employees);
  } catch (error) {
    next(error);
  }
};

/**
 * Get employee by personal number
 */
exports.getEmployeeByPersonalNumber = async (req, res, next) => {
  try {
    const { personal_number } = req.params;
    const employee = await Employee.findOne({
      where: { personalNumber: personal_number },
      include: [
        { model: Department, as: 'department' },
        { model: JobTitle, as: 'jobTitle' },
        { model: Occupation, as: 'occupation' }
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new employee
 */
exports.createEmployee = async (req, res, next) => {
  try {
    const employeeData = req.body;
    const newEmployee = await Employee.create(employeeData);
    res.status(201).json(newEmployee);
  } catch (error) {
    // Check for unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Employee with this ID Card, Personal Number or Email already exists' });
    }
    next(error);
  }
};

/**
 * Update an employee
 */
exports.updateEmployee = async (req, res, next) => {
  try {
    const { personal_number } = req.params;
    const employeeData = req.body;

    const [updatedRows] = await Employee.update(employeeData, {
      where: { personalNumber: personal_number }
    });

    if (updatedRows > 0) {
      const updatedEmployee = await Employee.findOne({ 
        where: { personalNumber: personal_number },
        include: [
          { model: Department, as: 'department' },
          { model: JobTitle, as: 'jobTitle' },
          { model: Occupation, as: 'occupation' }
        ]
      });
      return res.status(200).json(updatedEmployee);
    }
    
    return res.status(404).json({ message: 'Employee not found' });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete an employee (Deactivate)
 */
exports.deleteEmployee = async (req, res, next) => {
  try {
    const { personal_number } = req.params;
    
    // Soft delete: update status to 0
    const [updatedRows] = await Employee.update({ status: 0 }, {
      where: { personalNumber: personal_number }
    });

    if (updatedRows > 0) {
      return res.status(200).json({ message: 'Employee deactivated successfully' });
    }

    return res.status(404).json({ message: 'Employee not found' });
  } catch (error) {
    next(error);
  }
};

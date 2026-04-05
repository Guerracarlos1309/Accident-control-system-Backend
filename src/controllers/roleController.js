const { Role } = require('../models');

/**
 * Get all roles
 */
exports.getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new role
 */
exports.createRole = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const newRole = await Role.create({ name, description });
    res.status(201).json(newRole);
  } catch (error) {
    next(error);
  }
};

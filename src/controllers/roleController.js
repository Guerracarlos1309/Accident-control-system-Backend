const { Role } = require("../models");

/*
  Get all roles
 */
exports.getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

/*
  Create a new role
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

/*
  Update a role
 */
exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const role = await Role.findByPk(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    await role.update({ name, description });
    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
};

/*
  Delete a role
 */
exports.deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    await role.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};



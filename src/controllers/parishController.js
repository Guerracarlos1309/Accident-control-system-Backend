const { Parish, Location } = require("../models");

/*
  Get all parishes
 */
exports.getAllParishes = async (req, res, next) => {
  try {
    const parishes = await Parish.findAll({
      order: [["name", "ASC"]],
    });
    res.status(200).json(parishes);
  } catch (error) {
    next(error);
  }
};

/*
  Get locations for a specific parish
 */
exports.getLocationsByParish = async (req, res, next) => {
  try {
    const { parish_id } = req.params;
    const locations = await Location.findAll({
      where: { parishId: parish_id },
      order: [["name", "ASC"]],
    });
    res.status(200).json(locations);
  } catch (error) {
    next(error);
  }
};

/*
  Create a new parish
 */
exports.createParish = async (req, res, next) => {
  try {
    const newParish = await Parish.create(req.body);
    res.status(201).json(newParish);
  } catch (error) {
    next(error);
  }
};

/*
  Update a parish
 */
exports.updateParish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parish = await Parish.findByPk(id);
    if (!parish) return res.status(404).json({ message: "Parish not found" });
    await parish.update(req.body);
    res.status(200).json(parish);
  } catch (error) {
    next(error);
  }
};

/*
  Delete a parish
 */
exports.deleteParish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parish = await Parish.findByPk(id);
    if (!parish) return res.status(404).json({ message: "Parish not found" });
    await parish.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};


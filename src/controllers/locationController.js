const { Location } = require("../models");

/*
 Get all locations
 */
exports.getAllLocations = async (req, res, next) => {
  try {
    const locations = await Location.findAll({
      order: [["name", "ASC"]],
    });
    res.status(200).json(locations);
  } catch (error) {
    next(error);
  }
};

/*
  Create a new location
 */
exports.createLocation = async (req, res, next) => {
  try {
    const newLocation = await Location.create(req.body);
    res.status(201).json(newLocation);
  } catch (error) {
    next(error);
  }
};

/*
  Update a location
 */
exports.updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);
    if (!location) return res.status(404).json({ message: "Location not found" });
    await location.update(req.body);
    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

/*
  Delete a location
 */
exports.deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);
    if (!location) return res.status(404).json({ message: "Location not found" });
    await location.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};


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

const { City, Parish } = require("../models");

/*
  Get all cities
 */
exports.getAllCities = async (req, res, next) => {
  try {
    const cities = await City.findAll({
      order: [["name", "ASC"]],
    });
    res.status(200).json(cities);
  } catch (error) {
    next(error);
  }
};

/*
  Get parishes for a specific city
 */
exports.getParishesByCity = async (req, res, next) => {
  try {
    const { city_id } = req.params;
    const parishes = await Parish.findAll({
      where: { cityId: city_id },
      order: [["name", "ASC"]],
    });
    res.status(200).json(parishes);
  } catch (error) {
    next(error);
  }
};

/*
  Create a new city
 */
exports.createCity = async (req, res, next) => {
  try {
    const newCity = await City.create(req.body);
    res.status(201).json(newCity);
  } catch (error) {
    next(error);
  }
};

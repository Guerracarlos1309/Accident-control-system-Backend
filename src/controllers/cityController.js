const { City, Parish, State } = require("../models");

/*
  Get all cities
 */
exports.getAllCities = async (req, res, next) => {
  try {
    const { stateId } = req.query;
    const where = {};
    if (stateId) where.stateId = stateId;

    const cities = await City.findAll({
      where,
      include: [{ model: State, as: 'state', attributes: ['name'] }],
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

/*
  Update a city
 */
exports.updateCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const city = await City.findByPk(id);
    if (!city) return res.status(404).json({ message: "City not found" });
    await city.update(req.body);
    res.status(200).json(city);
  } catch (error) {
    next(error);
  }
};

/*
  Delete a city
 */
exports.deleteCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const city = await City.findByPk(id);
    if (!city) return res.status(404).json({ message: "City not found" });
    await city.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};


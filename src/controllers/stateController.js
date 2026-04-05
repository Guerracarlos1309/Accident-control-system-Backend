const { State, City } = require('../models');

/**
 * Get all states
 */
exports.getAllStates = async (req, res, next) => {
  try {
    const states = await State.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(states);
  } catch (error) {
    next(error);
  }
};

/**
 * Get cities for a specific state
 */
exports.getCitiesByState = async (req, res, next) => {
  try {
    const { state_id } = req.params;
    const cities = await City.findAll({
      where: { stateId: state_id },
      order: [['name', 'ASC']]
    });
    res.status(200).json(cities);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new state (Admin only logic can be applied in routes)
 */
exports.createState = async (req, res, next) => {
  try {
    const newState = await State.create(req.body);
    res.status(201).json(newState);
  } catch (error) {
    next(error);
  }
};

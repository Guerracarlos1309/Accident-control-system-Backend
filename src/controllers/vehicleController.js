const { Brand, Model, VehicleType, Vehicle, VehicleAccessory } = require('../models');

/**
 * Get all brands
 */
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all models with their brand
 */
exports.getModels = async (req, res, next) => {
  try {
    const models = await Model.findAll({
      include: [{ model: Brand, as: 'brand' }]
    });
    res.status(200).json(models);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all vehicle types
 */
exports.getVehicleTypes = async (req, res, next) => {
  try {
    const types = await VehicleType.findAll();
    res.status(200).json(types);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all vehicles with full details
 */
exports.getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.findAll({
      include: [
        { model: Model, as: 'model', include: [{ model: Brand, as: 'brand' }] },
        { model: VehicleType, as: 'type' }
      ]
    });
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all accessories
 */
exports.getAccessories = async (req, res, next) => {
  try {
    const accessories = await VehicleAccessory.findAll();
    res.status(200).json(accessories);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new vehicle
 */
exports.createVehicle = async (req, res, next) => {
  try {
    const newVehicle = await Vehicle.create(req.body);
    res.status(201).json(newVehicle);
  } catch (error) {
    next(error);
  }
};

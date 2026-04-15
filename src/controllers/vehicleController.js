const {
  Brand,
  Model,
  VehicleType,
  Vehicle,
  VehicleAccessory,
} = require("../models");

/*
  Get all brands
 */
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
  } catch (error) {
    next(error);
  }
};

/*
  Get all models with their brand
 */
exports.getModels = async (req, res, next) => {
  try {
    const models = await Model.findAll({
      include: [{ model: Brand, as: "brand" }],
    });
    res.status(200).json(models);
  } catch (error) {
    next(error);
  }
};

/*
  Get all vehicle types
 */
exports.getVehicleTypes = async (req, res, next) => {
  try {
    const types = await VehicleType.findAll();
    res.status(200).json(types);
  } catch (error) {
    next(error);
  }
};

/*
  Get all vehicles with full details
 */
exports.getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.findAll({
      include: [
        { model: Model, as: "model", include: [{ model: Brand, as: "brand" }] },
        { model: VehicleType, as: "type" },
      ],
    });
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

/*
  Get vehicle by plate
 */
exports.getVehicleByPlate = async (req, res, next) => {
  try {
    const { plate } = req.params;
    const vehicle = await Vehicle.findOne({
      where: { plate },
      include: [
        { model: Model, as: "model", include: [{ model: Brand, as: "brand" }] },
        { model: VehicleType, as: "type" },
      ],
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

/*
  Create a new vehicle
 */
exports.createVehicle = async (req, res, next) => {
  try {
    const newVehicle = await Vehicle.create(req.body);
    res.status(201).json(newVehicle);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Vehicle with this plate already exists" });
    }
    next(error);
  }
};

/*
  Update a vehicle
 */
exports.updateVehicle = async (req, res, next) => {
  try {
    const { plate } = req.params;
    const [updatedRows] = await Vehicle.update(req.body, {
      where: { plate },
    });

    if (updatedRows > 0) {
      const updatedVehicle = await Vehicle.findOne({
        where: { plate },
        include: [
          {
            model: Model,
            as: "model",
            include: [{ model: Brand, as: "brand" }],
          },
          { model: VehicleType, as: "type" },
        ],
      });
      return res.status(200).json(updatedVehicle);
    }

    return res.status(404).json({ message: "Vehicle not found" });
  } catch (error) {
    next(error);
  }
};

/*
  Delete a vehicle
 */
exports.deleteVehicle = async (req, res, next) => {
  try {
    const { plate } = req.params;
    const deletedCount = await Vehicle.destroy({
      where: { plate },
    });

    if (deletedCount > 0) {
      return res.status(200).json({ message: "Vehicle deleted successfully" });
    }

    return res.status(404).json({ message: "Vehicle not found" });
  } catch (error) {
    next(error);
  }
};

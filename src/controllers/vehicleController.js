const {
  Brand,
  Model,
  VehicleType,
  Vehicle,
  VehicleImage,
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
        { model: VehicleImage, as: "images" }
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
        { model: VehicleImage, as: "images" }
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
    
    // Process images
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map(file => ({
        plateId: newVehicle.plate,
        imageUrl: `/uploads/employees/${file.filename}` // using same upload directory
      }));
      await VehicleImage.bulkCreate(imageRecords);
    }
    
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
    
    // Process deleted images
    if (req.body.deletedImageIds) {
      let idsToDelete = req.body.deletedImageIds;
      if (!Array.isArray(idsToDelete)) {
        idsToDelete = [idsToDelete]; // Convert single string to array if only one
      }
      
      // Destroy those specific images from database
      await VehicleImage.destroy({
        where: {
          id: idsToDelete,
          plateId: plate
        }
      });
      // Optionally we could fs.unlink the actual files here, but DB cleanup is most critical
    }
    
    // Process new images (append)
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map(file => ({
        plateId: plate,
        imageUrl: `/uploads/employees/${file.filename}` 
      }));
      await VehicleImage.bulkCreate(imageRecords);
    }

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
          { model: VehicleImage, as: "images" }
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

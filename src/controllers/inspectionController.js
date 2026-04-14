const {
  Inspection,
  ExtinguisherInspection,
  ExtinguisherDetail,
  VehicleInspection,
  InspectionDetail,
  InspectionStatus,
  Employee,
  Location,
  Vehicle,
  AgentType,
  VehicleAccessory,
  Model,
  Brand,
  sequelize,
} = require("../models");

/*
  Get all inspections with summary info
 */
exports.getAllInspections = async (req, res, next) => {
  try {
    const inspections = await Inspection.findAll({
      include: [
        { model: Location, as: "location" },
        { model: Employee, as: "inspector" },
        { model: InspectionStatus, as: "status" },
      ],
      order: [["created_at", "DESC"]],
    });
    res.status(200).json(inspections);
  } catch (error) {
    next(error);
  }
};

/*
  Get detailed inspection report by ID
 */
exports.getInspectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inspection = await Inspection.findByPk(id, {
      include: [
        { model: Location, as: "location" },
        { model: Employee, as: "inspector" },
        { model: InspectionStatus, as: "status" },
        {
          model: ExtinguisherInspection,
          as: "extinguisherInspection",
          include: [
            {
              model: ExtinguisherDetail,
              as: "details",
              include: [{ model: AgentType, as: "agentType" }],
            },
          ],
        },
        {
          model: VehicleInspection,
          as: "vehicleInspection",
          include: [
            {
              model: Vehicle,
              as: "vehicle",
              include: [
                {
                  model: Model,
                  as: "model",
                  include: [{ model: Brand, as: "brand" }],
                },
              ],
            },
            {
              model: InspectionDetail,
              as: "accessoryChecks",
              include: [{ model: VehicleAccessory, as: "accessory" }],
            },
          ],
        },
      ],
    });

    if (!inspection) {
      return res.status(404).json({ message: "Inspection report not found" });
    }

    res.status(200).json(inspection);
  } catch (error) {
    next(error);
  }
};

/*
  Create a new inspection report (General, Extinguisher or Vehicle)
  Uses transactions to ensure atomicity
 */
exports.createInspection = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { extinguisherData, vehicleData, ...inspectionData } = req.body;

    // 1. Create the base inspection entry
    const newInspection = await Inspection.create(inspectionData, {
      transaction: t,
    });

    // 2. Process Extinguisher specifics if provided
    if (extinguisherData) {
      const { details, ...mainExtData } = extinguisherData;
      const extInsp = await ExtinguisherInspection.create(
        {
          ...mainExtData,
          inspectionId: newInspection.id,
        },
        { transaction: t },
      );

      if (details && Array.isArray(details)) {
        await ExtinguisherDetail.bulkCreate(
          details.map((d) => ({ ...d, extinguisherInspectionId: extInsp.id })),
          { transaction: t },
        );
      }
    }

    // 3. Process Vehicle specifics if provided
    if (vehicleData) {
      const { accessoryChecks, ...mainVehData } = vehicleData;
      const vehInsp = await VehicleInspection.create(
        {
          ...mainVehData,
          inspectionId: newInspection.id,
        },
        { transaction: t },
      );

      if (accessoryChecks && Array.isArray(accessoryChecks)) {
        await InspectionDetail.bulkCreate(
          accessoryChecks.map((c) => ({
            ...c,
            vehicleInspectionId: vehInsp.id,
          })),
          { transaction: t },
        );
      }
    }

    await t.commit();
    res.status(201).json(newInspection);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
/*
  Update an inspection report
  Handles nested updates for specialized data by clearing and re-creating
 */
exports.updateInspection = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { extinguisherData, vehicleData, ...inspectionData } = req.body;

    const inspection = await Inspection.findByPk(id);
    if (!inspection) {
      await t.rollback();
      return res.status(404).json({ message: "Inspection report not found" });
    }

    // 1. Update general entry
    await inspection.update(inspectionData, { transaction: t });

    // 2. Update Extinguisher details if provided
    if (extinguisherData) {
      const { details, ...mainExtData } = extinguisherData;
      // Find or create the sub-entry
      let extInsp = await ExtinguisherInspection.findOne({ where: { inspectionId: id }, transaction: t });
      if (extInsp) {
        await extInsp.update(mainExtData, { transaction: t });
        await ExtinguisherDetail.destroy({ where: { extinguisherInspectionId: extInsp.id }, transaction: t });
      } else {
        extInsp = await ExtinguisherInspection.create({ ...mainExtData, inspectionId: id }, { transaction: t });
      }

      if (details && Array.isArray(details)) {
        await ExtinguisherDetail.bulkCreate(
          details.map((d) => ({ ...d, extinguisherInspectionId: extInsp.id })),
          { transaction: t },
        );
      }
    }

    // 3. Update Vehicle details if provided
    if (vehicleData) {
      const { accessoryChecks, ...mainVehData } = vehicleData;
      let vehInsp = await VehicleInspection.findOne({ where: { inspectionId: id }, transaction: t });
      if (vehInsp) {
        await vehInsp.update(mainVehData, { transaction: t });
        await InspectionDetail.destroy({ where: { vehicleInspectionId: vehInsp.id }, transaction: t });
      } else {
        vehInsp = await VehicleInspection.create({ ...mainVehData, inspectionId: id }, { transaction: t });
      }

      if (accessoryChecks && Array.isArray(accessoryChecks)) {
        await InspectionDetail.bulkCreate(
          accessoryChecks.map((c) => ({
            ...c,
            vehicleInspectionId: vehInsp.id,
          })),
          { transaction: t },
        );
      }
    }

    await t.commit();
    res.status(200).json(inspection);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/*
  Delete an inspection report
 */
exports.deleteInspection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inspection = await Inspection.findByPk(id);
    if (!inspection) {
      return res.status(404).json({ message: "Inspection report not found" });
    }

    // Hard delete since these are reports
    await inspection.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

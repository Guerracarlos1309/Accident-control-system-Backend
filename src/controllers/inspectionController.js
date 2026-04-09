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

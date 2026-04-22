const {
  Accident,
  Location,
  AccidentType,
  Period,
  User,
  DamageAgent,
  ContactType,
  EmployeeAccident,
  AccidentDocumentCheck,
  AccidentAffectationDetail,
  Employee,
  InjuryType,
  Magnitude,
  Affectation,
  AffectationSubject,
  FileDocument,
  sequelize,
} = require("../models");

/*
  Get all accidents with summary info
 */
exports.getAllAccidents = async (req, res, next) => {
  try {
    const accidents = await Accident.findAll({
      include: [
        { 
          model: Facility, 
          as: "facility",
          include: [{ model: Location, as: "location" }]
        },
        { model: AccidentType, as: "type" },
        { model: Period, as: "period" },
      ],
      order: [["created_at", "DESC"]],
    });
    res.status(200).json(accidents);
  } catch (error) {
    next(error);
  }
};

/*
  Get full accident details by ID including all nested associations
 */
exports.getAccidentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const accident = await Accident.findByPk(id, {
      include: [
        { 
          model: Facility, 
          as: "facility",
          include: [{ model: Location, as: "location" }]
        },
        { model: AccidentType, as: "type" },
        { model: Period, as: "period" },
        { model: DamageAgent, as: "damageAgent" },
        { model: ContactType, as: "contactType" },
        {
          model: EmployeeAccident,
          as: "involvedEmployees",
          include: [
            { model: Employee, as: "employee" },
            { model: InjuryType, as: "injuryType" },
            { model: Magnitude, as: "magnitude" },
          ],
        },
        {
          model: AccidentDocumentCheck,
          as: "documentsCheck",
          include: [{ model: FileDocument, as: "document" }],
        },
        {
          model: AccidentAffectationDetail,
          as: "affectationDetails",
          include: [
            { model: Affectation, as: "affectation" },
            { model: AffectationSubject, as: "subject" },
            { model: Magnitude, as: "magnitude" },
          ],
        },
      ],
    });

    if (!accident) {
      return res.status(404).json({ message: "Accident not found" });
    }

    res.status(200).json(accident);
  } catch (error) {
    next(error);
  }
};

/*
  Create a new accident record
  This handles nested creation of involved employees, documents and affectation details
 */
exports.createAccident = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      involvedEmployees,
      documentsCheck,
      affectationDetails,
      ...accidentData
    } = req.body;

    // 1. Create the main accident record
    const newAccident = await Accident.create(accidentData, { transaction: t });

    // 2. Create involved employees records if any
    if (involvedEmployees && Array.isArray(involvedEmployees)) {
      const employeesToCreate = involvedEmployees.map((emp) => ({
        ...emp,
        accidentId: newAccident.id,
      }));
      await EmployeeAccident.bulkCreate(employeesToCreate, { transaction: t });
    }

    // 3. Create document check records if any
    if (documentsCheck && Array.isArray(documentsCheck)) {
      const documentsToCreate = documentsCheck.map((doc) => ({
        ...doc,
        accidentId: newAccident.id,
      }));
      await AccidentDocumentCheck.bulkCreate(documentsToCreate, {
        transaction: t,
      });
    }

    // 4. Create affectation details if any
    if (affectationDetails && Array.isArray(affectationDetails)) {
      const affectationsToCreate = affectationDetails.map((aff) => ({
        ...aff,
        accidentId: newAccident.id,
      }));
      await AccidentAffectationDetail.bulkCreate(affectationsToCreate, {
        transaction: t,
      });
    }

    await t.commit();

    // Return the created accident with minimal info
    res.status(201).json(newAccident);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
/*
  Update an accident record
  Handles updating nested associated tables by clearing and re-creating
 */
exports.updateAccident = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      involvedEmployees,
      documentsCheck,
      affectationDetails,
      ...accidentData
    } = req.body;

    const accident = await Accident.findByPk(id);
    if (!accident) {
      await t.rollback();
      return res.status(404).json({ message: "Accident not found" });
    }

    // 1. Update main record
    await accident.update(accidentData, { transaction: t });

    // 2. Update involved employees (Clear and re-create)
    if (involvedEmployees) {
      await EmployeeAccident.destroy({ where: { accidentId: id }, transaction: t });
      if (Array.isArray(involvedEmployees)) {
        const employeesToCreate = involvedEmployees.map((emp) => ({
          ...emp,
          accidentId: id,
        }));
        await EmployeeAccident.bulkCreate(employeesToCreate, { transaction: t });
      }
    }

    // 3. Update documents check (Clear and re-create)
    if (documentsCheck) {
      await AccidentDocumentCheck.destroy({ where: { accidentId: id }, transaction: t });
      if (Array.isArray(documentsCheck)) {
        const documentsToCreate = documentsCheck.map((doc) => ({
          ...doc,
          accidentId: id,
        }));
        await AccidentDocumentCheck.bulkCreate(documentsToCreate, {
          transaction: t,
        });
      }
    }

    // 4. Update affectation details (Clear and re-create)
    if (affectationDetails) {
      await AccidentAffectationDetail.destroy({ where: { accidentId: id }, transaction: t });
      if (Array.isArray(affectationDetails)) {
        const affectationsToCreate = affectationDetails.map((aff) => ({
          ...aff,
          accidentId: id,
        }));
        await AccidentAffectationDetail.bulkCreate(affectationsToCreate, {
          transaction: t,
        });
      }
    }

    await t.commit();
    res.status(200).json(accident);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/*
  Delete an accident record (Soft delete by status if applicable, or hard delete)
 */
exports.deleteAccident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const accident = await Accident.findByPk(id);
    if (!accident) {
      return res.status(404).json({ message: "Accident not found" });
    }

    // Option: Soft delete by setting status to 0
    await accident.update({ status: 0 });
    
    // If hard delete is preferred, uncomment below:
    // await accident.destroy();

    res.status(200).json({ message: "Accident record deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

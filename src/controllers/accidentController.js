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
  Facility,
  InstallationType,
  InspectionStatus,
  AccidentWitness,
  Occupation,
  Management,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

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
          include: ["location", "installationType"]
        },
        { model: AccidentType, as: "type" },
        { model: Period, as: "period" },
        { model: Magnitude, as: "magnitude" },
        { 
          model: EmployeeAccident, 
          as: "involvedEmployees",
          include: ["employee"]
        },
        { model: InspectionStatus, as: "processStatus" },
        { model: Management, as: "management" }
      ],
      order: [["id", "DESC"]],
    });
    res.status(200).json(accidents);
  } catch (error) {
    console.error("ERROR EN GET ALL ACCIDENTS:", error);
    res.status(500).json({ message: error.message });
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
          include: [
            { model: Location, as: "location" },
            { model: InstallationType, as: "installationType" }
          ]
        },
        { model: AccidentType, as: "type" },
        { model: Period, as: "period" },
        { model: Magnitude, as: "magnitude" },
        { model: DamageAgent, as: "damageAgent" },
        { model: ContactType, as: "contactType" },
        { model: Management, as: "management" },
        { model: InspectionStatus, as: "processStatus" },
        {
          model: EmployeeAccident,
          as: "involvedEmployees",
          include: [
            { 
              model: Employee, 
              as: "employee",
              include: [

                { model: Occupation, as: "occupation" },
                { model: Management, as: "management" }
              ]
            },
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
        { 
          model: require("../models").Parish, 
          as: "parish",
          include: [
            { 
              model: require("../models").City, 
              as: "city",
              include: [{ model: require("../models").State, as: "state" }]
            }
          ]
        },
        { model: require("../models").AccidentWitness, as: "witnesses" },
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
      witnesses,
      incidentLocation,
      locationType,
      ...rawAccidentData
    } = req.body;
    
    console.log("DATOS RECIBIDOS EN EL BACKEND:", req.body);

    // Sanear los datos para el modelo Accident (evitar campos extra del frontend)
    const accidentData = {
      accidentDate: rawAccidentData.accidentDate,
      accidentTime: rawAccidentData.accidentTime,
      description: req.body.description,
      inpsaselFileNumber: rawAccidentData.inpsaselFileNumber || null,
      status: rawAccidentData.status,
      facilityId: rawAccidentData.facilityId ? parseInt(rawAccidentData.facilityId) : null,
      managementId: rawAccidentData.managementId ? parseInt(rawAccidentData.managementId) : null,
      accidentTypeId: rawAccidentData.accidentTypeId ? parseInt(rawAccidentData.accidentTypeId) : null,
      periodId: rawAccidentData.periodId ? parseInt(rawAccidentData.periodId) : null,
      magnitudeId: rawAccidentData.magnitudeId ? parseInt(rawAccidentData.magnitudeId) : null,
      damageAgentId: rawAccidentData.damageAgentId ? parseInt(rawAccidentData.damageAgentId) : null,
      contactTypeId: rawAccidentData.contactTypeId ? parseInt(rawAccidentData.contactTypeId) : null,
      processStatusId: rawAccidentData.processStatusId ? parseInt(rawAccidentData.processStatusId) : 1,
      customAddressDetails: rawAccidentData.customAddressDetails,
      medicalCenterName: rawAccidentData.medicalCenterName,
      medicalCenterId: rawAccidentData.medicalCenterId ? parseInt(rawAccidentData.medicalCenterId) : null,
      medicalCenterAddress: rawAccidentData.medicalCenterAddress,
      medicalObservations: rawAccidentData.medicalObservations,
      globalObservations: rawAccidentData.globalObservations,

      parishId: rawAccidentData.parishId ? parseInt(rawAccidentData.parishId) : null,
      activity: rawAccidentData.activity,
      workType: rawAccidentData.workType || null,
      hazardCode: rawAccidentData.hazardCode || null,
      contactExposureCode: rawAccidentData.contactExposureCode || null,
      affectationClassCode: rawAccidentData.affectationClassCode || null,
      affectationSubjectCode: rawAccidentData.affectationSubjectCode || null,
      assetsProcessAffectation: rawAccidentData.assetsProcessAffectation || null
    };

    // Asignar el ID del usuario que crea el reporte
    if (req.user) {
      accidentData.userId = req.user.id;
    }

    // 1. Generate INPSASEL File Number automatically if not provided
    if (!accidentData.inpsaselFileNumber) {
      const { Op } = require("sequelize");
      const year = new Date(accidentData.accidentDate).getFullYear();
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const count = await Accident.count({
        where: {
          accidentDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
      const sequence = (count + 1).toString().padStart(4, "0");
      accidentData.inpsaselFileNumber = `INP-${year}-${sequence}`;
    }

    // 2. Create the main accident record
    const newAccident = await Accident.create(accidentData, { transaction: t });

    // 2. Create involved employees records if any
    if (involvedEmployees && Array.isArray(involvedEmployees)) {
      const employeesToCreate = involvedEmployees.map((emp) => ({
        employeePersonalNumber: emp.employeeId || emp.employeePersonalNumber,
        injuryTypeId: emp.injuryTypeId ? parseInt(emp.injuryTypeId) : null,
        magnitudeId: emp.magnitudeId ? parseInt(emp.magnitudeId) : null,
        restDays: emp.restDays !== null ? parseInt(emp.restDays) : null,
        affectedArea: emp.affectedArea || null,
        injuryNature: emp.injuryNature || null,
        injuryLevel: emp.injuryLevel || null,
        injuryConsequence: emp.injuryConsequence || null,
        accidentId: newAccident.id,
      }));
      await EmployeeAccident.bulkCreate(employeesToCreate, { transaction: t });
    }

    // 3. Create document check records if any
    if (documentsCheck && Array.isArray(documentsCheck)) {
      const documentsToCreate = documentsCheck.map((doc) => ({
        documentId: doc.documentId || doc.document_id,
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

    // 5. Create witnesses if any
    if (witnesses && Array.isArray(witnesses)) {
      const witnessesToCreate = witnesses.map((w) => ({
        ...w,
        accidentId: newAccident.id,
      }));
      await AccidentWitness.bulkCreate(witnessesToCreate, { transaction: t });
    }

    await t.commit();

    // Return the created accident with minimal info
    res.status(201).json(newAccident);
  } catch (error) {
    await t.rollback();
    console.error("ERROR CRÍTICO AL CREAR ACCIDENTE:");
    console.error("- Mensaje:", error.message);
    if (error.parent) console.error("- Detalle DB:", error.parent.detail || error.parent.message);
    if (error.errors) console.error("- Validaciones:", error.errors.map(e => e.message));
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
      witnesses,
      incidentLocation,
      locationType,
      ...rawAccidentData
    } = req.body;

    // Sanear los datos para el modelo Accident
    const accidentData = {
      accidentDate: rawAccidentData.accidentDate,
      accidentTime: rawAccidentData.accidentTime,
      description: req.body.description,
      inpsaselFileNumber: rawAccidentData.inpsaselFileNumber,
      status: rawAccidentData.status,
      facilityId: rawAccidentData.facilityId ? parseInt(rawAccidentData.facilityId) : null,
      managementId: rawAccidentData.managementId ? parseInt(rawAccidentData.managementId) : null,
      accidentTypeId: rawAccidentData.accidentTypeId ? parseInt(rawAccidentData.accidentTypeId) : null,
      periodId: rawAccidentData.periodId ? parseInt(rawAccidentData.periodId) : null,
      magnitudeId: rawAccidentData.magnitudeId ? parseInt(rawAccidentData.magnitudeId) : null,
      damageAgentId: rawAccidentData.damageAgentId ? parseInt(rawAccidentData.damageAgentId) : null,
      contactTypeId: rawAccidentData.contactTypeId ? parseInt(rawAccidentData.contactTypeId) : null,
      processStatusId: rawAccidentData.processStatusId ? parseInt(rawAccidentData.processStatusId) : 1,
      customAddressDetails: rawAccidentData.customAddressDetails,
      medicalCenterName: rawAccidentData.medicalCenterName,
      medicalCenterId: rawAccidentData.medicalCenterId ? parseInt(rawAccidentData.medicalCenterId) : null,
      medicalCenterAddress: rawAccidentData.medicalCenterAddress,
      medicalObservations: rawAccidentData.medicalObservations,
      globalObservations: rawAccidentData.globalObservations,

      parishId: rawAccidentData.parishId ? parseInt(rawAccidentData.parishId) : null,
      activity: rawAccidentData.activity,
      workType: rawAccidentData.workType || null,
      hazardCode: rawAccidentData.hazardCode || null,
      contactExposureCode: rawAccidentData.contactExposureCode || null,
      affectationClassCode: rawAccidentData.affectationClassCode || null,
      affectationSubjectCode: rawAccidentData.affectationSubjectCode || null,
      assetsProcessAffectation: rawAccidentData.assetsProcessAffectation || null
    };

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
          employeePersonalNumber: emp.employeeId || emp.employeePersonalNumber,
          injuryTypeId: emp.injuryTypeId ? parseInt(emp.injuryTypeId) : null,
          magnitudeId: emp.magnitudeId ? parseInt(emp.magnitudeId) : null,
          restDays: emp.restDays !== null ? parseInt(emp.restDays) : null,
          affectedArea: emp.affectedArea || null,
          injuryNature: emp.injuryNature || null,
          injuryLevel: emp.injuryLevel || null,
          injuryConsequence: emp.injuryConsequence || null,
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
          documentId: doc.documentId || doc.document_id,
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

    // 5. Update witnesses (Clear and re-create)
    if (witnesses) {
      await AccidentWitness.destroy({ where: { accidentId: id }, transaction: t });
      if (Array.isArray(witnesses)) {
        const witnessesToCreate = witnesses.map((w) => ({
          ...w,
          accidentId: id,
        }));
        await AccidentWitness.bulkCreate(witnessesToCreate, { transaction: t });
      }
    }

    await t.commit();
    res.status(200).json(accident);
  } catch (error) {
    await t.rollback();
    console.error("ERROR CRÍTICO AL ACTUALIZAR ACCIDENTE:");
    console.error("- Mensaje:", error.message);
    if (error.parent) console.error("- Detalle DB:", error.parent.detail || error.parent.message);
    if (error.errors) console.error("- Validaciones:", error.errors.map(e => e.message));
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

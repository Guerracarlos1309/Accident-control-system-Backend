const {
  Employee,
  JobTitle,
  Occupation,
  Management,
  Inspection,
  ExtinguisherInspection,
  ExtinguisherDetail,
  VehicleInspection,
  InspectionDetail,
  InspectionStatus,
  Location,
  Vehicle,
  AgentType,
  VehicleAccessory,
  Model,
  Brand,
  Facility,
  ProtectionInspection,
  ProtectionInspectionDetails,
  ProtectionEquipmentCategory,
  Accident,
  AccidentType,
  Period,
  User,
  DamageAgent,
  ContactType,
  EmployeeAccident,
  AccidentDocumentCheck,
  AccidentAffectationDetail,
  InjuryType,
  Magnitude,
  Affectation,
  AffectationSubject,
  FileDocument,
  InstallationType,
  AccidentWitness,
  Parish,
  City,
  State,
  MedicalCenter
} = require("../models");
const PdfGenerator = require("../utils/pdfGenerator");

/**
 * Download Active Employees (Payroll/Roster) list PDF
 */
exports.downloadPayrollReport = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      where: { status: 1 },
      include: [
        { model: JobTitle, as: "jobTitle" },
        { model: Occupation, as: "occupation" },
        { model: Management, as: "management" },
      ],
      order: [["lastName", "ASC"], ["firstName", "ASC"]]
    });

    const pdfBuffer = await PdfGenerator.generatePayrollPdf(employees);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=nomina_personal.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating payroll PDF:", error);
    next(error);
  }
};

/**
 * Download a specific Accident Report PDF by ID
 */
exports.downloadAccidentReport = async (req, res, next) => {
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
          model: Parish, 
          as: "parish",
          include: [
            { 
              model: City, 
              as: "city",
              include: [{ model: State, as: "state" }]
            }
          ]
        },
        { model: AccidentWitness, as: "witnesses" },
        { model: MedicalCenter, as: "medicalCenter" }
      ],
    });

    if (!accident) {
      return res.status(404).json({ message: "Registro de accidente no encontrado" });
    }

    const pdfBuffer = await PdfGenerator.generateAccidentPdf(accident);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=accidente_${accident.inpsaselFileNumber || accident.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating accident PDF:", error);
    next(error);
  }
};

/**
 * Download a specific Inspection Report PDF by ID
 */
exports.downloadInspectionReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inspection = await Inspection.findByPk(id, {
      include: [
        { 
          model: Facility, 
          as: "facility",
          include: [{ model: Location, as: "location" }]
        },
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
        {
          model: ProtectionInspection,
          as: "protectionInspection",
          include: [
            {
              model: ProtectionInspectionDetails,
              as: "details",
              include: [{ model: ProtectionEquipmentCategory, as: "category" }]
            },
            { model: Employee, as: "responsible" }
          ]
        }
      ],
    });

    if (!inspection) {
      return res.status(404).json({ message: "Reporte de inspección no encontrado" });
    }

    const pdfBuffer = await PdfGenerator.generateInspectionPdf(inspection);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=inspeccion_${inspection.inspectionNumber || inspection.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating inspection PDF:", error);
    next(error);
  }
};

/**
 * Download List of all Accidents PDF
 */
exports.downloadAccidentsListReport = async (req, res, next) => {
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
        { model: InspectionStatus, as: "processStatus" },
        { model: Management, as: "management" }
      ],
      order: [["id", "DESC"]],
    });

    const pdfBuffer = await PdfGenerator.generateAccidentsListPdf(accidents);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=listado_accidentes.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating accidents list PDF:", error);
    next(error);
  }
};

/**
 * Download List of all Inspections PDF
 */
exports.downloadInspectionsListReport = async (req, res, next) => {
  try {
    const inspections = await Inspection.findAll({
      include: [
        { 
          model: Facility, 
          as: "facility",
          include: [{ model: Location, as: "location" }]
        },
        { model: Employee, as: "inspector" },
        { model: InspectionStatus, as: "status" },
        { model: VehicleInspection, as: "vehicleInspection" },
        { model: ExtinguisherInspection, as: "extinguisherInspection" },
        { model: ProtectionInspection, as: "protectionInspection" },
      ],
      order: [["created_at", "DESC"]],
    });

    const pdfBuffer = await PdfGenerator.generateInspectionsListPdf(inspections);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=listado_inspecciones.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating inspections list PDF:", error);
    next(error);
  }
};

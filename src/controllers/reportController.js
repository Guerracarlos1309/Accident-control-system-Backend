const { Op } = require("sequelize");
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
  MedicalCenter,
  sequelize
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

    const columns = req.query.columns ? req.query.columns.split(",") : null;
    const pdfBuffer = await PdfGenerator.generatePayrollPdf(employees, columns);

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
        { model: Magnitude, as: "magnitude" },
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
                { model: Management, as: "management" },
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
        { model: Management, as: "management" },
        { model: Magnitude, as: "magnitude" },
        {
          model: EmployeeAccident,
          as: "involvedEmployees",
          include: [{ model: Employee, as: "employee" }]
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
        }
      ],
      order: [["accidentDate", "ASC"], ["id", "ASC"]],
    });

    const columns = req.query.columns ? req.query.columns.split(",") : null;
    const pdfBuffer = await PdfGenerator.generateAccidentsListPdf(accidents, columns);

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
      order: [["date", "ASC"], ["created_at", "ASC"]],
    });

    const columns = req.query.columns ? req.query.columns.split(",") : null;
    const pdfBuffer = await PdfGenerator.generateInspectionsListPdf(inspections, columns);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=listado_inspecciones.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating inspections list PDF:", error);
    next(error);
  }
};

/**
 * Generate a custom, dynamically filtered report PDF (by dates, management, facility, types, status)
 * Or returns JSON preview of filtered records if preview=true
 */
exports.downloadCustomReport = async (req, res, next) => {
  try {
    const { 
      reportType, 
      startDate, 
      endDate, 
      managementId, 
      facilityId, 
      accidentTypeId, 
      magnitudeId,
      inspectionType, 
      isScheduled,
      preview,
      ids
    } = req.query;

    if (!reportType) {
      return res.status(400).json({ message: "El parámetro reportType es requerido (accidents o inspections)" });
    }

    // Build base date filter if provided
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter[Op.between] = [startDate, endDate];
    } else if (startDate) {
      dateFilter[Op.gte] = startDate;
    } else if (endDate) {
      dateFilter[Op.lte] = endDate;
    }

    if (reportType === "accidents") {
      const whereClause = {};
      if (ids) {
        whereClause.id = { [Op.in]: ids.split(",").map(Number) };
      } else {
        if (startDate || endDate) {
          whereClause.accidentDate = dateFilter;
        }
        if (managementId) {
          whereClause[Op.or] = [
            { managementId: managementId },
            sequelize.literal(`EXISTS (
              SELECT 1 FROM employee_accident AS ea
              INNER JOIN employee AS e ON ea.employee_id = e.personal_number
              WHERE ea.accident_id = Accident.id AND e.management_id = ${parseInt(managementId)}
            )`)
          ];
        }
        if (accidentTypeId) {
          whereClause.accidentTypeId = accidentTypeId;
        }
        if (magnitudeId) {
          whereClause.magnitudeId = magnitudeId;
        }
      }

      const accidents = await Accident.findAll({
        where: whereClause,
        include: [
          { 
            model: Facility, 
            as: "facility",
            include: ["location", "installationType"]
          },
          { model: AccidentType, as: "type" },
          { model: Period, as: "period" },
          { model: InspectionStatus, as: "processStatus" },
          { model: Management, as: "management" },
          { model: Magnitude, as: "magnitude" },
          {
            model: EmployeeAccident,
            as: "involvedEmployees",
            include: [{ model: Employee, as: "employee" }]
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
          }
        ],
        order: [["accidentDate", "ASC"], ["id", "ASC"]],
      });

      if (preview === "true") {
        return res.json(accidents);
      }

      const columns = req.query.columns ? req.query.columns.split(",") : null;
      const pdfBuffer = await PdfGenerator.generateAccidentsListPdf(accidents, columns);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=reporte_personalizado_accidentes.pdf");
      return res.send(pdfBuffer);
    } 
    
    if (reportType === "inspections") {
      const whereClause = {};
      if (ids) {
        whereClause.id = { [Op.in]: ids.split(",").map(Number) };
      } else {
        if (startDate || endDate) {
          whereClause.date = dateFilter;
        }
        if (facilityId) {
          whereClause.facilityId = facilityId;
        }
        if (isScheduled !== undefined && isScheduled !== "") {
          whereClause.isScheduled = isScheduled === "true";
        }
      }

      // Build dynamic associations based on inspectionType filter
      const includeArray = [
        { 
          model: Facility, 
          as: "facility",
          include: [{ model: Location, as: "location" }]
        },
        { model: Employee, as: "inspector" },
        { model: InspectionStatus, as: "status" },
      ];

      const extinguisherInclude = { model: ExtinguisherInspection, as: "extinguisherInspection", required: false };
      const vehicleInclude = { model: VehicleInspection, as: "vehicleInspection", required: false };
      const protectionInclude = { model: ProtectionInspection, as: "protectionInspection", required: false };

      if (inspectionType === "extinguishers") {
        extinguisherInclude.required = true;
      } else if (inspectionType === "vehicles") {
        vehicleInclude.required = true;
      } else if (inspectionType === "protection") {
        protectionInclude.required = true;
      }

      includeArray.push(extinguisherInclude, vehicleInclude, protectionInclude);

      const inspections = await Inspection.findAll({
        where: whereClause,
        include: includeArray,
        order: [["date", "ASC"], ["created_at", "ASC"]],
      });

      if (preview === "true") {
        return res.json(inspections);
      }

      const columns = req.query.columns ? req.query.columns.split(",") : null;
      const pdfBuffer = await PdfGenerator.generateInspectionsListPdf(inspections, columns);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=reporte_personalizado_inspecciones.pdf");
      return res.send(pdfBuffer);
    }

    return res.status(400).json({ message: "Tipo de reporte no soportado" });
  } catch (error) {
    console.error("Error generating custom report PDF:", error);
    next(error);
  }
};

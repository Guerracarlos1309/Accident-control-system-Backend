const { FacilityInspectionCode, Facility, Location } = require('../models');
const PdfGenerator = require('../utils/pdfGenerator');
const { Op } = require('sequelize');

// Get all codes, optionally filtered by facilityId
exports.getFacilityCodes = async (req, res, next) => {
  try {
    const { facilityId } = req.query;
    const where = {};
    if (facilityId) {
      where.facilityId = facilityId;
    }

    const records = await FacilityInspectionCode.findAll({
      where,
      include: [
        {
          model: Facility,
          as: 'facility',
          include: [{ model: Location, as: 'location' }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

// Get the next sequence and code for a given type and year
exports.getNextCode = async (req, res, next) => {
  try {
    const { type, year } = req.query;
    if (!type || !year) {
      return res.status(400).json({ message: 'El tipo (' + type + ') y el año (' + year + ') son requeridos' });
    }

    const typeUpper = type.toUpperCase();
    if (typeUpper !== 'I' && typeUpper !== 'M') {
      return res.status(400).json({ message: 'El tipo debe ser I (Inspección) o M (Mantenimiento)' });
    }

    const yearInt = parseInt(year);

    // Find the record with the maximum sequence for this type and year
    const lastRecord = await FacilityInspectionCode.findOne({
      where: {
        type: typeUpper,
        year: yearInt
      },
      order: [['sequence', 'DESC']]
    });

    const nextSeq = lastRecord ? lastRecord.sequence + 1 : 1;
    const paddedSeq = String(nextSeq).padStart(3, '0');
    const generatedCode = `ASHO-TAC-${typeUpper}-${paddedSeq}/${yearInt}`;

    res.status(200).json({
      sequence: nextSeq,
      code: generatedCode
    });
  } catch (error) {
    next(error);
  }
};

// Create a new code record
exports.createFacilityCode = async (req, res, next) => {
  try {
    const { facilityId, type, sequence, year, code, date, notes } = req.body;
    console.log("createFacilityCode body:", req.body);

    const missing = [];
    if (!facilityId || isNaN(parseInt(facilityId))) missing.push(`facilityId (${facilityId})`);
    if (!type) missing.push(`type (${type})`);
    if (sequence === undefined || sequence === null || isNaN(parseInt(sequence))) missing.push(`sequence (${sequence})`);
    if (year === undefined || year === null || isNaN(parseInt(year))) missing.push(`year (${year})`);
    if (!code) missing.push(`code (${code})`);

    if (missing.length > 0) {
      console.error("Validation failed for createFacilityCode:", missing);
      return res.status(400).json({ message: `Faltan campos obligatorios o son inválidos: ${missing.join(', ')}` });
    }

    const typeUpper = type.toUpperCase();

    // Check if the code already exists (must be unique)
    const existingCode = await FacilityInspectionCode.findOne({
      where: { code: code.toUpperCase() }
    });

    if (existingCode) {
      return res.status(400).json({ message: `El código "${code}" ya está registrado en el sistema. Debe ser único.` });
    }

    const newRecord = await FacilityInspectionCode.create({
      facilityId,
      type: typeUpper,
      sequence: parseInt(sequence),
      year: parseInt(year),
      code: code.toUpperCase(),
      date: date || new Date(),
      notes
    });

    // Fetch complete record with facility details for frontend
    const completeRecord = await FacilityInspectionCode.findByPk(newRecord.id, {
      include: [
        {
          model: Facility,
          as: 'facility',
          include: [{ model: Location, as: 'location' }]
        }
      ]
    });

    res.status(201).json(completeRecord);
  } catch (error) {
    next(error);
  }
};

// Update an existing code record
exports.updateFacilityCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { facilityId, type, sequence, year, code, date, notes } = req.body;

    const record = await FacilityInspectionCode.findByPk(id);
    if (!record) {
      return res.status(404).json({ message: 'Registro de código no encontrado' });
    }

    if (code) {
      const codeUpper = code.toUpperCase();
      // Check uniqueness if changing the code
      if (codeUpper !== record.code) {
        const existingCode = await FacilityInspectionCode.findOne({
          where: { code: codeUpper }
        });
        if (existingCode) {
          return res.status(400).json({ message: `El código "${code}" ya está registrado en el sistema. Debe ser único.` });
        }
        record.code = codeUpper;
      }
    }

    if (facilityId) record.facilityId = facilityId;
    if (type) record.type = type.toUpperCase();
    if (sequence) record.sequence = parseInt(sequence);
    if (year) record.year = parseInt(year);
    if (date) record.date = date;
    if (notes !== undefined) record.notes = notes;

    await record.save();

    const completeRecord = await FacilityInspectionCode.findByPk(record.id, {
      include: [
        {
          model: Facility,
          as: 'facility',
          include: [{ model: Location, as: 'location' }]
        }
      ]
    });

    res.status(200).json(completeRecord);
  } catch (error) {
    next(error);
  }
};

// Delete a code record
exports.deleteFacilityCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await FacilityInspectionCode.findByPk(id);
    if (!record) {
      return res.status(404).json({ message: 'Registro de código no encontrado' });
    }

    await record.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Download combined PDF: code record metadata + resumen/notes + all inspections for that facility
exports.downloadFacilityCodeReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch the code record with facility details
    const record = await FacilityInspectionCode.findByPk(id, {
      include: [
        {
          model: Facility,
          as: 'facility',
          include: [{ model: Location, as: 'location' }]
        }
      ]
    });

    if (!record) {
      return res.status(404).json({ message: 'Registro de código no encontrado' });
    }

    // 2. Fetch all inspections for that same facility
    const { Inspection, Employee, InspectionStatus, VehicleInspection, ExtinguisherInspection, ProtectionInspection } = require('../models');
    const inspections = await Inspection.findAll({
      where: { facilityId: record.facilityId },
      include: [
        { model: Employee, as: 'inspector' },
        { model: InspectionStatus, as: 'status' },
        { model: VehicleInspection, as: 'vehicleInspection', required: false },
        { model: ExtinguisherInspection, as: 'extinguisherInspection', required: false },
        { model: ProtectionInspection, as: 'protectionInspection', required: false },
      ],
      order: [['date', 'DESC'], ['created_at', 'DESC']]
    });

    // 3. Generate combined PDF
    const pdfBuffer = await PdfGenerator.generateFacilityFullReport(record, inspections);

    const safeName = record.code.replace(/[^a-zA-Z0-9\-_]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=informe_completo_${safeName}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating facility full report PDF:', error);
    next(error);
  }
};

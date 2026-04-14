const { 
  ProtectionType, 
  ProtectionEquipmentCategory, 
  ProtectionEquipment, 
  ProtectionInspection, 
  ProtectionInspectionDetails,
  Employee,
  Inspection
} = require('../models');

// Equipment Categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await ProtectionEquipmentCategory.findAll({
      include: [{ model: ProtectionType, as: 'type' }]
    });
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// Equipment Inventory
exports.getEquipment = async (req, res, next) => {
  try {
    const equipment = await ProtectionEquipment.findAll({
      include: [{ model: ProtectionEquipmentCategory, as: 'category' }]
    });
    res.status(200).json(equipment);
  } catch (error) {
    next(error);
  }
};

exports.updateEquipment = async (req, res, next) => {
  try {
    const equip = await ProtectionEquipment.findByPk(req.params.id);
    if (!equip) return res.status(404).json({ message: 'Equipment not found' });
    await equip.update(req.body);
    res.status(200).json(equip);
  } catch (error) {
    next(error);
  }
};

exports.deleteEquipment = async (req, res, next) => {
  try {
    const equip = await ProtectionEquipment.findByPk(req.params.id);
    if (!equip) return res.status(404).json({ message: 'Equipment not found' });
    await equip.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Protection Inspections
exports.createProtectionInspection = async (req, res, next) => {
  try {
    const { details, ...header } = req.body;
    const newInspection = await ProtectionInspection.create(header);
    
    if (details && details.length > 0) {
      const detailsWithId = details.map(d => ({ 
        ...d, 
        protectionInspectionId: newInspection.id 
      }));
      await ProtectionInspectionDetails.bulkCreate(detailsWithId);
    }
    
    res.status(201).json(newInspection);
  } catch (error) {
    next(error);
  }
};

exports.updateProtectionInspection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { details, ...header } = req.body;
    const inspection = await ProtectionInspection.findByPk(id);
    
    if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
    
    await inspection.update(header);
    
    if (details) {
      await ProtectionInspectionDetails.destroy({ where: { protectionInspectionId: id } });
      if (Array.isArray(details) && details.length > 0) {
        const detailsWithId = details.map(d => ({ 
          ...d, 
          protectionInspectionId: id 
        }));
        await ProtectionInspectionDetails.bulkCreate(detailsWithId);
      }
    }
    
    res.status(200).json(inspection);
  } catch (error) {
    next(error);
  }
};

exports.deleteProtectionInspection = async (req, res, next) => {
  try {
    const inspection = await ProtectionInspection.findByPk(req.params.id);
    if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
    await inspection.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.getProtectionInspections = async (req, res, next) => {
  try {
    const inspections = await ProtectionInspection.findAll({
      include: [
        { model: Employee, as: 'responsible' },
        { 
          model: ProtectionInspectionDetails, 
          as: 'details', 
          include: [{ model: ProtectionEquipmentCategory, as: 'category' }] 
        }
      ]
    });
    res.status(200).json(inspections);
  } catch (error) {
    next(error);
  }
};


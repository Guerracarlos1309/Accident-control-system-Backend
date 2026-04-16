const {
  AccidentType,
  Magnitude,
  Period,
  FileDocument,
  AffectationSubject,
  Affectation,
  ContactType,
  DamageAgent,
  InjuryType,
  InstallationType,
  ProtectionType,
  Occupation,
  Department,
  JobTitle,
  Brand,
  Model,
  VehicleType,
  VehicleAccessory,
  AgentType,
  InspectionStatus,
  ProtectionEquipmentCategory,
} = require("../models");

// Hierarchical fetch (Top level + children)
const getHierarchy = (Model) => async (req, res, next) => {
  try {
    const data = await Model.findAll({
      where: { parent_id: null },
      include: [{ model: Model, as: "children" }],
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// Simple fetch
const getList = (Model) => async (req, res, next) => {
  try {
    const data = await Model.findAll({
      order: [["id", "ASC"]],
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// Handle creation of lookup data
const createItem = (Model) => async (req, res, next) => {
  try {
    const newItem = await Model.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

// Handle update of lookup data
const updateItem = (Model) => async (req, res, next) => {
  try {
    const item = await Model.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    await item.update(req.body);
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

// Handle deletion of lookup data
const deleteItem = (Model) => async (req, res, next) => {
  try {
    const item = await Model.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    await item.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Exported methods for Accidents
exports.getAccidentTypes = getHierarchy(AccidentType);
exports.createAccidentType = createItem(AccidentType);
exports.updateAccidentType = updateItem(AccidentType);
exports.deleteAccidentType = deleteItem(AccidentType);

exports.getMagnitudes = getList(Magnitude);
exports.createMagnitude = createItem(Magnitude);
exports.updateMagnitude = updateItem(Magnitude);
exports.deleteMagnitude = deleteItem(Magnitude);

exports.getPeriods = getList(Period);
exports.createPeriod = createItem(Period);
exports.updatePeriod = updateItem(Period);
exports.deletePeriod = deleteItem(Period);

exports.getFileDocuments = getList(FileDocument);
exports.createFileDocument = createItem(FileDocument);
exports.updateFileDocument = updateItem(FileDocument);
exports.deleteFileDocument = deleteItem(FileDocument);

exports.getAffectationSubjects = getHierarchy(AffectationSubject);
exports.createAffectationSubject = createItem(AffectationSubject);
exports.updateAffectationSubject = updateItem(AffectationSubject);
exports.deleteAffectationSubject = deleteItem(AffectationSubject);

exports.getAffectations = getHierarchy(Affectation);
exports.createAffectation = createItem(Affectation);
exports.updateAffectation = updateItem(Affectation);
exports.deleteAffectation = deleteItem(Affectation);

exports.getContactTypes = getHierarchy(ContactType);
exports.createContactType = createItem(ContactType);
exports.updateContactType = updateItem(ContactType);
exports.deleteContactType = deleteItem(ContactType);

exports.getDamageAgents = getHierarchy(DamageAgent);
exports.createDamageAgent = createItem(DamageAgent);
exports.updateDamageAgent = updateItem(DamageAgent);
exports.deleteDamageAgent = deleteItem(DamageAgent);

exports.getInjuryTypes = getList(InjuryType);
exports.createInjuryType = createItem(InjuryType);
exports.updateInjuryType = updateItem(InjuryType);
exports.deleteInjuryType = deleteItem(InjuryType);

// Human Resources Lookups
exports.getOccupations = getList(Occupation);
exports.createOccupation = createItem(Occupation);
exports.updateOccupation = updateItem(Occupation);
exports.deleteOccupation = deleteItem(Occupation);

exports.getDepartments = getList(Department);
exports.createDepartment = createItem(Department);
exports.updateDepartment = updateItem(Department);
exports.deleteDepartment = deleteItem(Department);

exports.getJobTitles = getList(JobTitle);
exports.createJobTitle = createItem(JobTitle);
exports.updateJobTitle = updateItem(JobTitle);
exports.deleteJobTitle = deleteItem(JobTitle);

// Facility & Geographic Lookups
exports.getInstallationTypes = getList(InstallationType);
exports.createInstallationType = createItem(InstallationType);
exports.updateInstallationType = updateItem(InstallationType);
exports.deleteInstallationType = deleteItem(InstallationType);

// Vehicle Lookups
exports.getBrands = getList(Brand);
exports.createBrand = createItem(Brand);
exports.updateBrand = updateItem(Brand);
exports.deleteBrand = deleteItem(Brand);

exports.getModels = async (req, res, next) => {
  try {
    const models = await Model.findAll({
      include: [{ model: Brand, as: "brand" }],
      order: [["id", "ASC"]],
    });
    res.status(200).json(models);
  } catch (error) {
    next(error);
  }
};
exports.createModel = createItem(Model);
exports.updateModel = updateItem(Model);
exports.deleteModel = deleteItem(Model);

exports.getVehicleTypes = getList(VehicleType);
exports.createVehicleType = createItem(VehicleType);
exports.updateVehicleType = updateItem(VehicleType);
exports.deleteVehicleType = deleteItem(VehicleType);

exports.getVehicleAccessories = getList(VehicleAccessory);
exports.createVehicleAccessory = createItem(VehicleAccessory);
exports.updateVehicleAccessory = updateItem(VehicleAccessory);
exports.deleteVehicleAccessory = deleteItem(VehicleAccessory);

// Inspection Lookups
exports.getAgentTypes = getList(AgentType);
exports.createAgentType = createItem(AgentType);
exports.updateAgentType = updateItem(AgentType);
exports.deleteAgentType = deleteItem(AgentType);

exports.getInspectionStatus = getList(InspectionStatus);
exports.createInspectionStatus = createItem(InspectionStatus);
exports.updateInspectionStatus = updateItem(InspectionStatus);
exports.deleteInspectionStatus = deleteItem(InspectionStatus);

// Protection Lookups
exports.getProtectionTypes = getList(ProtectionType);
exports.createProtectionType = createItem(ProtectionType);
exports.updateProtectionType = updateItem(ProtectionType);
exports.deleteProtectionType = deleteItem(ProtectionType);

exports.getProtectionEquipmentCategories = getList(ProtectionEquipmentCategory);
exports.createProtectionEquipmentCategory = createItem(ProtectionEquipmentCategory);
exports.updateProtectionEquipmentCategory = updateItem(ProtectionEquipmentCategory);
exports.deleteProtectionEquipmentCategory = deleteItem(ProtectionEquipmentCategory);


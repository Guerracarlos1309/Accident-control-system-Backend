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
} = require("../models");

// Hierarchical fetch (Top level + children)
const getHierarchy = (Model) => async (req, res, next) => {
  try {
    const data = await Model.findAll({
      where: { parentId: null },
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

//  Exported methods

exports.getAccidentTypes = getHierarchy(AccidentType);
exports.getMagnitudes = getList(Magnitude);
exports.getPeriods = getList(Period);
exports.getFileDocuments = getList(FileDocument);
exports.getAffectationSubjects = getHierarchy(AffectationSubject);
exports.getAffectations = getHierarchy(Affectation);
exports.getContactTypes = getHierarchy(ContactType);
exports.getDamageAgents = getHierarchy(DamageAgent);
exports.getInjuryTypes = getList(InjuryType);
exports.getInstallationTypes = getList(InstallationType);
exports.getProtectionTypes = getList(ProtectionType);

/*
  Handle creation of lookup data (Admin only)
 */
exports.createLookupItem = (Model) => async (req, res, next) => {
  try {
    const newItem = await Model.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

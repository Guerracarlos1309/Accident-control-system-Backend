const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Occupation = require('./Occupation');
const Department = require('./Department');
const JobTitle = require('./JobTitle');
const Employee = require('./Employee');
const State = require('./State');
const City = require('./City');
const Parish = require('./Parish');
const Location = require('./Location');

// Accident & Incident Module Models
const Accident = require('./Accident');
const AccidentType = require('./AccidentType');
const Magnitude = require('./Magnitude');
const Period = require('./Period');
const FileDocument = require('./FileDocument');
const AccidentDocumentCheck = require('./AccidentDocumentCheck');
const AccidentAffectationDetail = require('./AccidentAffectationDetail');
const AffectationSubject = require('./AffectationSubject');
const Affectation = require('./Affectation');
const ContactType = require('./ContactType');
const DamageAgent = require('./DamageAgent');
const EmployeeAccident = require('./EmployeeAccident');
const InjuryType = require('./InjuryType');

// Inspections, Vehicles & Facilities Module Models
const Brand = require('./Brand');
const Model = require('./Model');
const VehicleType = require('./VehicleType');
const Vehicle = require('./Vehicle');
const VehicleImage = require('./VehicleImage');
const VehicleAccessory = require('./VehicleAccessory');
const InspectionStatus = require('./InspectionStatus');
const Inspection = require('./Inspection');
const AgentType = require('./AgentType');
const ExtinguisherInspection = require('./ExtinguisherInspection');
const ExtinguisherDetail = require('./ExtinguisherDetail');
const VehicleInspection = require('./VehicleInspection');
const InspectionDetail = require('./InspectionDetail');

// New Module Models (Facility & Protection)
const InstallationType = require('./InstallationType');
const Facility = require('./Facility');
const ProtectionType = require('./ProtectionType');
const ProtectionEquipmentCategory = require('./ProtectionEquipmentCategory');
const ProtectionEquipment = require('./ProtectionEquipment');
const ProtectionInspection = require('./ProtectionInspection');
const ProtectionInspectionDetails = require('./ProtectionInspectionDetails');

// --- Associations ---

// User - Role
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// Employee - Department, JobTitle, Occupation
Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'employees' });

Employee.belongsTo(JobTitle, { foreignKey: 'jobTitleId', as: 'jobTitle' });
JobTitle.hasMany(Employee, { foreignKey: 'jobTitleId', as: 'employees' });

Employee.belongsTo(Occupation, { foreignKey: 'occupationId', as: 'occupation' });
Occupation.hasMany(Employee, { foreignKey: 'occupationId', as: 'employees' });

// Geographic Location Associations
State.hasMany(City, { foreignKey: 'state_id', as: 'cities' });
City.belongsTo(State, { foreignKey: 'state_id', as: 'state' });

City.hasMany(Parish, { foreignKey: 'city_id', as: 'parishes' });
Parish.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

Parish.hasMany(Location, { foreignKey: 'parish_id', as: 'locations' });
Location.belongsTo(Parish, { foreignKey: 'parish_id', as: 'parish' });

// Facility Associations
Location.hasMany(Facility, { foreignKey: 'location_id', as: 'facilities' });
Facility.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

InstallationType.hasMany(Facility, { foreignKey: 'installation_type_id', as: 'facilities' });
Facility.belongsTo(InstallationType, { foreignKey: 'installation_type_id', as: 'installationType' });

// --- Accidents & Incidents Associations ---

// Hierarchical Tables (Allow Null parentId)
AccidentType.belongsTo(AccidentType, { foreignKey: 'parent_id', as: 'parent' });
AccidentType.hasMany(AccidentType, { foreignKey: 'parent_id', as: 'children' });

AffectationSubject.belongsTo(AffectationSubject, { foreignKey: 'parent_id', as: 'parent' });
AffectationSubject.hasMany(AffectationSubject, { foreignKey: 'parent_id', as: 'children' });

Affectation.belongsTo(Affectation, { foreignKey: 'parent_id', as: 'parent' });
Affectation.hasMany(Affectation, { foreignKey: 'parent_id', as: 'children' });

ContactType.belongsTo(ContactType, { foreignKey: 'parent_id', as: 'parent' });
ContactType.hasMany(ContactType, { foreignKey: 'parent_id', as: 'children' });

DamageAgent.belongsTo(DamageAgent, { foreignKey: 'parent_id', as: 'parent' });
DamageAgent.hasMany(DamageAgent, { foreignKey: 'parent_id', as: 'children' });

// Accident Main Table Relationships
Accident.belongsTo(Facility, { foreignKey: 'facility_id', as: 'facility' });
Facility.hasMany(Accident, { foreignKey: 'facility_id', as: 'accidents' });
Accident.belongsTo(AccidentType, { foreignKey: 'accident_type_id', as: 'type' });
Accident.belongsTo(Period, { foreignKey: 'period_id', as: 'period' });
Accident.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Accident.belongsTo(DamageAgent, { foreignKey: 'damage_agent_id', as: 'damageAgent' });
Accident.belongsTo(ContactType, { foreignKey: 'contact_type_id', as: 'contactType' });

// Accident Details
Accident.hasMany(AccidentDocumentCheck, { foreignKey: 'accident_id', as: 'documentsCheck' });
AccidentDocumentCheck.belongsTo(FileDocument, { foreignKey: 'document_id', as: 'document' });

Accident.hasMany(AccidentAffectationDetail, { foreignKey: 'accident_id', as: 'affectationDetails' });
AccidentAffectationDetail.belongsTo(Affectation, { foreignKey: 'affectation_id', as: 'affectation' });
AccidentAffectationDetail.belongsTo(AffectationSubject, { foreignKey: 'affectation_subject_id', as: 'subject' });
AccidentAffectationDetail.belongsTo(Magnitude, { foreignKey: 'magnitude_id', as: 'magnitude' });

Accident.hasMany(EmployeeAccident, { foreignKey: 'accident_id', as: 'involvedEmployees' });
EmployeeAccident.belongsTo(Employee, { foreignKey: 'employee_id', targetKey: 'personalNumber', as: 'employee' });
EmployeeAccident.belongsTo(InjuryType, { foreignKey: 'injury_type_id', as: 'injuryType' });
EmployeeAccident.belongsTo(Magnitude, { foreignKey: 'magnitude_id', as: 'magnitude' });

// --- Inspections & Vehicles Associations ---

// Vehicles
Brand.hasMany(Model, { foreignKey: 'brand_id', as: 'models' });
Model.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

Model.hasMany(Vehicle, { foreignKey: 'model_id', as: 'vehicles' });
Vehicle.belongsTo(Model, { foreignKey: 'model_id', as: 'model' });

VehicleType.hasMany(Vehicle, { foreignKey: 'vehicle_type_id', as: 'vehicles' });
Vehicle.belongsTo(VehicleType, { foreignKey: 'vehicle_type_id', as: 'type' });

Vehicle.hasMany(VehicleImage, { foreignKey: 'plate_id', sourceKey: 'plate', as: 'images' });
VehicleImage.belongsTo(Vehicle, { foreignKey: 'plate_id', targetKey: 'plate', as: 'vehicle' });

// Inspections
Facility.hasMany(Inspection, { foreignKey: 'facility_id', as: 'inspections' });
Inspection.belongsTo(Facility, { foreignKey: 'facility_id', as: 'facility' });

Employee.hasMany(Inspection, { foreignKey: 'employee_id', targetKey: 'personalNumber', as: 'performedInspections' });
Inspection.belongsTo(Employee, { foreignKey: 'employee_id', targetKey: 'personalNumber', as: 'inspector' });

InspectionStatus.hasMany(Inspection, { foreignKey: 'status_id', as: 'inspections' });
Inspection.belongsTo(InspectionStatus, { foreignKey: 'status_id', as: 'status' });

// Specialized Inspections
Inspection.hasOne(ExtinguisherInspection, { foreignKey: 'inspection_id', as: 'extinguisherInspection' });
ExtinguisherInspection.belongsTo(Inspection, { foreignKey: 'inspection_id' });

ExtinguisherInspection.hasMany(ExtinguisherDetail, { foreignKey: 'extinguisher_inspection_id', as: 'details' });
ExtinguisherDetail.belongsTo(ExtinguisherInspection, { foreignKey: 'extinguisher_inspection_id' });

AgentType.hasMany(ExtinguisherDetail, { foreignKey: 'agent_type_id', as: 'details' });
ExtinguisherDetail.belongsTo(AgentType, { foreignKey: 'agent_type_id', as: 'agentType' });

Inspection.hasOne(VehicleInspection, { foreignKey: 'inspection_id', as: 'vehicleInspection' });
VehicleInspection.belongsTo(Inspection, { foreignKey: 'inspection_id' });

Vehicle.hasMany(VehicleInspection, { foreignKey: 'plate_id', sourceKey: 'plate', as: 'inspections' });
VehicleInspection.belongsTo(Vehicle, { foreignKey: 'plate_id', targetKey: 'plate', as: 'vehicle' });

VehicleInspection.hasMany(InspectionDetail, { foreignKey: 'vehicle_inspection_id', as: 'accessoryChecks' });
InspectionDetail.belongsTo(VehicleInspection, { foreignKey: 'vehicle_inspection_id' });

VehicleAccessory.hasMany(InspectionDetail, { foreignKey: 'accessory_id', as: 'checks' });
InspectionDetail.belongsTo(VehicleAccessory, { foreignKey: 'accessory_id', as: 'accessory' });

// --- Protection Module Associations ---

ProtectionType.hasMany(ProtectionEquipmentCategory, { foreignKey: 'protection_type_id', as: 'categories' });
ProtectionEquipmentCategory.belongsTo(ProtectionType, { foreignKey: 'protection_type_id', as: 'type' });

ProtectionEquipmentCategory.hasMany(ProtectionEquipment, { foreignKey: 'category_id', as: 'equipment' });
ProtectionEquipment.belongsTo(ProtectionEquipmentCategory, { foreignKey: 'category_id', as: 'category' });

Inspection.hasOne(ProtectionInspection, { foreignKey: 'inspection_id', as: 'protectionInspection' });
ProtectionInspection.belongsTo(Inspection, { foreignKey: 'inspection_id' });

Employee.hasMany(ProtectionInspection, { foreignKey: 'responsible_id', targetKey: 'personalNumber', as: 'performedProtectionInspections' });
ProtectionInspection.belongsTo(Employee, { foreignKey: 'responsible_id', targetKey: 'personalNumber', as: 'responsible' });

ProtectionInspection.hasMany(ProtectionInspectionDetails, { foreignKey: 'protection_inspection_id', as: 'details' });
ProtectionInspectionDetails.belongsTo(ProtectionInspection, { foreignKey: 'protection_inspection_id' });

ProtectionEquipmentCategory.hasMany(ProtectionInspectionDetails, { foreignKey: 'category_id', as: 'inspectionResults' });
ProtectionInspectionDetails.belongsTo(ProtectionEquipmentCategory, { foreignKey: 'category_id', as: 'category' });

module.exports = {
  sequelize,
  Role, User, Occupation, Department, JobTitle, Employee,
  State, City, Parish, Location,
  Accident, AccidentType, Magnitude, Period, FileDocument, AccidentDocumentCheck, 
  AccidentAffectationDetail, AffectationSubject, Affectation, ContactType, DamageAgent, 
  EmployeeAccident, InjuryType,
  Brand, Model, VehicleType, Vehicle, VehicleImage, VehicleAccessory,
  InspectionStatus, Inspection, AgentType, ExtinguisherInspection, ExtinguisherDetail, 
  VehicleInspection, InspectionDetail,
  InstallationType, Facility, ProtectionType, ProtectionEquipmentCategory, 
  ProtectionEquipment, ProtectionInspection, ProtectionInspectionDetails
};

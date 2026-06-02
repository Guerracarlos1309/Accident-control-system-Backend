const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Accident = sequelize.define('Accident', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  accidentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'accident_date'
  },
  accidentTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'accident_time'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  managementId: {
    type: DataTypes.INTEGER,
    field: 'management_id',
    allowNull: true
  },
  inpsaselFileNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    field: 'inpsasel_file_number'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  facilityId: {
    type: DataTypes.INTEGER,
    field: 'facility_id'
  },
  accidentTypeId: {
    type: DataTypes.INTEGER,
    field: 'accident_type_id'
  },
  periodId: {
    type: DataTypes.INTEGER,
    field: 'period_id'
  },
  magnitudeId: {
    type: DataTypes.INTEGER,
    field: 'magnitude_id',
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id'
  },
  damageAgentId: {
    type: DataTypes.INTEGER,
    field: 'damage_agent_id'
  },
  contactTypeId: {
    type: DataTypes.INTEGER,
    field: 'contact_type_id'
  },
  customAddressDetails: {
    type: DataTypes.STRING(255),
    field: 'custom_address_details'
  },
  medicalCenterName: {
    type: DataTypes.STRING(150),
    field: 'medical_center_name'
  },
  medicalCenterId: {
    type: DataTypes.INTEGER,
    field: 'medical_center_id',
    allowNull: true
  },
  medicalCenterAddress: {
    type: DataTypes.STRING(255),
    field: 'medical_center_address'
  },
  medicalObservations: {
    type: DataTypes.TEXT,
    field: 'medical_observations'
  },
  globalObservations: {
    type: DataTypes.TEXT,
    field: 'global_observations'
  },
  processStatusId: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'process_status_id',
    references: {
      model: 'inspection_status',
      key: 'id'
    }
  },
  parishId: {
    type: DataTypes.INTEGER,
    field: 'parish_id'
  },
  activity: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  workType: {
    type: DataTypes.STRING(50),
    field: 'work_type'
  },
  hazardCode: {
    type: DataTypes.STRING(50),
    field: 'hazard_code'
  },
  contactExposureCode: {
    type: DataTypes.STRING(50),
    field: 'contact_exposure_code'
  },
  affectationClassCode: {
    type: DataTypes.STRING(50),
    field: 'affectation_class_code'
  },
  affectationSubjectCode: {
    type: DataTypes.STRING(50),
    field: 'affectation_subject_code'
  },
  assetsProcessAffectation: {
    type: DataTypes.STRING(50),
    field: 'assets_process_affectation'
  }
}, {
  tableName: 'accident',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Accident;

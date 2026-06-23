const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FacilityInspectionCode = sequelize.define('FacilityInspectionCode', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  facilityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'facility_id'
  },
  type: {
    type: DataTypes.STRING(2), // 'I' or 'M'
    allowNull: false
  },
  sequence: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  inspectionDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'inspection_date'
  },
  memoNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'memo_number'
  },
  pdfPath: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'pdf_path'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'facility_inspection_code',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = FacilityInspectionCode;

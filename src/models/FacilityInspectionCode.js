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
    allowNull: false,
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
    allowNull: false,
    defaultValue: DataTypes.NOW
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

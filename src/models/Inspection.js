const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inspection = sequelize.define('Inspection', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  coordinates: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  facilityId: {
    type: DataTypes.INTEGER,
    field: 'facility_id'
  },
  employeePersonalNumber: {
    type: DataTypes.STRING(10),
    field: 'employee_id'
  },
  observations: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  inspectionNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'inspection_number'
  },
  statusId: {
    type: DataTypes.INTEGER,
    field: 'status_id'
  }
}, {
  tableName: 'inspection',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Inspection;

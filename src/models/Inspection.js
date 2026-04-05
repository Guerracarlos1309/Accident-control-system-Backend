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
  locationId: {
    type: DataTypes.INTEGER,
    field: 'location_id'
  },
  employeePersonalNumber: {
    type: DataTypes.STRING(10),
    field: 'employee_id'
  },
  observations: {
    type: DataTypes.STRING(1000),
    allowNull: true
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

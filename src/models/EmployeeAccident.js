const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeAccident = sequelize.define('EmployeeAccident', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  accidentId: {
    type: DataTypes.INTEGER,
    field: 'accident_id'
  },
  employeePersonalNumber: {
    type: DataTypes.STRING(20),
    field: 'employee_id'
  },
  injuryTypeId: {
    type: DataTypes.INTEGER,
    field: 'injury_type_id'
  },
  restDays: {
    type: DataTypes.INTEGER,
    field: 'rest_days'
  },
  magnitudeId: {
    type: DataTypes.INTEGER,
    field: 'magnitude_id'
  },
  affectedArea: {
    type: DataTypes.STRING(50),
    field: 'affected_area'
  },
  injuryNature: {
    type: DataTypes.STRING(50),
    field: 'injury_nature'
  },
  injuryLevel: {
    type: DataTypes.STRING(50),
    field: 'injury_level'
  },
  injuryConsequence: {
    type: DataTypes.STRING(50),
    field: 'injury_consequence'
  }
}, {
  tableName: 'employee_accident',
  timestamps: false
});

module.exports = EmployeeAccident;

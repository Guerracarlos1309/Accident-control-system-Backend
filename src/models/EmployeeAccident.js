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
    type: DataTypes.STRING(10),
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
  }
}, {
  tableName: 'employee_accident',
  timestamps: false
});

module.exports = EmployeeAccident;

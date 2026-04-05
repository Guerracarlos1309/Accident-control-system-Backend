const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InspectionStatus = sequelize.define('InspectionStatus', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'inspection_status',
  timestamps: false
});

module.exports = InspectionStatus;

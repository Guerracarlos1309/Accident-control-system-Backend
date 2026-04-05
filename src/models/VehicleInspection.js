const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleInspection = sequelize.define('VehicleInspection', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  plateId: {
    type: DataTypes.STRING,
    field: 'plate_id'
  },
  inspectionId: {
    type: DataTypes.INTEGER,
    field: 'inspection_id'
  },
  description: {
    type: DataTypes.STRING(150),
    allowNull: true
  }
}, {
  tableName: 'vehicle_inspection',
  timestamps: false
});

module.exports = VehicleInspection;

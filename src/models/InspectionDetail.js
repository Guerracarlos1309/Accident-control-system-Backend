const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InspectionDetail = sequelize.define('InspectionDetail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  vehicleInspectionId: {
    type: DataTypes.INTEGER,
    field: 'vehicle_inspection_id'
  },
  accessoryId: {
    type: DataTypes.INTEGER,
    field: 'accessory_id'
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  observations: {
    type: DataTypes.STRING(150),
    allowNull: true
  }
}, {
  tableName: 'inspection_detail',
  timestamps: false
});

module.exports = InspectionDetail;

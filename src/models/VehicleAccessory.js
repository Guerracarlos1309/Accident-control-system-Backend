const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleAccessory = sequelize.define('VehicleAccessory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(30),
    allowNull: false
  }
}, {
  tableName: 'vehicle_accessory',
  timestamps: false
});

module.exports = VehicleAccessory;

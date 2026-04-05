const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    unique: true
  },
  plate: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true
  },
  modelId: {
    type: DataTypes.INTEGER,
    field: 'model_id'
  },
  vehicleTypeId: {
    type: DataTypes.INTEGER,
    field: 'vehicle_type_id'
  },
  color: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'vehicle',
  timestamps: false
});

module.exports = Vehicle;

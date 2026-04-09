const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Facility = sequelize.define('Facility', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  coordinates: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  locationId: {
    type: DataTypes.INTEGER,
    field: 'location_id'
  },
  installationTypeId: {
    type: DataTypes.INTEGER,
    field: 'installation_type_id'
  },
  voltageLevel: {
    type: DataTypes.STRING(10),
    field: 'voltage_level'
  }
}, {
  tableName: 'facility',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Facility;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProtectionInspection = sequelize.define('ProtectionInspection', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  inspectionId: {
    type: DataTypes.INTEGER,
    field: 'inspection_id'
  },
  responsibleId: {
    type: DataTypes.STRING(10),
    field: 'responsible_id'
  },
  observations: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'protection_inspection',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ProtectionInspection;

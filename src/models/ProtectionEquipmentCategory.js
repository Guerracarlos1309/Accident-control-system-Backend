const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProtectionEquipmentCategory = sequelize.define('ProtectionEquipmentCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  protectionTypeId: {
    type: DataTypes.INTEGER,
    field: 'protection_type_id'
  },
  description: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'protection_equipment_category',
  timestamps: false
});

module.exports = ProtectionEquipmentCategory;

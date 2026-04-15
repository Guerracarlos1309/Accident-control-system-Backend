const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProtectionEquipment = sequelize.define('ProtectionEquipment', {
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
  categoryId: {
    type: DataTypes.INTEGER,
    field: 'category_id'
  },
  totalQuantity: {
    type: DataTypes.INTEGER,
    field: 'total_quantity',
    defaultValue: 0
  },
  operativeQuantity: {
    type: DataTypes.INTEGER,
    field: 'operative_quantity',
    defaultValue: 0
  },
  lastUpdate: {
    type: DataTypes.DATEONLY,
    field: 'last_update'
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'protection_equipment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ProtectionEquipment;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProtectionInspectionDetails = sequelize.define('ProtectionInspectionDetails', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  protectionInspectionId: {
    type: DataTypes.INTEGER,
    field: 'protection_inspection_id'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    field: 'category_id'
  },
  totalChecked: {
    type: DataTypes.INTEGER,
    field: 'total_checked'
  },
  operative: {
    type: DataTypes.INTEGER,
    field: 'operative'
  },
  observations: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'protection_inspection_details',
  timestamps: false
});

module.exports = ProtectionInspectionDetails;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InstallationType = sequelize.define('InstallationType', {
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
  description: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'installation_type',
  timestamps: false
});

module.exports = InstallationType;

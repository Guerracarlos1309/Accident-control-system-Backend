const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Management = sequelize.define('Management', {
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
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'management',
  timestamps: false
});

module.exports = Management;

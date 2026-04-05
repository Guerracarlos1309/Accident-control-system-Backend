const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InjuryType = sequelize.define('InjuryType', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'injury_type',
  timestamps: false
});

module.exports = InjuryType;

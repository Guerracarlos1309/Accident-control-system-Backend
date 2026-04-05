const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Magnitude = sequelize.define('Magnitude', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'magnitude',
  timestamps: false
});

module.exports = Magnitude;

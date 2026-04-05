const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Period = sequelize.define('Period', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  annuality: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'period',
  timestamps: false
});

module.exports = Period;

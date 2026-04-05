const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Parish = sequelize.define('Parish', {
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
  cityId: {
    type: DataTypes.INTEGER,
    field: 'city_id'
  }
}, {
  tableName: 'parish',
  timestamps: false
});

module.exports = Parish;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Location = sequelize.define('Location', {
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
  parishId: {
    type: DataTypes.INTEGER,
    field: 'parish_id'
  }
}, {
  tableName: 'location',
  timestamps: false
});

module.exports = Location;

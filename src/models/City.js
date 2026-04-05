const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const City = sequelize.define('City', {
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
  stateId: {
    type: DataTypes.INTEGER,
    field: 'state_id'
  }
}, {
  tableName: 'city',
  timestamps: false
});

module.exports = City;

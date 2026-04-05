const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Occupation = sequelize.define('Occupation', {
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
  tableName: 'occupation'
});

module.exports = Occupation;

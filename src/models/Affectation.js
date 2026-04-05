const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Affectation = sequelize.define('Affectation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  parentId: {
    type: DataTypes.INTEGER,
    field: 'parent_id',
    allowNull: true
  }
}, {
  tableName: 'affectation',
  timestamps: false
});

module.exports = Affectation;

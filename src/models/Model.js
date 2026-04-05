const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Model = sequelize.define('Model', {
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
  },
  brandId: {
    type: DataTypes.INTEGER,
    field: 'brand_id'
  }
}, {
  tableName: 'model',
  timestamps: false
});

module.exports = Model;

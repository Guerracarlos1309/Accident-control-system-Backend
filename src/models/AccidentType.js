const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccidentType = sequelize.define('AccidentType', {
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
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  parentId: {
    type: DataTypes.INTEGER,
    field: 'parent_id',
    allowNull: true // Puede quedar null para tipos de nivel superior
  }
}, {
  tableName: 'accident_type',
  timestamps: false
});

module.exports = AccidentType;

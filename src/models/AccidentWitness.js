const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccidentWitness = sequelize.define('AccidentWitness', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  accidentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'accident_id'
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  idCard: {
    type: DataTypes.STRING(20),
    field: 'id_card'
  },
  phone: {
    type: DataTypes.STRING(20)
  }
}, {
  tableName: 'accident_witness',
  timestamps: false,
  underscored: true
});

module.exports = AccidentWitness;

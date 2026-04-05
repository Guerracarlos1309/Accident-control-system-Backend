const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AgentType = sequelize.define('AgentType', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'agent_type',
  timestamps: false
});

module.exports = AgentType;

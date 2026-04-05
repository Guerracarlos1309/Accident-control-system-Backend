const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExtinguisherDetail = sequelize.define('ExtinguisherDetail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  agentTypeId: {
    type: DataTypes.INTEGER,
    field: 'agent_type_id'
  },
  extinguisherInspectionId: {
    type: DataTypes.INTEGER,
    field: 'extinguisher_inspection_id'
  },
  extinguisherNumber: {
    type: DataTypes.INTEGER,
    field: 'extinguisher_number'
  },
  capacity: {
    type: DataTypes.STRING(20)
  },
  rechargeDate: {
    type: DataTypes.DATEONLY,
    field: 'recharge_date'
  },
  expirationDate: {
    type: DataTypes.DATEONLY,
    field: 'expiration_date'
  },
  generalStatus: {
    type: DataTypes.STRING(20),
    field: 'general_status'
  },
  observations: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'extinguisher_detail',
  timestamps: false
});

module.exports = ExtinguisherDetail;

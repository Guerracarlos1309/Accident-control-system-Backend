const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExtinguisherInspection = sequelize.define('ExtinguisherInspection', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  inspectionId: {
    type: DataTypes.INTEGER,
    field: 'inspection_id'
  },
  extinguisherCode: {
    type: DataTypes.STRING(20),
    field: 'extinguisher_code'
  },
  inspectionDate: {
    type: DataTypes.DATEONLY,
    field: 'inspection_date'
  },
  responsiblePersonalNumber: {
    type: DataTypes.STRING(10),
    field: 'responsible_id'
  },
  generalObservations: {
    type: DataTypes.STRING(500),
    field: 'general_observations'
  }
}, {
  tableName: 'extinguisher_inspection',
  timestamps: false
});

module.exports = ExtinguisherInspection;

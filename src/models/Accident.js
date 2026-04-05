const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Accident = sequelize.define('Accident', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  accidentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'accident_date'
  },
  accidentTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'accident_time'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  affectedProperty: {
    type: DataTypes.STRING(100),
    field: 'affected_property'
  },
  inpsaselFileNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    field: 'inpsasel_file_number'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  locationId: {
    type: DataTypes.INTEGER,
    field: 'location_id'
  },
  accidentTypeId: {
    type: DataTypes.INTEGER,
    field: 'accident_type_id'
  },
  periodId: {
    type: DataTypes.INTEGER,
    field: 'period_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id'
  },
  damageAgentId: {
    type: DataTypes.INTEGER,
    field: 'damage_agent_id'
  },
  contactTypeId: {
    type: DataTypes.INTEGER,
    field: 'contact_type_id'
  }
}, {
  tableName: 'accident',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Accident;

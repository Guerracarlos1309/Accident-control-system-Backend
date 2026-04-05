const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccidentAffectationDetail = sequelize.define('AccidentAffectationDetail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  accidentId: {
    type: DataTypes.INTEGER,
    field: 'accident_id'
  },
  affectationId: {
    type: DataTypes.INTEGER,
    field: 'affectation_id'
  },
  affectationSubjectId: {
    type: DataTypes.INTEGER,
    field: 'affectation_subject_id'
  },
  magnitudeId: {
    type: DataTypes.INTEGER,
    field: 'magnitude_id'
  }
}, {
  tableName: 'accident_affectation_detail',
  timestamps: false
});

module.exports = AccidentAffectationDetail;

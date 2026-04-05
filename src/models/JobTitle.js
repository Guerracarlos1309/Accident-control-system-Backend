const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobTitle = sequelize.define('JobTitle', {
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
    type: DataTypes.STRING(150),
    allowNull: true
  }
}, {
  tableName: 'job_title'
});

module.exports = JobTitle;

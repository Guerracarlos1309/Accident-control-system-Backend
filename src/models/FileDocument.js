const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FileDocument = sequelize.define('FileDocument', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'file_documents',
  timestamps: false
});

module.exports = FileDocument;

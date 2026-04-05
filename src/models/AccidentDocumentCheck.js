const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccidentDocumentCheck = sequelize.define('AccidentDocumentCheck', {
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
  documentId: {
    type: DataTypes.INTEGER,
    field: 'document_id'
  },
  delivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  receivedDate: {
    type: DataTypes.DATEONLY,
    field: 'received_date'
  },
  observation: {
    type: DataTypes.STRING(200)
  }
}, {
  tableName: 'accident_document_check',
  timestamps: false
});

module.exports = AccidentDocumentCheck;

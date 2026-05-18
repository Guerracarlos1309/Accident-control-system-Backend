const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalCenter = sequelize.define('MedicalCenter', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  parishId: {
    type: DataTypes.INTEGER,
    field: 'parish_id',
    allowNull: true
  }
}, {
  tableName: 'medical_center',
  timestamps: false,
  hooks: {
    beforeSave: (instance) => {
      for (const key in instance.dataValues) {
        const value = instance.dataValues[key];
        if (typeof value === 'string') {
          instance.dataValues[key] = value.toUpperCase();
        }
      }
    }
  }
});

module.exports = MedicalCenter;

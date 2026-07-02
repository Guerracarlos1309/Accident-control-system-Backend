const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InspectionImage = sequelize.define('InspectionImage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'image_url'
  },
  inspectionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'inspection_id'
  }
}, {
  tableName: 'inspection_image',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = InspectionImage;

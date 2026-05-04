const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FacilityImage = sequelize.define('FacilityImage', {
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
  facilityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'facility_id'
  }
}, {
  tableName: 'facility_image',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = FacilityImage;

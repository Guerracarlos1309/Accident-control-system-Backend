const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleImage = sequelize.define('VehicleImage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  plateId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'plate_id'
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'image_url'
  }
}, {
  tableName: 'vehicle_image',
  timestamps: false
});

module.exports = VehicleImage;

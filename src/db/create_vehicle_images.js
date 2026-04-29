require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { sequelize } = require('../models');

async function createVehicleImagesTable() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS vehicle_image (
        id SERIAL PRIMARY KEY,
        plate_id VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        CONSTRAINT fk_vehicle
          FOREIGN KEY(plate_id) 
	        REFERENCES vehicle(plate)
	        ON DELETE CASCADE
      );
    `);
    
    console.log('Table vehicle_image created.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

createVehicleImagesTable();

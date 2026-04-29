require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { sequelize } = require('../models');

async function addImageColumn() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // We can just use alter: true or run a direct query
    await sequelize.query('ALTER TABLE employee ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);');
    
    console.log('Column image_url added to employee table.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

addImageColumn();

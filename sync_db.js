require('dotenv').config();
const { sequelize } = require('./src/models');

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // This will add the missing columns (like status)
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully (columns updated).');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

sync();

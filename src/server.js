const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Authenticate with DB
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models (uncomment for initial setup, be careful with 'force' or 'alter')
    // await sequelize.sync({ alter: true });
    // console.log('Database models synced.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

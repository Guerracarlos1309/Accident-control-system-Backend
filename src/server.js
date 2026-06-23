const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Authenticate with DB
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Ensure new columns exist (safe migrations)
    try {
      const queryInterface = sequelize.getQueryInterface();
      const { DataTypes } = require('sequelize');
      const tableDefinition = await queryInterface.describeTable('facility_inspection_code');

      if (!tableDefinition.pdf_path_2) {
        await queryInterface.addColumn('facility_inspection_code', 'pdf_path_2', {
          type: DataTypes.STRING(255),
          allowNull: true
        });
        console.log('Successfully added pdf_path_2 column.');
      }

      if (!tableDefinition.memo_date) {
        await queryInterface.addColumn('facility_inspection_code', 'memo_date', {
          type: DataTypes.DATEONLY,
          allowNull: true
        });
        console.log('Successfully added memo_date column.');
      }
    } catch (columnError) {
      console.warn('Could not inspect/add columns:', columnError.message);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

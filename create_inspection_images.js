const { sequelize, InspectionImage } = require('./src/models');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connection established to sqlite.');

    // Sync only the InspectionImage table to create it if it does not exist
    await InspectionImage.sync({ alter: true });
    console.log('InspectionImage table synced / created successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Error syncing InspectionImage table:', error);
    process.exit(1);
  }
}

main();

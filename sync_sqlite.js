const { sequelize, FacilityInspectionCode } = require('./src/models');

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('Connection established.');
    
    // Disable foreign keys temporarily for sync
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    console.log('Disabled foreign key checks.');
    
    // Sincronizar solo el modelo nuevo
    await FacilityInspectionCode.sync();
    console.log('FacilityInspectionCode model synced successfully.');
    
    // Re-enable foreign keys
    await sequelize.query('PRAGMA foreign_keys = ON;');
    console.log('Enabled foreign key checks.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

sync();

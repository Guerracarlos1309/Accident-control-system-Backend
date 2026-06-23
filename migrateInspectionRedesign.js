const { sequelize } = require('./src/models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected to SQLite.');

    // Check if table exists
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='facility_inspection_code'");
    if (tables.length === 0) {
      console.log('Table facility_inspection_code does not exist. Creating it...');
      const { FacilityInspectionCode } = require('./src/models');
      await FacilityInspectionCode.sync();
      console.log('Done!');
      process.exit(0);
    }

    console.log('Table exists. Backing up data...');
    // Fetch all existing rows
    const [rows] = await sequelize.query('SELECT * FROM facility_inspection_code');
    console.log(`Found ${rows.length} rows.`);

    // Rename old table
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    await sequelize.query('DROP TABLE IF EXISTS facility_inspection_code_old');
    await sequelize.query('ALTER TABLE facility_inspection_code RENAME TO facility_inspection_code_old');
    console.log('Renamed table to facility_inspection_code_old.');

    // Create new table
    const { FacilityInspectionCode } = require('./src/models');
    await FacilityInspectionCode.sync({ force: true });
    console.log('Created new facility_inspection_code table.');

    // Re-insert data
    for (const r of rows) {
      await sequelize.query(
        `INSERT INTO facility_inspection_code (id, facility_id, type, sequence, year, code, date, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            r.id,
            r.facility_id,
            r.type,
            r.sequence,
            r.year,
            r.code,
            r.date,
            r.notes,
            r.created_at,
            r.updated_at
          ]
        }
      );
    }
    console.log('Migrated data successfully.');

    // Drop old table
    await sequelize.query('DROP TABLE IF EXISTS facility_inspection_code_old');
    await sequelize.query('PRAGMA foreign_keys = ON;');
    console.log('Migration finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

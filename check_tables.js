// Script to diagnose and fix the contact_type_backup orphan table
require('dotenv').config();
const { sequelize } = require('./src/models');

async function checkAndFix() {
  try {
    await sequelize.authenticate();
    console.log('Connected to SQLite database.\n');

    // List all tables
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('=== TABLES IN DATABASE ===');
    tables.forEach(t => console.log(' -', t.name));

    // Check for backup/orphan tables
    const backupTables = tables.filter(t => t.name.includes('_backup'));
    if (backupTables.length > 0) {
      console.log('\n=== ORPHAN BACKUP TABLES FOUND ===');
      backupTables.forEach(t => console.log(' !', t.name));

      for (const t of backupTables) {
        const originalName = t.name.replace('_backup', '');
        const originalExists = tables.find(x => x.name === originalName);

        if (!originalExists) {
          console.log(`\n>> Original table '${originalName}' NOT found. Renaming backup to original...`);
          await sequelize.query(`ALTER TABLE "${t.name}" RENAME TO "${originalName}"`);
          console.log(`   DONE: '${t.name}' -> '${originalName}'`);
        } else {
          console.log(`\n>> Original table '${originalName}' EXISTS. Dropping orphan backup '${t.name}'...`);
          await sequelize.query(`DROP TABLE IF EXISTS "${t.name}"`);
          console.log(`   DONE: Dropped '${t.name}'`);
        }
      }
    } else {
      console.log('\n No orphan backup tables found.');
    }

    // Check contact_type specifically
    const [ctRows] = await sequelize.query("SELECT COUNT(*) as cnt FROM contact_type");
    console.log(`\n contact_type table exists and has ${ctRows[0].cnt} rows.`);

    console.log('\n=== FIX COMPLETE ===');
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

checkAndFix();

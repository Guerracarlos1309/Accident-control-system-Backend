const { sequelize } = require('./src/models');

async function check() {
  try {
    console.log('--- COLUMNS ---');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'accident'
      ORDER BY column_name
    `);
    console.log(JSON.stringify(columns, null, 2));

    console.log('--- CONSTRAINTS ---');
    const [constraints] = await sequelize.query(`
      SELECT tc.constraint_name, tc.table_name, kcu.column_name, tc.constraint_type
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'accident'
    `);
    console.log(JSON.stringify(constraints, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();

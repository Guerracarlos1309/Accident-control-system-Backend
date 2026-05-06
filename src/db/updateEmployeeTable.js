const sequelize = require('../config/database');

async function update() {
  try {
    console.log('--- 🛠️ Actualizando estructura de tabla Employee (Modo Seguro) ---');
    
    await sequelize.query(`
      ALTER TABLE "employee" 
      ADD COLUMN IF NOT EXISTS "management_id" INTEGER 
      REFERENCES "management" ("id") 
      ON DELETE SET NULL 
      ON UPDATE CASCADE;
    `);

    console.log('✅ Estructura de Employee actualizada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar la estructura de Employee:', error);
    process.exit(1);
  }
}

update();

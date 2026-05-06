const sequelize = require('../config/database');

async function update() {
  try {
    console.log('--- 🛠️ Actualizando estructura de tabla Accident (Modo Seguro) ---');
    
    // Añadimos la columna management_id si no existe
    // También nos aseguramos de que la tabla 'management' exista primero por si acaso
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "management" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "code" VARCHAR(20)
      );
    `);

    await sequelize.query(`
      ALTER TABLE "accident" 
      ADD COLUMN IF NOT EXISTS "management_id" INTEGER 
      REFERENCES "management" ("id") 
      ON DELETE SET NULL 
      ON UPDATE CASCADE;
    `);

    console.log('✅ Estructura actualizada exitosamente sin pérdida de datos.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar la estructura:', error);
    process.exit(1);
  }
}

update();

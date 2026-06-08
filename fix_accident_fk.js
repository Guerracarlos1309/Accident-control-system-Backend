// SCRIPT DE REPARACIÓN DEFINITIVA
// La tabla 'accident' tiene Foreign Keys internas que apuntan a tablas backup
// que ya no existen (contact_type_backup, damage_agent_backup, accident_type_backup).
// Este script recrea la tabla 'accident' correctamente sin esas FKs corruptas.
//
// IMPORTANTE: Este script NO borra los datos existentes.

require('dotenv').config();
const { sequelize } = require('./src/models');

async function fixAccidentTable() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a SQLite.\n');

    // 1. Deshabilitar foreign keys temporalmente
    await sequelize.query('PRAGMA foreign_keys = OFF');
    console.log('Foreign keys desactivadas temporalmente.');

    // 2. Verificar datos actuales
    const [currentRows] = await sequelize.query('SELECT COUNT(*) as cnt FROM accident');
    console.log(`Filas actuales en accident: ${currentRows[0].cnt}`);

    // 3. Crear tabla nueva sin FKs corruptas
    console.log('\nCreando tabla accident_new...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "accident_new" (
        "id"                        INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        "accident_date"             DATE NOT NULL,
        "accident_time"             TEXT NOT NULL,
        "description"               TEXT,
        "management_id"             INTEGER,
        "inpsasel_file_number"      VARCHAR(20) UNIQUE,
        "status"                    INTEGER DEFAULT 1,
        "facility_id"               INTEGER,
        "accident_type_id"          INTEGER,
        "period_id"                 INTEGER,
        "magnitude_id"              INTEGER,
        "user_id"                   INTEGER,
        "damage_agent_id"           INTEGER,
        "contact_type_id"           INTEGER,
        "custom_address_details"    VARCHAR(255),
        "medical_center_name"       VARCHAR(150),
        "medical_center_id"         INTEGER,
        "medical_center_address"    VARCHAR(255),
        "medical_observations"      TEXT,
        "global_observations"       TEXT,
        "process_status_id"         INTEGER DEFAULT 1,
        "parish_id"                 INTEGER,
        "activity"                  TEXT,
        "work_type"                 VARCHAR(50),
        "hazard_code"               VARCHAR(50),
        "contact_exposure_code"     VARCHAR(50),
        "affectation_class_code"    VARCHAR(50),
        "affectation_subject_code"  VARCHAR(50),
        "assets_process_affectation" VARCHAR(50),
        "accident_control_number"   VARCHAR(50),
        "created_at"                DATETIME,
        "updated_at"                DATETIME
      )
    `);
    console.log('Tabla accident_new creada.');

    // 4. Copiar todos los datos
    console.log('Copiando datos...');
    await sequelize.query(`
      INSERT INTO "accident_new" 
      SELECT 
        id, accident_date, accident_time, description, management_id,
        inpsasel_file_number, status, facility_id, accident_type_id,
        period_id, magnitude_id, user_id, damage_agent_id, contact_type_id,
        custom_address_details, medical_center_name, medical_center_id,
        medical_center_address, medical_observations, global_observations,
        process_status_id, parish_id, activity, work_type, hazard_code,
        contact_exposure_code, affectation_class_code, affectation_subject_code,
        assets_process_affectation, accident_control_number,
        created_at, updated_at
      FROM "accident"
    `);

    const [newRows] = await sequelize.query('SELECT COUNT(*) as cnt FROM accident_new');
    console.log(`Filas copiadas a accident_new: ${newRows[0].cnt}`);

    if (parseInt(newRows[0].cnt) !== parseInt(currentRows[0].cnt)) {
      throw new Error('¡ALERTA! El número de filas no coincide. Abortando.');
    }

    // 5. Renombrar tablas
    console.log('\nRenombrando tablas...');
    await sequelize.query('ALTER TABLE "accident" RENAME TO "accident_old_corrupt"');
    await sequelize.query('ALTER TABLE "accident_new" RENAME TO "accident"');
    console.log('Renombramiento completado.');

    // 6. Eliminar la tabla corrupta vieja
    await sequelize.query('DROP TABLE IF EXISTS "accident_old_corrupt"');
    console.log('Tabla corrupta eliminada.');

    // 7. Reactivar foreign keys
    await sequelize.query('PRAGMA foreign_keys = ON');

    // 8. Verificación final
    const [finalCheck] = await sequelize.query('SELECT COUNT(*) as cnt FROM accident');
    console.log(`\n✅ REPARACIÓN COMPLETA. Filas en accident: ${finalCheck[0].cnt}`);

    // 9. Verificar integridad
    const [fkCheck] = await sequelize.query("PRAGMA foreign_key_check('accident')");
    if (fkCheck.length === 0) {
      console.log('✅ Integridad referencial: OK - No hay FKs corruptas.');
    } else {
      console.log('⚠️  Aún hay problemas de FK:', JSON.stringify(fkCheck, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR durante la reparación:', error.message);
    // Intentar reactivar FK aunque haya error
    try { await sequelize.query('PRAGMA foreign_keys = ON'); } catch(e) {}
    process.exit(1);
  }
}

fixAccidentTable();

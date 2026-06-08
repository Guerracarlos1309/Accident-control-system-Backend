// REPARACIÓN GLOBAL: Detecta y reconstruye TODAS las tablas con FKs corruptas
// (apuntando a tablas _backup que ya no existen)
// NO borra datos existentes.

require('dotenv').config();
const { sequelize } = require('./src/models');

// Esquemas correctos para todas las tablas que pueden tener FKs corruptas
const TABLE_SCHEMAS = {
  accident: `
    CREATE TABLE "accident_new" (
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
    )`,

  employee_accident: `
    CREATE TABLE "employee_accident_new" (
      "id"                    INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      "accident_id"           INTEGER,
      "employee_personal_number" VARCHAR(255),
      "injury_type_id"        INTEGER,
      "magnitude_id"          INTEGER,
      "rest_days"             INTEGER,
      "affected_area"         VARCHAR(50),
      "injury_nature"         VARCHAR(50),
      "injury_level"          VARCHAR(50),
      "injury_consequence"    VARCHAR(50),
      "created_at"            DATETIME,
      "updated_at"            DATETIME
    )`,

  accident_witness: `
    CREATE TABLE "accident_witness_new" (
      "id"          INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      "accident_id" INTEGER,
      "name"        VARCHAR(150),
      "id_card"     VARCHAR(20),
      "phone"       VARCHAR(30),
      "created_at"  DATETIME,
      "updated_at"  DATETIME
    )`,

  accident_document_check: `
    CREATE TABLE "accident_document_check_new" (
      "id"          INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      "accident_id" INTEGER,
      "document_id" INTEGER,
      "created_at"  DATETIME,
      "updated_at"  DATETIME
    )`,

  accident_affectation_detail: `
    CREATE TABLE "accident_affectation_detail_new" (
      "id"                   INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      "accident_id"          INTEGER,
      "affectation_id"       INTEGER,
      "affectation_subject_id" INTEGER,
      "magnitude_id"         INTEGER,
      "observations"         TEXT,
      "created_at"           DATETIME,
      "updated_at"           DATETIME
    )`,
};

async function rebuildTable(tableName, schema) {
  const newName = `${tableName}_new`;
  const oldName = `${tableName}_old_corrupt`;

  console.log(`\n--- Reconstruyendo: ${tableName} ---`);

  // Obtener columnas actuales de la tabla
  const [pragma] = await sequelize.query(`PRAGMA table_info('${tableName}')`);
  const columns = pragma.map(r => `"${r.name}"`).join(', ');
  console.log(`  Columnas: ${columns}`);

  // Contar filas
  const [countRes] = await sequelize.query(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
  const count = parseInt(countRes[0].cnt);
  console.log(`  Filas actuales: ${count}`);

  // Crear tabla nueva con esquema limpio
  await sequelize.query(`DROP TABLE IF EXISTS "${newName}"`);
  await sequelize.query(schema);
  console.log(`  ✓ Tabla ${newName} creada.`);

  // Copiar datos
  if (count > 0) {
    await sequelize.query(`INSERT INTO "${newName}" (${columns}) SELECT ${columns} FROM "${tableName}"`);
    const [newCount] = await sequelize.query(`SELECT COUNT(*) as cnt FROM "${newName}"`);
    console.log(`  ✓ Datos copiados: ${newCount[0].cnt} filas.`);
    if (parseInt(newCount[0].cnt) !== count) throw new Error(`Mismatch en ${tableName}!`);
  }

  // Swap
  await sequelize.query(`DROP TABLE IF EXISTS "${oldName}"`);
  await sequelize.query(`ALTER TABLE "${tableName}" RENAME TO "${oldName}"`);
  await sequelize.query(`ALTER TABLE "${newName}" RENAME TO "${tableName}"`);
  await sequelize.query(`DROP TABLE IF EXISTS "${oldName}"`);
  console.log(`  ✓ Tabla reconstruida y datos restaurados.`);
}

async function fixAll() {
  try {
    await sequelize.authenticate();
    console.log('Conectado.\n');

    // Desactivar FKs
    await sequelize.query('PRAGMA foreign_keys = OFF');

    // Verificar cuáles tablas tienen FKs corruptas
    const [allTables] = await sequelize.query(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
    const tableNames = allTables.map(t => t.name).filter(n => !n.includes('_new') && !n.includes('_old') && !n.includes('sqlite_'));

    console.log('=== VERIFICANDO FKs CORRUPTAS EN TODAS LAS TABLAS ===');
    const corruptTables = [];
    for (const t of tableNames) {
      try {
        const [fkCheck] = await sequelize.query(`PRAGMA foreign_key_check('${t}')`);
        const hasBadFKs = fkCheck.some(r => r.parent && r.parent.includes('_backup'));
        if (hasBadFKs) {
          corruptTables.push(t);
          const badRefs = [...new Set(fkCheck.filter(r => r.parent.includes('_backup')).map(r => r.parent))];
          console.log(`  ⚠️  ${t} → FKs corruptas: ${badRefs.join(', ')}`);
        } else {
          console.log(`  ✅ ${t} → OK`);
        }
      } catch(e) {
        console.log(`  ❓ ${t} → Error al verificar: ${e.message}`);
      }
    }

    if (corruptTables.length === 0) {
      console.log('\n✅ No hay tablas con FKs corruptas. Base de datos limpia.');
      await sequelize.query('PRAGMA foreign_keys = ON');
      process.exit(0);
    }

    console.log(`\n=== REPARANDO ${corruptTables.length} TABLAS CORRUPTAS ===`);

    for (const tableName of corruptTables) {
      if (TABLE_SCHEMAS[tableName]) {
        await rebuildTable(tableName, TABLE_SCHEMAS[tableName]);
      } else {
        console.log(`  ⚠️  Sin esquema predefinido para: ${tableName} — saltando (agrégalo al script si es necesario)`);
      }
    }

    // Reactivar FKs
    await sequelize.query('PRAGMA foreign_keys = ON');

    // Verificación final
    console.log('\n=== VERIFICACIÓN FINAL ===');
    let allClean = true;
    for (const t of tableNames) {
      try {
        const [fkCheck] = await sequelize.query(`PRAGMA foreign_key_check('${t}')`);
        const hasBadFKs = fkCheck.some(r => r.parent && r.parent.includes('_backup'));
        if (hasBadFKs) {
          allClean = false;
          console.log(`  ❌ ${t} → Todavía corrupta`);
        } else {
          console.log(`  ✅ ${t} → OK`);
        }
      } catch(e) {}
    }

    if (allClean) {
      console.log('\n🎉 ¡REPARACIÓN GLOBAL COMPLETA! Todas las FKs están limpias.');
    } else {
      console.log('\n⚠️  Algunas tablas aún tienen problemas. Revisa los esquemas en el script.');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    try { await sequelize.query('PRAGMA foreign_keys = ON'); } catch(e) {}
    process.exit(1);
  }
}

fixAll();

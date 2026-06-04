/**
 * fix_code_null.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Migración SQLite: elimina la restricción NOT NULL del campo `code` en las
 * tablas accident_type, damage_agent y contact_type.
 *
 * Uso: node fix_code_null.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_STORAGE || path.join(__dirname, 'database.sqlite');
console.log('📂 Abriendo base de datos:', dbPath);

const db = new sqlite3.Database(dbPath);

const run = (sql) => new Promise((resolve, reject) => {
  db.run(sql, (err) => {
    if (err) reject(err);
    else resolve();
  });
});

const get = (sql) => new Promise((resolve, reject) => {
  db.get(sql, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const all = (sql) => new Promise((resolve, reject) => {
  db.all(sql, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

const tables = [
  {
    original: 'accident_type',
    backup: 'accident_type_backup',
    createSQL: `CREATE TABLE IF NOT EXISTS accident_type (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      code        TEXT,
      name        TEXT NOT NULL,
      description TEXT,
      parent_id   INTEGER
    )`,
    columns: 'id, code, name, description, parent_id'
  },
  {
    original: 'damage_agent',
    backup: 'damage_agent_backup',
    createSQL: `CREATE TABLE IF NOT EXISTS damage_agent (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      code        TEXT,
      name        TEXT NOT NULL,
      description TEXT,
      parent_id   INTEGER
    )`,
    columns: 'id, code, name, description, parent_id'
  },
  {
    original: 'contact_type',
    backup: 'contact_type_backup',
    createSQL: `CREATE TABLE IF NOT EXISTS contact_type (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      code        TEXT,
      name        TEXT NOT NULL,
      description TEXT,
      parent_id   INTEGER
    )`,
    columns: 'id, code, name, description, parent_id'
  }
];

async function migrate() {
  await run('PRAGMA foreign_keys = OFF');

  for (const t of tables) {
    console.log(`\n🔧 Migrando tabla: ${t.original}`);

    // Verificar si la tabla existe
    const exists = await get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='${t.original}'`
    );

    if (!exists) {
      console.log(`  ⚠️  Tabla ${t.original} no encontrada. Creando directamente...`);
      await run(t.createSQL);
      continue;
    }

    // Verificar si la columna code ya es nullable
    const tableInfo = await all(`PRAGMA table_info(${t.original})`);
    const codeCol = tableInfo.find(c => c.name === 'code');
    if (codeCol && codeCol.notnull === 0) {
      console.log(`  ✅ ${t.original}.code ya es nullable. Sin cambios necesarios.`);
      continue;
    }

    // 1. Renombrar la tabla original a _backup
    await run(`ALTER TABLE ${t.original} RENAME TO ${t.backup}`);
    console.log(`  1️⃣  Renombrada a ${t.backup}`);

    // 2. Crear la nueva tabla con code nullable
    await run(t.createSQL);
    console.log(`  2️⃣  Nueva tabla ${t.original} creada (code nullable)`);

    // 3. Copiar todos los datos
    await run(`INSERT INTO ${t.original} (${t.columns}) SELECT ${t.columns} FROM ${t.backup}`);
    const countRow = await get(`SELECT COUNT(*) as n FROM ${t.original}`);
    console.log(`  3️⃣  ${countRow.n} registros copiados`);

    // 4. Eliminar backup
    await run(`DROP TABLE ${t.backup}`);
    console.log(`  4️⃣  Backup eliminado`);

    console.log(`  ✅  ${t.original} migrada correctamente`);
  }

  await run('PRAGMA foreign_keys = ON');
}

migrate()
  .then(() => {
    console.log('\n🎉 Migración completada exitosamente.');
    console.log('   Los campos code de accident_type, damage_agent y contact_type');
    console.log('   ahora aceptan NULL (creación desde el módulo de configuración).');
    db.close();
  })
  .catch((err) => {
    console.error('\n❌ Error durante la migración:', err.message);
    db.close();
    process.exit(1);
  });

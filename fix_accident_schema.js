// Script de diagnóstico completo: compara el esquema del modelo Accident 
// con las columnas reales de la tabla en SQLite y agrega las que falten.
require('dotenv').config();
const { sequelize } = require('./src/models');

const EXPECTED_COLUMNS = {
  id:                        'INTEGER',
  accident_date:             'DATE',
  accident_time:             'TEXT',
  description:               'TEXT',
  management_id:             'INTEGER',
  inpsasel_file_number:      'TEXT',
  status:                    'INTEGER',
  facility_id:               'INTEGER',
  accident_type_id:          'INTEGER',
  period_id:                 'INTEGER',
  magnitude_id:              'INTEGER',
  user_id:                   'INTEGER',
  damage_agent_id:           'INTEGER',
  contact_type_id:           'INTEGER',
  custom_address_details:    'TEXT',
  medical_center_name:       'TEXT',
  medical_center_id:         'INTEGER',
  medical_center_address:    'TEXT',
  medical_observations:      'TEXT',
  global_observations:       'TEXT',
  process_status_id:         'INTEGER',
  parish_id:                 'INTEGER',
  activity:                  'TEXT',
  work_type:                 'TEXT',
  hazard_code:               'TEXT',
  contact_exposure_code:     'TEXT',
  affectation_class_code:    'TEXT',
  affectation_subject_code:  'TEXT',
  assets_process_affectation:'TEXT',
  accident_control_number:   'TEXT',
  created_at:                'DATETIME',
  updated_at:                'DATETIME',
};

async function diagnoseAndFix() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a SQLite.\n');

    // Obtener columnas actuales de la tabla accident
    const [pragmaRows] = await sequelize.query("PRAGMA table_info('accident')");
    const existingColumns = new Set(pragmaRows.map(r => r.name));

    console.log('=== COLUMNAS ACTUALES EN LA TABLA accident ===');
    pragmaRows.forEach(r => console.log(` ${r.cid}. ${r.name} (${r.type})`));

    // Detectar columnas faltantes
    const missing = [];
    for (const [col, type] of Object.entries(EXPECTED_COLUMNS)) {
      if (!existingColumns.has(col)) {
        missing.push({ col, type });
      }
    }

    if (missing.length === 0) {
      console.log('\n✅ No hay columnas faltantes en la tabla accident.');
    } else {
      console.log(`\n⚠️  Columnas FALTANTES (${missing.length}):`);
      for (const { col, type } of missing) {
        console.log(`   - ${col} (${type})`);
        await sequelize.query(`ALTER TABLE "accident" ADD COLUMN "${col}" ${type}`);
        console.log(`   ✅ Agregada: ${col}`);
      }
    }

    // Verificar también la tabla contact_type
    console.log('\n=== VERIFICANDO contact_type ===');
    const [ctPragma] = await sequelize.query("PRAGMA table_info('contact_type')");
    console.log(`contact_type tiene ${ctPragma.length} columnas.`);
    const [ctCount] = await sequelize.query("SELECT COUNT(*) as cnt FROM contact_type");
    console.log(`contact_type tiene ${ctCount[0].cnt} filas.`);

    // Verificar integrity de la FK
    const [fkCheck] = await sequelize.query("PRAGMA foreign_key_check('accident')");
    if (fkCheck.length === 0) {
      console.log('\n✅ Integridad referencial de accident: OK');
    } else {
      console.log('\n⚠️  Problemas de FK detectados:', fkCheck);
    }

    console.log('\n=== DIAGNÓSTICO COMPLETO ===');
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

diagnoseAndFix();

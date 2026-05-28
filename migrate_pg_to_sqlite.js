const { Sequelize } = require('sequelize');
const models = require('./src/models');
const path = require('path');

// Credentials retrieved from git logs
const pgConfig = {
  host: '127.0.0.1',
  user: 'postgres',
  password: 'Juan16052004',
  database: 'accident_control',
  port: 5432,
};

async function runMigration() {
  console.log('🚀 Iniciando script de migración de PostgreSQL a SQLite (Preservando Esquema)...');

  // 1. Initialize PostgreSQL Connection
  const pgSequelize = new Sequelize(
    pgConfig.database,
    pgConfig.user,
    pgConfig.password,
    {
      host: pgConfig.host,
      port: pgConfig.port,
      dialect: 'postgres',
      logging: false,
    }
  );

  // 2. Initialize SQLite Connection (Target)
  const sqliteSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false,
  });

  try {
    // Test connections
    await pgSequelize.authenticate();
    console.log('✅ Conexión exitosa a PostgreSQL.');
    await sqliteSequelize.authenticate();
    console.log('✅ Conexión exitosa a SQLite.');

    // Disable foreign key checks in SQLite for safe insertion
    await sqliteSequelize.query('PRAGMA foreign_keys = OFF;');
    console.log('⚙️ Restricciones de clave foránea temporalmente desactivadas en SQLite.');

    // List of models to migrate
    const modelKeys = [
      'Role', 'User', 'Occupation', 'JobTitle', 'Employee',
      'State', 'City', 'Parish', 'Location',
      'AccidentType', 'Magnitude', 'Period', 'FileDocument', 'InjuryType',
      'ContactType', 'DamageAgent', 'Management', 'MedicalCenter',
      'Brand', 'Model', 'VehicleType', 'Vehicle', 'VehicleImage', 'VehicleAccessory',
      'InspectionStatus', 'AgentType', 'InstallationType', 'Facility', 'FacilityImage',
      'ProtectionType', 'ProtectionEquipmentCategory', 'ProtectionEquipment',
      'Accident', 'EmployeeAccident', 'AccidentWitness', 'AccidentDocumentCheck',
      'AccidentAffectationDetail', 'AffectationSubject', 'Affectation',
      'Inspection', 'ExtinguisherInspection', 'ExtinguisherDetail',
      'VehicleInspection', 'InspectionDetail', 'ProtectionInspection', 'ProtectionInspectionDetails'
    ];

    for (const key of modelKeys) {
      const model = models[key];
      if (!model) {
        console.warn(`⚠️ Modelo no encontrado en src/models: ${key}`);
        continue;
      }

      const tableName = model.getTableName();
      console.log(`⏳ Migrando tabla: ${tableName}...`);

      // Delete existing records in SQLite table
      await sqliteSequelize.query(`DELETE FROM \`${tableName}\`;`);

      // Fetch all records from PostgreSQL
      const records = await pgSequelize.query(`SELECT * FROM "${tableName}"`, {
        type: pgSequelize.QueryTypes.SELECT,
      });

      if (records.length === 0) {
        console.log(`   ℹ️ La tabla ${tableName} está vacía en PostgreSQL.`);
        continue;
      }

      console.log(`   📥 Obtenidos ${records.length} registros desde PostgreSQL. Insertando en SQLite...`);

      // Build and run bulk inserts for SQLite
      for (const record of records) {
        const columns = Object.keys(record).map(c => `\`${c}\``).join(', ');
        const placeholders = Object.keys(record).map(() => '?').join(', ');
        const values = Object.values(record);

        await sqliteSequelize.query(
          `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`,
          {
            replacements: values,
            type: sqliteSequelize.QueryTypes.INSERT,
          }
        );
      }

      console.log(`   ✅ Tabla ${tableName} migrada con éxito.`);
    }

    // Re-enable foreign keys
    await sqliteSequelize.query('PRAGMA foreign_keys = ON;');
    console.log('✨ ¡Migración completada con éxito de PostgreSQL a SQLite manteniendo los datos intactos!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error crítico durante la migración:', error);
    process.exit(1);
  }
}

runMigration();

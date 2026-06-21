/**
 * ============================================================
 *  SCRIPT DE LIMPIEZA DE DATOS DE DEMOSTRACIÓN
 *  reset_demo_data.js
 * ============================================================
 *
 *  TABLAS QUE SE VACÍAN (registros transaccionales / de prueba):
 *    - Accidentes e incidentes (y todas sus sub-tablas)
 *    - Personal (employees) y usuarios
 *    - Inspecciones vehiculares y sus detalles
 *    - Inspecciones de extintores y sus detalles
 *    - Flota vehicular (vehículos e imágenes)
 *    - Sedes / instalaciones (y sus imágenes)
 *
 *  TABLAS QUE NO SE TOCAN (catálogos, lookups, EPP inventario):
 *    - Inventario EPP (ProtectionEquipment, ProtectionEquipmentCategory, ProtectionType)
 *    - Inspecciones de EPP (ProtectionInspection, ProtectionInspectionDetails)
 *    - Tipos de accidente, magnitudes, períodos, documentos
 *    - Agentes de contacto y daño, tipos de lesión
 *    - Tipos de vehículo, marcas, modelos, accesorios
 *    - Roles, ubicaciones geográficas, gerencias, cargos, etc.
 *
 *  ⚠  ADVERTENCIA: Este script NO se ejecuta por sí solo.
 *     Para ejecutarlo manualmente correr:
 *       node scripts/reset_demo_data.js
 *
 *  El script pide confirmación interactiva antes de proceder.
 * ============================================================
 */

'use strict';

require('dotenv').config();
const readline = require('readline');

// ── Cargar modelos ──────────────────────────────────────────
const {
  sequelize,

  // Accidentes
  AccidentWitness,
  AccidentDocumentCheck,
  AccidentAffectationDetail,
  EmployeeAccident,
  Accident,

  // Personal y usuarios
  User,
  Employee,

  // Inspecciones vehiculares
  InspectionDetail,
  VehicleInspection,

  // Inspecciones extintores
  ExtinguisherDetail,
  ExtinguisherInspection,

  // Inspección EPP (sub-registros ligados a Inspection)
  ProtectionInspectionDetails,
  ProtectionInspection,

  // Tabla madre de inspecciones
  Inspection,

  // Flota vehicular
  VehicleImage,
  Vehicle,

  // Sedes
  FacilityImage,
  Facility,
} = require('../src/models');

// ── Helpers ──────────────────────────────────────────────────

/**
 * Elimina todos los registros de un modelo de Sequelize.
 * Usa TRUNCATE cuando la BD lo soporta (PostgreSQL), y DELETE para SQLite.
 */
async function clearTable(Model, label) {
  const dialect = sequelize.getDialect();
  try {
    if (dialect === 'sqlite') {
      await Model.destroy({ where: {}, truncate: false });
    } else {
      // PostgreSQL: TRUNCATE con CASCADE para respetar FK
      const tableName = Model.getTableName();
      await sequelize.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
    }
    console.log(`  ✓  ${label}`);
  } catch (err) {
    console.error(`  ✗  ${label} → ERROR: ${err.message}`);
    throw err;
  }
}

/**
 * Pequeña pausa para que el usuario pueda leer los mensajes.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Solicita confirmación por consola.
 */
function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// ── Ejecución principal ──────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   SISTEMA ASHO — RESET DE DATOS DE DEMOSTRACIÓN      ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // Verificar conexión
  try {
    await sequelize.authenticate();
    console.log(`  BD conectada: ${sequelize.getDialect().toUpperCase()} — ${process.env.DB_HOST || 'local'}\n`);
  } catch (err) {
    console.error('  ✗  No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }

  // Confirmar antes de continuar
  const answer = await confirm(
    '  ⚠  ¿Está seguro que desea ELIMINAR los registros de demostración?\n' +
    '     Esto borrará: accidentes, personal, inspecciones, flota y sedes.\n' +
    '     El inventario EPP y los catálogos NO serán afectados.\n\n' +
    '  Escriba "SI" para confirmar: '
  );

  if (answer !== 'si') {
    console.log('\n  Operación cancelada. No se eliminó ningún dato.\n');
    process.exit(0);
  }

  console.log('\n  Iniciando limpieza...\n');
  await sleep(800);

  // ── PASO 1: Detalles de accidentes (hijos primero) ──────────
  console.log('── [1/6] Sub-registros de Accidentes ──────────────────');
  await clearTable(AccidentWitness,           'Testigos de accidentes');
  await clearTable(AccidentDocumentCheck,     'Verificación de documentos');
  await clearTable(AccidentAffectationDetail, 'Detalles de afectación');
  await clearTable(EmployeeAccident,          'Personal involucrado en accidentes');

  // ── PASO 2: Accidentes ───────────────────────────────────────
  console.log('\n── [2/6] Accidentes ────────────────────────────────────');
  await clearTable(Accident, 'Registro de accidentes / incidentes');

  // ── PASO 3: Inspecciones (detalles → sub-tipo → cabecera) ───
  console.log('\n── [3/6] Inspecciones ──────────────────────────────────');

  // Detalles vehiculares
  await clearTable(InspectionDetail,       'Detalles checklist vehicular');
  await clearTable(VehicleInspection,      'Inspecciones vehiculares');

  // Extintores
  await clearTable(ExtinguisherDetail,     'Detalles de extintores');
  await clearTable(ExtinguisherInspection, 'Inspecciones de extintores');

  // EPP (sub-registros ligados a la tabla madre Inspection)
  await clearTable(ProtectionInspectionDetails, 'Detalles de inspecciones EPP');
  await clearTable(ProtectionInspection,        'Inspecciones de EPP');

  // Tabla madre
  await clearTable(Inspection, 'Registro maestro de inspecciones');

  // ── PASO 4: Flota vehicular ──────────────────────────────────
  console.log('\n── [4/6] Flota Vehicular ───────────────────────────────');
  await clearTable(VehicleImage, 'Imágenes de vehículos');
  await clearTable(Vehicle,      'Registro de vehículos');

  // ── PASO 5: Personal y usuarios ─────────────────────────────
  console.log('\n── [5/6] Personal y Usuarios ───────────────────────────');
  await clearTable(User,     'Usuarios del sistema');
  await clearTable(Employee, 'Registro de personal');

  // ── PASO 6: Sedes / Instalaciones ───────────────────────────
  console.log('\n── [6/6] Sedes e Instalaciones ─────────────────────────');
  await clearTable(FacilityImage, 'Imágenes de sedes');
  await clearTable(Facility,      'Sedes / instalaciones');

  // ── Resumen ──────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  ✓  Limpieza completada con éxito.                    ║');
  console.log('║     Catálogos y EPP intactos.                         ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  await sequelize.close();
  process.exit(0);
}

main().catch(err => {
  console.error('\n  ERROR FATAL:', err.message);
  process.exit(1);
});

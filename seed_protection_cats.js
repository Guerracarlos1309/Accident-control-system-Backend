const sequelize = require('./src/config/database');
const { ProtectionEquipmentCategory, ProtectionEquipment, ProtectionInspectionDetails } = require('./src/models');

const categoriesToSeed = [
  // --- EQUIPOS DE PROTECCIÓN PERSONAL (EPP) ---
  { id: 1, name: 'CASCO SEGURIDAD BLANCO C/AJUSTADOR LOGO', protectionTypeId: 1, description: 'PIEZAS' },
  { id: 2, name: 'PANTALLA FACIAL ADAPTADO A CASCO', protectionTypeId: 1, description: 'PIEZAS' },
  { id: 3, name: 'PROTECTOR AUDITIVO ADAPTADO A CASCO', protectionTypeId: 1, description: 'PIEZAS' },
  { id: 4, name: 'MANGA DIELECTR C/ARNES/BOLSO CL-2 20KV', protectionTypeId: 1, description: 'PARES' },
  { id: 5, name: 'MANGA DIELECTR C/ARNES/BOLSO CL-4 40KV', protectionTypeId: 1, description: 'PARES' },
  { id: 6, name: 'GUANTE ABSORBENTE 100% ALGODON', protectionTypeId: 1, description: 'PARES' },
  { id: 7, name: 'GUANTE GOMA DIELECTR 20KV', protectionTypeId: 1, description: 'PARES' },
  { id: 8, name: 'GUANTE GOMA DIELECTR 40KV', protectionTypeId: 1, description: 'PARES' },
  { id: 9, name: 'GUANTE PROTECT CUERO CHIVO AT', protectionTypeId: 1, description: 'PARES' },
  { id: 10, name: 'BOLSA PARA GUANTES DE ALTA TENSION', protectionTypeId: 1, description: 'PIEZAS' },
  { id: 11, name: 'GUANTE GOMA DIELEC. B.T 750V', protectionTypeId: 1, description: 'PARES' },
  { id: 12, name: 'GUANTE GOMA DIELECTR 5KV', protectionTypeId: 1, description: 'PARES' },
  { id: 13, name: 'GUANTE PROTECT CUERO CHIVO BT', protectionTypeId: 1, description: 'PARES' },
  { id: 14, name: 'BOLSA PARA GUANTES DE BAJA TENSION', protectionTypeId: 1, description: 'PIEZAS' },
  { id: 15, name: 'GUANTE NEOPREN RESIST ACIDO 32"', protectionTypeId: 1, description: 'PARES' },
  { id: 16, name: 'GUANTE DE TELA Y KEVLAR USO INDUSTR', protectionTypeId: 1, description: 'PARES' },
  { id: 17, name: 'ARNES CORPORAL AJUST', protectionTypeId: 1, description: 'JUEGO' },
  { id: 18, name: 'ESLINGA ABSORB ENERGIA 1,8M 2 EXTREMOS', protectionTypeId: 1, description: 'PIEZAS' },
  { id: 19, name: 'ESLINGA DE SEGURIDAD PARA POSICIONAMIENT', protectionTypeId: 1, description: 'PIEZAS' },
  { id: 20, name: 'BOLSO ACARREO SIST PROTECC CAIDAS', protectionTypeId: 1, description: 'PIEZAS' },
  { id: 21, name: 'CINTA DE ANCLAJE', protectionTypeId: 1, description: 'PIEZAS' },
  { id: 22, name: 'ESLINGA ABSORB ENERGIA 1,8M 3 EXTREMOS', protectionTypeId: 1, description: 'PIEZAS' },
  { id: 23, name: 'SILLA SUBPELVICA S/DIELECTR TRABAJ/CALIEN', protectionTypeId: 1, description: 'PIEZAS' },

  // --- EQUIPOS DE PROTECCIÓN COLECTIVA (EPC) ---
  { id: 24, name: 'VERIFICADOR AUSENCIA TENSION 5-36KV', protectionTypeId: 2, description: 'EQUIPO' },
  { id: 25, name: 'VERIFICADOR AUSENCIA TENSION 0-600 KV', protectionTypeId: 2, description: 'EQUIPO' },
  { id: 26, name: 'VERIFICADOR TENSION SINCONTACTO 50-1000V', protectionTypeId: 2, description: 'EQUIPO' },
  { id: 27, name: 'VERIFICADOR AUSENCIA TENSION 10-30 KV', protectionTypeId: 2, description: 'EQUIPO' },
  { id: 28, name: 'VERIFICADOR TENSION 60-110KV 60HZ', protectionTypeId: 2, description: 'EQUIPO' },
  { id: 29, name: 'GANCHO PERTIGAS TELESCOPICA', protectionTypeId: 2, description: 'PIEZAS' },
  { id: 30, name: 'PERTIGA TELESCOPICA 10.7M (35\') C/ESTUCH', protectionTypeId: 2, description: 'PIEZAS' },
  { id: 31, name: 'MANTA DIELECTRICA 40KV CERRADA', protectionTypeId: 2, description: 'PIEZAS' },
  { id: 32, name: 'MANTA DIELECTRICA 40KV ABIERTA', protectionTypeId: 2, description: 'PIEZAS' },
  { id: 33, name: 'TUBO PVC GUARDAR MANTAS GOMA AT-0\'\'-40\'\'', protectionTypeId: 2, description: 'PIEZAS' },
  { id: 34, name: 'EQUIPO PUESTA A TIERRA BT HASTA 1/0AWG', protectionTypeId: 2, description: 'EQUIPO' },
  { id: 35, name: 'EQUIPO PUESTA A TIERRA BT 2AWG', protectionTypeId: 2, description: 'EQUIPO' },
  { id: 36, name: 'EQUIPO PUESTA A TIERRA TEMPORAL SUBT', protectionTypeId: 2, description: 'EQUIPO' },
  { id: 37, name: 'EQUIPO PUESTA A TIERRA TORRE AT', protectionTypeId: 2, description: 'EQUIPO' },
  { id: 38, name: 'MEDIDOR DE ATMOSFERA PELIGROSA', protectionTypeId: 2, description: 'EQUIPO' }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync database schema to apply name column expansion (30 -> 100)
    console.log('Synchronizing database schema alterations...');
    await sequelize.sync({ alter: true });

    // 1. Clear existing inspection details to prevent foreign key errors
    console.log('Cleaning old inspection details...');
    await ProtectionInspectionDetails.destroy({ where: {} });

    // 2. Clear old equipment
    console.log('Cleaning old equipment records...');
    await ProtectionEquipment.destroy({ where: {} });

    // 3. Clear old categories
    console.log('Cleaning old categories...');
    await ProtectionEquipmentCategory.destroy({ where: {} });

    // 4. Seed new categories
    console.log('Seeding 38 CORPOELEC protection categories...');
    await ProtectionEquipmentCategory.bulkCreate(categoriesToSeed);
    
    console.log('🎉 38 CORPOELEC categories seeded successfully!');

    // 5. Optionally seed an initial equipment stock item using the first seeded category
    await ProtectionEquipment.create({
      id: 1,
      name: 'Casco de Seguridad Blanco Ajustador Logo',
      categoryId: 1,
      totalQuantity: 200,
      operativeQuantity: 190
    });
    console.log('Initial equipment inventory linked and seeded.');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await sequelize.close();
  }
}

seed();

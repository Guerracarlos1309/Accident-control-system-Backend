const { sequelize, AccidentType, DamageAgent, ContactType, Magnitude } = require('../src/models');

async function run() {
  try {
    console.log('--- Truncating existing Accident related tables ---');
    // Disable constraints or use CASCADE to clean cleanly
    await sequelize.query('TRUNCATE TABLE "accident" CASCADE;');
    await sequelize.query('TRUNCATE TABLE "accident_type" CASCADE;');
    await sequelize.query('TRUNCATE TABLE "damage_agent" CASCADE;');
    await sequelize.query('TRUNCATE TABLE "contact_type" CASCADE;');
    await sequelize.query('TRUNCATE TABLE "magnitude" CASCADE;');

    console.log('✅ Tables truncated.');

    // 1. POPULATE ACCIDENT TYPES (C.2)
    console.log('⏳ Seeding Accident Types (C.2)...');
    await AccidentType.bulkCreate([
      { id: 100, code: 'C.2.1', name: 'Laboral', parentId: null },
      { id: 101, code: 'C.2.1.1', name: 'En el curso del trabajo (CT)', parentId: 100 },
      { id: 102, code: 'C.2.1.2', name: 'En ocasión del trabajo (OC)', parentId: 100 },
      
      { id: 110, code: 'C.2.2', name: 'Incidentes no laborales', parentId: null },
      { id: 111, code: 'C.2.2.1', name: 'Fuera del curso u ocasión de trabajo (FCOT)', parentId: 110 },
      { id: 112, code: 'C.2.2.2', name: 'Condición o estado patológico no laboral (CPNL)', parentId: 110 },
      
      { id: 120, code: 'C.2.3', name: 'Terceros Relacionados', parentId: null },
      { id: 121, code: 'C.2.3.1', name: 'Actividades inherentes o conexas (AIC)', parentId: 120 },
      { id: 122, code: 'C.2.3.2', name: 'Actividades no inherentes o conexas (NAIC)', parentId: 120 },
      
      { id: 130, code: 'C.2.4', name: 'Tercero no relacionado', parentId: null },
      { id: 131, code: 'C.2.4.1', name: 'Actividades dentro de la zona de seguridad (ADZS)', parentId: 130 },
      { id: 132, code: 'C.2.4.3', name: 'Hurto de activos del sistema eléctrico (HASE)', parentId: 130 },
      
      { id: 140, code: 'C.2.5', name: 'Operacional', parentId: null },
      { id: 141, code: 'C.2.5.1', name: 'Elemento estructural (EE)', parentId: 140 },
      { id: 142, code: 'C.2.5.2', name: 'Elemento operacional / de equipo (EO)', parentId: 140 },
      
      { id: 150, code: 'C.2.6', name: 'Traslado / Tránsito (TR)', parentId: null },
      { id: 160, code: 'C.2.7', name: 'Ambiental', parentId: null }
    ]);
    console.log('✅ Accident Types seeded.');

    // 2. POPULATE DAMAGE AGENTS (C.4)
    console.log('⏳ Seeding Damage Agents (C.4)...');
    await DamageAgent.bulkCreate([
      { id: 200, code: 'C.4.1', name: 'Agente / Elemento', parentId: null },
      { id: 201, code: 'C.4.1.1', name: 'Físico Elemento', parentId: 200 },
      { id: 202, code: 'C.4.1.2', name: 'Mecánico Elemento', parentId: 200 },
      { id: 203, code: 'C.4.1.3', name: 'Químico Elemento', parentId: 200 },
      { id: 204, code: 'C.4.1.4', name: 'Biológico Elemento', parentId: 200 },
      
      { id: 210, code: 'C.4.2', name: 'Condición / Elemento', parentId: null },
      { id: 211, code: 'C.4.2.1', name: 'Psicosocial Elemento', parentId: 210 },
      { id: 212, code: 'C.4.2.2', name: 'Disergonómica Elemento', parentId: 210 },
      { id: 213, code: 'C.4.2.3', name: 'Protocolo o procedimiento de trabajo Elemento', parentId: 210 },
      { id: 214, code: 'C.4.2.4', name: 'Operacional Elemento (B.3)', parentId: 210 },
      { id: 215, code: 'C.4.2.5', name: 'Traslado / Tránsito (TR) (Acuático, Aéreo, Terrestre)', parentId: 210 },
      { id: 216, code: 'C.4.2.6', name: 'Ambiental Elemento', parentId: 210 },
      
      { id: 220, code: 'C.4.3', name: 'Exógeno Antrópico', parentId: null }
    ]);
    console.log('✅ Damage Agents seeded.');

    // 3. POPULATE CONTACT TYPES (C.5)
    console.log('⏳ Seeding Contact Types (C.5)...');
    await ContactType.bulkCreate([
      { id: 300, code: 'C.5.1', name: 'Golpeado', parentId: null },
      { id: 310, code: 'C.5.2', name: 'Atrapado', parentId: null },
      
      { id: 320, code: 'C.5.3', name: 'Contacto con', parentId: null },
      { id: 321, code: 'C.5.3.1', name: 'Elementos físicos', parentId: 320 },
      { id: 322, code: 'C.5.3.2', name: 'Elementos mecánicos', parentId: 320 },
      { id: 323, code: 'C.5.3.3', name: 'Elementos químicos', parentId: 320 },
      { id: 324, code: 'C.5.3.4', name: 'Elementos biológicos', parentId: 320 },
      
      { id: 330, code: 'C.5.4', name: 'Caída', parentId: null },
      { id: 331, code: 'C.5.4.1', name: 'Por Nivel', parentId: 330 },
      { id: 332, code: 'C.5.4.2', name: 'De objetos', parentId: 330 },
      
      { id: 340, code: 'C.5.5', name: 'Colisión con', parentId: null },
      { id: 350, code: 'C.5.6', name: 'Pisar sobre', parentId: null },
      
      { id: 360, code: 'C.5.7', name: 'Envuelto por', parentId: null },
      { id: 361, code: 'C.5.7.1', name: 'Atmósfera peligrosa', parentId: 360 },
      { id: 362, code: 'C.5.7.2', name: 'Líquido', parentId: 360 },
      { id: 363, code: 'C.5.7.3', name: 'Sólidos en suspensión', parentId: 360 },
      
      { id: 370, code: 'C.5.8', name: 'Exposición a', parentId: null },
      { id: 371, code: 'C.5.8.1', name: 'Presión', parentId: 370 },
      { id: 372, code: 'C.5.8.2', name: 'Agentes biológicos', parentId: 370 },
      { id: 373, code: 'C.5.8.3', name: 'Factores Psicosociales', parentId: 370 },
      
      { id: 380, code: 'C.5.9', name: 'Otra forma no clasificada', parentId: null }
    ]);
    console.log('✅ Contact Types seeded.');

    // 4. POPULATE MAGNITUDES (C.6)
    console.log('⏳ Seeding Magnitudes (C.6)...');
    await Magnitude.bulkCreate([
      { id: 1, value: 0, description: 'Magnitud 0' },
      { id: 2, value: 1, description: 'Magnitud 1' },
      { id: 3, value: 2, description: 'Magnitud 2' },
      { id: 4, value: 3, description: 'Magnitud 3' },
      { id: 5, value: 4, description: 'Magnitud 4' }
    ]);
    console.log('✅ Magnitudes seeded.');

    console.log('🎉 POPULATION SUCCESSFULLY COMPLETED!');
  } catch (error) {
    console.error('❌ Error seeding lookups:', error);
  } finally {
    process.exit();
  }
}

run();

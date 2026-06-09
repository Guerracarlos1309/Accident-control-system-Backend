const { sequelize, JobTitle, Occupation } = require('./src/models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    console.log('Upserting Occupations (Categorías Profesionales)...');
    const occupations = [
      { id: 1, name: 'DIRECTIVO / GERENCIAL', description: 'Personal de alta dirección, directores, gerentes y subgerentes' },
      { id: 2, name: 'TÉCNICO / ESPECIALISTA', description: 'Ingenieros, analistas, planificadores y profesionales ASHO' },
      { id: 3, name: 'OPERATIVO / CAMPO', description: 'Linieros, electricistas, operadores de plantas, choferes y mecánicos' },
      { id: 4, name: 'ADMINISTRATIVO / SOPORTE', description: 'Secretarias, asistentes, almacén, atención al cliente y RH' },
      { id: 5, name: 'SUPERVISOR DE CAMPO', description: 'Jefes de cuadrilla o supervisores directos de áreas operativas' }
    ];
    for (const occ of occupations) {
      await Occupation.upsert(occ);
    }

    console.log('Upserting Job Titles (Cargos Institucionales)...');
    const jobTitles = [
      // ASHO Group
      { id: 1, name: 'INGENIERO DE RIESGOS / INSPECTOR ASHO', description: 'Supervisión de riesgos laborales e inspecciones' },
      { id: 2, name: 'ANALISTA DE SALUD OCUPACIONAL', description: 'Análisis y control de salud ocupacional' },
      { id: 3, name: 'TÉCNICO EN PREVENCIÓN DE ACCIDENTES', description: 'Prevención de incidentes y accidentes industriales' },
      { id: 4, name: 'MÉDICO / ENFERMERO LABORAL', description: 'Atención primaria y de salud laboral' },

      // Operaciones / Campo Group
      { id: 10, name: 'OPERADOR DE SUBESTACIONES / PLANTAS', description: 'Operaciones de campo' },
      { id: 11, name: 'TÉCNICO ELECTRICISTA DE DISTRIBUCIÓN (O TRANSMISIÓN)', description: 'Operaciones de campo' },
      { id: 12, name: 'LINIERO DE REDES ELÉCTRICAS', description: 'Operaciones de campo' },
      { id: 13, name: 'SUPERVISOR DE CUADRILLA MANTENIMIENTO', description: 'Operaciones de campo' },
      { id: 14, name: 'MONTACARGUISTA / OPERADOR DE MAQUINARIA PESADA', description: 'Operaciones de campo' },

      // Administrativo / Soporte Group
      { id: 20, name: 'ANALISTA DE RECURSOS HUMANOS', description: 'Administrativo y soporte' },
      { id: 21, name: 'ASISTENTE ADMINISTRATIVO', description: 'Administrativo y soporte' },
      { id: 22, name: 'ANALISTA DE PLANIFICACIÓN Y CONTROL', description: 'Administrativo y soporte' },
      { id: 23, name: 'ESPECIALISTA EN SOPORTE TÉCNICO (SISTEMAS/TI)', description: 'Administrativo y soporte' }
    ];
    for (const jt of jobTitles) {
      await JobTitle.upsert(jt);
    }

    console.log('🎉 HR Lookups seeded successfully!');
  } catch (error) {
    console.error('Error seeding HR lookups:', error);
  } finally {
    await sequelize.close();
  }
}

seed();

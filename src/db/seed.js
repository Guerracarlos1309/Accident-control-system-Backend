const { 
  sequelize, 
  Role, User, Occupation, Department, JobTitle, Employee,
  State, City, Parish, Location,
  Accident, AccidentType, Magnitude, Period, FileDocument, AccidentDocumentCheck, 
  AccidentAffectationDetail, AffectationSubject, Affectation, ContactType, DamageAgent, 
  EmployeeAccident, InjuryType,
  Brand, Model, VehicleType, Vehicle, VehicleAccessory,
  InspectionStatus, Inspection, AgentType, ExtinguisherInspection, ExtinguisherDetail, 
  VehicleInspection, InspectionDetail
} = require('../models');

async function seed() {
  try {
    console.log('--- Iniciando Limpieza y Creación de Tablas ---');
    
    // Force sync to reset schema
    await sequelize.sync({ force: true });
    
    console.log('✅ Base de datos recreada con éxito');

    // 1. Roles
    const roles = await Role.bulkCreate([
      { id: 1, name: 'Administrador', description: 'Acceso total al sistema' },
      { id: 2, name: 'Inspector', description: 'Realiza inspecciones y reportes' }
    ]);

    // 2. Admin User
    await User.create({
      id: 1,
      username: 'admin',
      password: 'admin123',
      roleId: 1
    });
    console.log('✅ Usuario admin: admin / admin123');

    // 3. Geography
    const state = await State.create({ id: 1, name: 'Distrito Capital' });
    const city = await City.create({ id: 1, name: 'Caracas', stateId: state.id });
    const parish = await Parish.create({ id: 1, name: 'Coche', cityId: city.id });
    const location = await Location.create({ id: 1, name: 'Almacén Principal', parishId: parish.id });

    // 4. Inspection Status
    await InspectionStatus.bulkCreate([
      { id: 1, name: 'Pendiente' },
      { id: 2, name: 'En Proceso' },
      { id: 3, name: 'Completada' }
    ]);

    // 5. Periods
    await Period.bulkCreate([
      { id: 1, annuality: 2024 },
      { id: 2, annuality: 2025 },
      { id: 3, annuality: 2026 }
    ]);

    // 6. File Documents
    await FileDocument.bulkCreate([
      { id: 1, name: 'Formulario 14-08', description: 'Declaración Inpsasel' },
      { id: 2, name: 'Informe Médico', description: 'Resultados de evaluación' },
      { id: 3, name: 'Cédula de Identidad', description: 'Identificación del afectado' }
    ]);

    // 7. --- OFFICIAL ACCIDENT MASTER DATA ---

    // 7.1 Accident Types
    await AccidentType.bulkCreate([
      { id: 1, code: 'LAB', name: 'Laboral', description: 'Incidente laboral', parent_id: null },
      { id: 2, code: 'NOL', name: 'No laboral', description: 'Incidente no laboral', parent_id: null },
      { id: 3, code: 'TER', name: 'Tercero relacionado', description: 'Incidente de tercero relacionado', parent_id: null },
      { id: 4, code: 'TNR', name: 'Tercero no relacionado', description: 'Incidente de tercero no relacionado', parent_id: null },
      { id: 5, code: 'OPE', name: 'Operacional', description: 'Incidente operacional', parent_id: null },
      { id: 6, code: 'TRA', name: 'Traslado/Tránsito', description: 'Incidente en traslado', parent_id: null },
      { id: 7, code: 'AMB', name: 'Ambiental', description: 'Incidente ambiental', parent_id: null },
      
      { id: 10, code: 'CT', name: 'En el curso del trabajo', description: '', parent_id: 1 },
      { id: 11, code: 'OC', name: 'En ocasión del trabajo', description: '', parent_id: 1 },
      { id: 20, code: 'FCOT', name: 'Fuera del trabajo', description: '', parent_id: 2 },
      { id: 21, code: 'CPNL', name: 'Condición patológica', description: '', parent_id: 2 },
      { id: 30, code: 'AIC', name: 'Actividades inherentes', description: '', parent_id: 3 },
      { id: 31, code: 'NAIC', name: 'Actividades no inherentes', description: '', parent_id: 3 },
      { id: 40, code: 'ADZS', name: 'Zona de seguridad', description: '', parent_id: 4 },
      { id: 41, code: 'CMNA', name: 'Manipulación no autorizada', description: '', parent_id: 4 },
      { id: 42, code: 'HASE', name: 'Hurto de activos', description: '', parent_id: 4 },
      { id: 50, code: 'EE', name: 'Elemento estructural', description: '', parent_id: 5 },
      { id: 51, code: 'EO', name: 'Elemento de equipo', description: '', parent_id: 5 },
      { id: 52, code: 'EXO', name: 'Elemento exógeno', description: '', parent_id: 5 },
      { id: 60, code: 'TERRE', name: 'Terrestre', description: '', parent_id: 6 },
      { id: 61, code: 'ACUA', name: 'Acuático', description: '', parent_id: 6 },
      { id: 62, code: 'AERE', name: 'Aéreo', description: '', parent_id: 6 },
      { id: 70, code: 'GEO', name: 'Geológico', description: '', parent_id: 7 },
      { id: 71, code: 'HID', name: 'Hidrometeorológico', description: '', parent_id: 7 },
      { id: 72, code: 'ATM', name: 'Atmosférico', description: '', parent_id: 7 }
    ]);

    // 7.2 Damage Agents
    await DamageAgent.bulkCreate([
      { id: 1, code: 'FIS', name: 'Físico', description: '', parent_id: null },
      { id: 10, code: 'MEC', name: 'Mecánico', description: '', parent_id: null },
      { id: 20, code: 'QUI', name: 'Químico', description: '', parent_id: null },
      { id: 30, code: 'BIO', name: 'Biológico', description: '', parent_id: null },
      { id: 40, code: 'PSI', name: 'Psicosocial', description: '', parent_id: null },
      { id: 50, code: 'ERG', name: 'Disergonómico', description: '', parent_id: null },
      { id: 60, code: 'OPE', name: 'Operacional', description: '', parent_id: null },
      { id: 70, code: 'AMB', name: 'Ambiental', description: '', parent_id: null },

      { id: 2, code: 'ELEC', name: 'Electricidad', description: '', parent_id: 1 },
      { id: 3, code: 'RUID', name: 'Ruido', description: '', parent_id: 1 },
      { id: 4, code: 'TEMP', name: 'Temperatura extrema', description: '', parent_id: 1 },
      { id: 5, code: 'RAD', name: 'Radiación', description: '', parent_id: 1 },
      { id: 11, code: 'MOV', name: 'Elemento en movimiento', description: '', parent_id: 10 },
      { id: 12, code: 'COR', name: 'Cortante', description: '', parent_id: 10 },
      { id: 13, code: 'PUN', name: 'Punzante', description: '', parent_id: 10 },
      { id: 14, code: 'CONT', name: 'Contuso', description: '', parent_id: 10 },
      { id: 21, code: 'TOX', name: 'Tóxico', description: '', parent_id: 20 },
      { id: 22, code: 'CORR', name: 'Corrosivo', description: '', parent_id: 20 },
      { id: 23, code: 'INF', name: 'Inflamable', description: '', parent_id: 20 },
      { id: 31, code: 'BAC', name: 'Bacterias', description: '', parent_id: 30 },
      { id: 32, code: 'VIR', name: 'Virus', description: '', parent_id: 30 },
      { id: 33, code: 'ANI', name: 'Animales', description: '', parent_id: 30 },
      { id: 41, code: 'COMP', name: 'Comportamiento inadecuado', description: '', parent_id: 40 },
      { id: 51, code: 'POST', name: 'Postura', description: '', parent_id: 50 },
      { id: 61, code: 'INC', name: 'Incendio', description: '', parent_id: 60 },
      { id: 62, code: 'EXP', name: 'Explosión', description: '', parent_id: 60 },
      { id: 71, code: 'SIS', name: 'Sismo', description: '', parent_id: 70 },
      { id: 72, code: 'LLUV', name: 'Lluvia', description: '', parent_id: 70 },
      { id: 73, code: 'VIEN', name: 'Viento', description: '', parent_id: 70 }
    ]);

    // 7.3 Contact Types
    await ContactType.bulkCreate([
      { id: 1, code: 'GOL', name: 'Golpeado', description: '', parent_id: null },
      { id: 2, code: 'ATR', name: 'Atrapado', description: '', parent_id: null },
      { id: 3, code: 'CON', name: 'Contacto con', description: '', parent_id: null },
      { id: 4, code: 'CAI', name: 'Caída', description: '', parent_id: null },
      { id: 5, code: 'COL', name: 'Colisión', description: '', parent_id: null },
      { id: 6, code: 'PIS', name: 'Pisar sobre', description: '', parent_id: null },
      { id: 7, code: 'ENV', name: 'Envuelto por', description: '', parent_id: null },
      { id: 8, code: 'EXP', name: 'Exposición a', description: '', parent_id: null },

      { id: 10, code: 'GCON', name: 'Contra', description: '', parent_id: 1 },
      { id: 11, code: 'GPOR', name: 'Por', description: '', parent_id: 1 },
      { id: 20, code: 'ADEB', name: 'Debajo', description: '', parent_id: 2 },
      { id: 21, code: 'AENT', name: 'Entre', description: '', parent_id: 2 },
      { id: 30, code: 'ELEC', name: 'Electricidad', description: '', parent_id: 3 },
      { id: 31, code: 'QUI', name: 'Químico', description: '', parent_id: 3 },
      { id: 40, code: 'CMIS', name: 'Mismo nivel', description: '', parent_id: 4 },
      { id: 41, code: 'CDIF', name: 'Diferente nivel', description: '', parent_id: 4 },
      { id: 50, code: 'CFI', name: 'Objeto fijo', description: '', parent_id: 5 },
      { id: 51, code: 'CMOV', name: 'Objeto en movimiento', description: '', parent_id: 5 },
      { id: 60, code: 'ATM', name: 'Atmósfera peligrosa', description: '', parent_id: 7 },
      { id: 61, code: 'LIQ', name: 'Líquido', description: '', parent_id: 7 },
      { id: 70, code: 'PRES', name: 'Presión', description: '', parent_id: 8 },
      { id: 71, code: 'BIO', name: 'Agente biológico', description: '', parent_id: 8 }
    ]);

    // 7.4 Magnitudes
    await Magnitude.bulkCreate([
      { id: 1, value: 0, description: 'Sin afectación' },
      { id: 2, value: 1, description: 'Leve' },
      { id: 3, value: 2, description: 'Moderada' },
      { id: 4, value: 3, description: 'Grave' },
      { id: 5, value: 4, description: 'Mortal' }
    ]);

    // 7.5 Affectations
    await Affectation.bulkCreate([
      { id: 1, code: 'SIN', name: 'Sin afectación', description: '', parent_id: null },
      { id: 2, code: 'CON', name: 'Con afectación', description: '', parent_id: null },

      { id: 10, code: 'LES', name: 'Lesión', description: '', parent_id: 2 },
      { id: 11, code: 'FAT', name: 'Fatalidad', description: '', parent_id: 2 },
      { id: 12, code: 'ENF', name: 'Enfermedad', description: '', parent_id: 2 },
      { id: 13, code: 'ACT', name: 'Daño a activos', description: '', parent_id: 2 },
      { id: 14, code: 'AMB', name: 'Daño ambiental', description: '', parent_id: 2 },
      { id: 15, code: 'REG', name: 'Incumplimiento normativo', description: '', parent_id: 2 }
    ]);

    // 7.6 Affectation Subjects
    await AffectationSubject.bulkCreate([
      { id: 1, code: 'PER', name: 'Personas', description: '', parent_id: null },
      { id: 2, code: 'BIE', name: 'Bienes', description: '', parent_id: null },
      { id: 3, code: 'PRO', name: 'Procesos', description: '', parent_id: null },
      { id: 4, code: 'AMB', name: 'Ambiente', description: '', parent_id: null },

      { id: 10, code: 'TRA', name: 'Trabajador', description: '', parent_id: 1 },
      { id: 11, code: 'TER', name: 'Tercero relacionado', description: '', parent_id: 1 },
      { id: 20, code: 'EQU', name: 'Equipos', description: '', parent_id: 2 },
      { id: 21, code: 'INS', name: 'Instalaciones', description: '', parent_id: 2 },
      { id: 22, code: 'VEH', name: 'Vehículos', description: '', parent_id: 2 },
      { id: 30, code: 'GEN', name: 'Generación', description: '', parent_id: 3 },
      { id: 31, code: 'TRA', name: 'Transmisión', description: '', parent_id: 3 },
      { id: 32, code: 'DIS', name: 'Distribución', description: '', parent_id: 3 },
      { id: 40, code: 'SUE', name: 'Suelo', description: '', parent_id: 4 },
      { id: 41, code: 'AGU', name: 'Agua', description: '', parent_id: 4 },
      { id: 42, code: 'FAU', name: 'Fauna', description: '', parent_id: 4 }
    ]);

    // 7.7 Injury Types
    await InjuryType.bulkCreate([
      { id: 1, name: 'Ahogamiento', description: '' },
      { id: 2, name: 'Amputación', description: '' },
      { id: 3, name: 'Contusión', description: '' },
      { id: 4, name: 'Aplastamiento', description: '' },
      { id: 5, name: 'Efecto eléctrico', description: '' },
      { id: 6, name: 'Quemaduras', description: '' },
      { id: 7, name: 'Fractura', description: '' },
      { id: 8, name: 'Esguince', description: '' },
      { id: 9, name: 'Luxación', description: '' },
      { id: 10, name: 'Herida', description: '' },
      { id: 11, name: 'Lesión interna', description: '' },
      { id: 12, name: 'Traumatismo', description: '' },
      { id: 13, name: 'Envenenamiento', description: '' },
      { id: 14, name: 'Reacción alérgica', description: '' },
      { id: 15, name: 'Trauma psicológico', description: '' }
    ]);

    // 8. Test Data: Employees
    const employee = await Employee.create({
      personalNumber: 'EMP001',
      idCard: 'V-12345678',
      firstName: 'Juan',
      lastName: 'Pérez',
      status: 1
    });

    // 9. Vehicles
    const brand = await Brand.create({ id: 1, name: 'Toyota' });
    const model = await Model.create({ id: 1, name: 'Hilux', brandId: brand.id });
    const vehicleType = await VehicleType.create({ id: 1, name: 'Camioneta' });
    await Vehicle.create({
      plate: 'ABC-123',
      modelId: model.id,
      vehicleTypeId: vehicleType.id,
      color: 'Blanco',
      year: 2022
    });

    // 10. Sample Accidents (Exactly 3)
    const acc1 = await Accident.create({
      id: 1,
      accidentDate: '2024-04-01',
      accidentTime: '08:30:00',
      description: 'Caída de altura en almacén principal',
      location_id: 1,
      accident_type_id: 10, // Laboral -> En el curso
      period_id: 1,
      user_id: 1,
      damage_agent_id: 10, // Mecánico
      contact_type_id: 41, // Caída -> Dif nivel
      status: 1
    });

    await EmployeeAccident.create({
      accidentId: acc1.id,
      employeeId: employee.personalNumber,
      injuryTypeId: 7, // Fractura
      restDays: 30,
      magnitudeId: 4 // Grave
    });

    await AccidentDocumentCheck.bulkCreate([
      { accidentId: acc1.id, documentId: 1, delivered: true, receivedDate: '2024-04-02', observation: 'Entregado a tiempo' },
      { accidentId: acc1.id, documentId: 2, delivered: false }
    ]);

    const acc2 = await Accident.create({
      id: 2,
      accidentDate: '2024-04-03',
      accidentTime: '15:45:00',
      description: 'Corte mecánico al manipular herramientas',
      location_id: 1,
      accident_type_id: 10,
      period_id: 1,
      user_id: 1,
      damage_agent_id: 12, // Cortante
      contact_type_id: 11, // Golpeado por
      status: 1
    });

    await EmployeeAccident.create({
      accidentId: acc2.id,
      employeeId: employee.personalNumber,
      injuryTypeId: 10, // Herida
      restDays: 5,
      magnitudeId: 2 // Leve
    });

    const acc3 = await Accident.create({
      id: 3,
      accidentDate: '2024-04-05',
      accidentTime: '10:00:00',
      description: 'Accidente de tránsito en ruta de despacho',
      location_id: 1,
      accident_type_id: 60, // Tránsito -> Terrestre
      period_id: 1,
      user_id: 1,
      damage_agent_id: 11, // Elemento en mov
      contact_type_id: 50, // Colisión -> Fijo
      status: 1
    });

    await AccidentAffectationDetail.create({
      accidentId: acc3.id,
      affectationId: 13, // Daño activo
      affectationSubjectId: 22, // Vehículos
      magnitudeId: 3 // Moderada
    });

    console.log('✅ Datos de prueba y oficiales cargados con éxito');

    // 11. --- Post-Seed: Fix Postgres Sequences ---
    // This is crucial when explicit IDs are provided to avoid "duplicate key" errors on next inserts
    if (sequelize.getDialect() === 'postgres') {
      const tables = [
        'role', 'users', 'occupation', 'department', 'job_title', 
        'state', 'city', 'parish', 'location', 
        'accident_type', 'magnitude', 'period', 'file_documents', 
        'affectation', 'affectation_subject', 'injury_type', 'accident',
        'brand', 'model', 'vehicle_type', 'inspection_status'
      ];

      for (const table of tables) {
        // Double quotes for table names in case of reserved words like "users"
        await sequelize.query(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), (SELECT MAX(id) FROM "${table}"));`);
      }
      console.log('✅ Secuencias de base de datos sincronizadas');
    }

    console.log('--- Seed completado con éxito ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
}

seed();

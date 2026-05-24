const { 
  sequelize, 
  Role, User, Occupation, Department, JobTitle, Employee,
  State, City, Parish, Location,
  Accident, AccidentType, Magnitude, Period, FileDocument, AccidentDocumentCheck, 
  AccidentAffectationDetail, AffectationSubject, Affectation, ContactType, DamageAgent, 
  EmployeeAccident, InjuryType, Management,
  Brand, Model, VehicleType, Vehicle, VehicleAccessory,
  InspectionStatus, Inspection, AgentType, ExtinguisherInspection, ExtinguisherDetail, 
  VehicleInspection, InspectionDetail,
  InstallationType, Facility, ProtectionType, ProtectionEquipmentCategory, 
  ProtectionEquipment, ProtectionInspection, ProtectionInspectionDetails
} = require('../models');

async function seed() {
  try {
    console.log('--- 🚀 Iniciando Poblado Integral de la Base de Datos ---');
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos recreada (Tablas limpias)');

    // --- FASE 1: DATOS MAESTROS FUNDAMENTALES (Nivel 0 - Sin dependencias) ---
    console.log('⏳ Fase 1: Cargando Maestros Fundamentales...');

    await Role.bulkCreate([
      { id: 1, name: 'Administrador', description: 'Acceso total' },
      { id: 2, name: 'Inspector', description: 'Realiza inspecciones' },
      { id: 3, name: 'Analista', description: 'Visualiza datos y reportes' }
    ]);

    await Period.bulkCreate([
      { id: 1, annuality: 2024 },
      { id: 2, annuality: 2025 }
    ]);

    await Magnitude.bulkCreate([
      { id: 1, value: 0, description: 'Ninguna' },
      { id: 2, value: 1, description: 'Leve' },
      { id: 3, value: 2, description: 'Moderada' },
      { id: 4, value: 3, description: 'Grave' },
      { id: 5, value: 4, description: 'Mortal' }
    ]);

    await InspectionStatus.bulkCreate([
      { id: 1, name: 'Pendiente' },
      { id: 2, name: 'En Proceso' },
      { id: 3, name: 'Completada' }
    ]);

    await AgentType.bulkCreate([
      { id: 1, name: 'PQS', description: 'Polvo Químico Seco' },
      { id: 2, name: 'CO2', description: 'Dióxido de Carbono' }
    ]);

    await InstallationType.bulkCreate([
      { id: 1, name: 'Almacén' },
      { id: 2, name: 'Oficina' },
      { id: 3, name: 'Planta Industrial' }
    ]);

    await ProtectionType.bulkCreate([
      { id: 1, name: 'Protección Personal (EPP)' },
      { id: 2, name: 'Protección Colectiva' }
    ]);

    await InjuryType.bulkCreate([
      { id: 1, name: 'Fractura' },
      { id: 2, name: 'Herida' },
      { id: 3, name: 'Quemadura' },
      { id: 4, name: 'Contusión' }
    ]);

    await FileDocument.bulkCreate([
      { id: 1, name: 'Declaración 24h' },
      { id: 2, name: 'Informe Médico' },
      { id: 3, name: 'Constancia Sede' },
      { id: 4, name: 'Copia Cédula' },
      { id: 5, name: 'Horario Trabajo' }
    ]);

    await Management.bulkCreate([
      { id: 1, name: 'Distribución y Comercialización' },
      { id: 2, name: 'Transmisión' },
      { id: 3, name: 'Generación' },
      { id: 4, name: 'Programación y Control de Vegetación' },
      { id: 5, name: 'Bienes y Servicios' },
      { id: 6, name: 'Talento Humano' },
      { id: 7, name: 'Prevención y Protección (P&P)' },
      { id: 8, name: 'ASHO' }
    ]);

    // --- FASE 2: MAESTROS DE RRHH, GEOGRAFÍA Y VEHÍCULOS (Nivel 1) ---
    console.log('⏳ Fase 2: Cargando RRHH, Geografía y Vehículos...');

    await Department.bulkCreate([
      { id: 1, name: 'Seguridad y Salud Laboral' },
      { id: 2, name: 'Mantenimiento y Logística' }
    ]);

    await JobTitle.bulkCreate([
      { id: 1, name: 'Gerente' },
      { id: 2, name: 'Técnico Especialista' },
      { id: 3, name: 'Operador' }
    ]);

    await Occupation.bulkCreate([
      { id: 1, name: 'Ingeniero de Riesgos' },
      { id: 2, name: 'Analista' },
      { id: 3, name: 'Montacarguista' }
    ]);

    // Geografía
    const s1 = await State.create({ id: 1, name: 'Distrito Capital' });
    const c1 = await City.create({ id: 1, name: 'Caracas', stateId: s1.id });
    const p1 = await Parish.create({ id: 1, name: 'Coche', cityId: c1.id });
    const l1 = await Location.create({ id: 1, name: 'Sede Principal', parishId: p1.id });

    // Táchira
    const s2 = await State.create({ id: 2, name: 'Táchira' });
    const c2 = await City.create({ id: 2, name: 'San Cristóbal', stateId: s2.id });
    await Parish.bulkCreate([
      { id: 2, name: 'San Juan Bautista', cityId: c2.id },
      { id: 3, name: 'La Concordia', cityId: c2.id },
      { id: 4, name: 'Pedro María Morantes', cityId: c2.id },
      { id: 5, name: 'San Sebastián', cityId: c2.id },
      { id: 6, name: 'Francisco Romero Lobo', cityId: c2.id }
    ]);
    const c3 = await City.create({ id: 3, name: 'Táriba', stateId: s2.id });
    await City.create({ id: 4, name: 'San Antonio del Táchira', stateId: s2.id });

    // Ubicaciones para Táchira
    await Location.create({ id: 2, name: 'Sector San Cristóbal II', parishId: 2 });
    await Location.create({ id: 3, name: 'Sector Táriba Centro', parishId: 3 });

    // Maestros de Accidente (Jerárquicos)
    await AccidentType.bulkCreate([
      { id: 1, code: 'LAB', name: 'Laboral', parent_id: null },
      { id: 2, code: 'TRA', name: 'Trayecto', parent_id: null },
      { id: 3, code: 'TEC', name: 'Técnico / Operativo', parent_id: null },
      { id: 10, code: 'CT', name: 'En el curso del trabajo', parent_id: 1 }
    ]);

    await DamageAgent.bulkCreate([
      { id: 1, code: 'FIS', name: 'Físico', parent_id: null },
      { id: 2, code: 'ELE', name: 'Eléctrico', parent_id: null },
      { id: 3, code: 'MEC', name: 'Mecánico', parent_id: null },
      { id: 4, code: 'FAU', name: 'Fauna / Ambiente', parent_id: null },
      { id: 20, code: 'ELEC', name: 'Electricidad', parent_id: 2 }
    ]);

    await ContactType.bulkCreate([
      { id: 1, code: 'GOL', name: 'Golpeado por/contra', parent_id: null },
      { id: 2, code: 'CON', name: 'Contacto Eléctrico', parent_id: null },
      { id: 30, code: 'ELEC', name: 'Arco Eléctrico', parent_id: 2 },
      { id: 41, code: 'CDIF', name: 'Caída a Distinto Nivel', parent_id: 1 }
    ]);

    await Affectation.bulkCreate([
      { id: 1, code: 'CON', name: 'Con afectación', parent_id: null },
      { id: 10, code: 'LES', name: 'Lesión Corporal', parent_id: 1 },
      { id: 11, code: 'MAT', name: 'Daño Material', parent_id: 1 }
    ]);

    await AffectationSubject.bulkCreate([
      { id: 1, code: 'PER', name: 'Personas', parent_id: null },
      { id: 10, code: 'TRA', name: 'Trabajador', parent_id: 1 }
    ]);

    // Vehículos
    const brand = await Brand.create({ id: 1, name: 'Toyota' });
    const vModel = await Model.create({ id: 1, name: 'Hilux', brandId: brand.id });
    const vt = await VehicleType.create({ id: 1, name: 'Pick-up' });
    await VehicleAccessory.bulkCreate([
      { id: 1, name: 'Caucho Repuesto' },
      { id: 2, name: 'Extintor Vehicular' },
      { id: 3, name: 'Triángulos de Seguridad' }
    ]);

    // --- FASE 3: ENTIDADES PRINCIPALES (Nivel 2) ---
    console.log('⏳ Fase 3: Cargando Entidades de Operación...');

    await User.bulkCreate([
      { id: 1, username: 'admin', password: 'admin123', roleId: 1, firstName: 'Sistema', lastName: 'Admin' },
      { id: 2, username: 'inspector1', password: 'password123', roleId: 2, firstName: 'Carlos', lastName: 'Guerra' },
      { id: 3, username: 'analista1', password: 'password123', roleId: 3, firstName: 'Ana', lastName: 'Lista' }
    ], { individualHooks: true });

    await Employee.bulkCreate([
      { personalNumber: 'EMP001', idCard: 'V-11', firstName: 'Juan', lastName: 'Pérez', departmentId: 1, jobTitleId: 1, occupationId: 1 },
      { personalNumber: 'EMP002', idCard: 'V-22', firstName: 'Ana', lastName: 'Rodríguez', departmentId: 2, jobTitleId: 2, occupationId: 2 }
    ]);

    await Vehicle.create({ plate: 'ABC-123', modelId: vModel.id, vehicleTypeId: vt.id, color: 'Blanco', year: 2022 });
    
    const fac1 = await Facility.create({ 
      id: 1, 
      name: 'Subestación San Cristóbal II', 
      locationId: 2, // Táchira - San Cristóbal
      installationTypeId: 1,
      voltageLevel: '115kV',
      status: 1
    });

    const fac2 = await Facility.create({ 
      id: 2, 
      name: 'Centro de Servicio Táriba', 
      locationId: 3, // Táchira - Táriba
      installationTypeId: 2,
      voltageLevel: '13.8kV',
      status: 1
    });

    const pec1 = await ProtectionEquipmentCategory.create({ id: 1, name: 'Cabeza', protection_type_id: 1 });
    await ProtectionEquipment.create({ id: 1, name: 'Casco de Seguridad', category_id: pec1.id, totalQuantity: 50, operativeQuantity: 45 });

    // --- FASE 4: TRANSACCIONES Y DETALLES (Nivel 3) ---
    console.log('⏳ Fase 4: Cargando Accidentes e Inspecciones...');

    const acc = await Accident.create({
      id: 1,
      accidentDate: '2026-05-01',
      accidentTime: '09:30:00',
      description: 'Evento técnico en pórtico de entrada por falla de aislamiento.',
      facilityId: fac1.id,
      accidentTypeId: 3, 
      periodId: 1,
      userId: 1,
      damageAgentId: 4,
      contactTypeId: 2,
      processStatusId: 1,
      circuitName: 'SAN CRISTOBAL - TARUBA',
      totalCustomersAffected: 2400,
      interruptionDuration: 120,
      loadLoss: 8.5,
      interruptionStartTime: '09:30:00'
    });

    await EmployeeAccident.create({ accidentId: acc.id, employeePersonalNumber: 'EMP001', injuryTypeId: 1, magnitudeId: 4, restDays: 15 });
    await AccidentDocumentCheck.create({ accidentId: acc.id, documentId: 1, delivered: true, receivedDate: '2024-04-02' });
    await AccidentAffectationDetail.create({ accidentId: acc.id, affectationId: 10, affectationSubjectId: 10, magnitudeId: 3 });

    // Inspecciones
    const insp = await Inspection.create({
      id: 1,
      date: '2024-04-05',
      employeePersonalNumber: 'EMP002',
      facilityId: fac1.id,
      statusId: 3,
      observations: 'Inspección de rutina completa'
    });

    await VehicleInspection.create({ id: 1, inspectionId: insp.id, plateId: 'ABC-123', description: 'Revisión inicial' });
    await InspectionDetail.create({ vehicleInspectionId: 1, accessoryId: 1, status: true });

    const extInsp = await ExtinguisherInspection.create({ id: 1, inspectionId: insp.id, floor: 'Planta Baja' });
    await ExtinguisherDetail.create({ extinguisherInspectionId: 1, agentTypeId: 1, capacity: '10lb', status: 'Operativo' });

    const protInsp = await ProtectionInspection.create({ id: 1, inspectionId: insp.id, responsiblePersonalNumber: 'EMP001' });
    await ProtectionInspectionDetails.create({ protectionInspectionId: 1, categoryId: 1, stock: 45, required: 5 });

    // --- FASE 5: SINCRONIZACIÓN DE SECUENCIAS ---
    if (sequelize.getDialect() === 'postgres') {
      const tables = [
        'role', 'users', 'occupation', 'department', 'job_title', 'state', 'city', 'parish', 'location', 
        'accident_type', 'magnitude', 'period', 'file_documents', 'affectation', 'affectation_subject', 'injury_type', 'accident',
        'brand', 'model', 'vehicle_type', 'vehicle_accessories', 'inspection_status', 'agent_type', 'installation_type',
        'facility', 'protection_type', 'protection_equipment_category', 'protection_equipment', 'inspection', 'vehicle_inspection',
        'extinguisher_inspection', 'protection_inspection', 'management'
      ];

      for (const table of tables) {
        try {
          await sequelize.query(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), (SELECT MAX(id) FROM "${table}"));`);
        } catch (e) {}
      }
      console.log('✅ Secuencias sincronizadas');
    }

    console.log('--- ✨ Seed completado con éxito (43 modelos poblados) ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error crítico en el seed:', error);
    process.exit(1);
  }
}

seed();

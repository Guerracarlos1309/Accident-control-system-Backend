const sequelize = require('./src/config/database');
const { ProtectionEquipmentCategory } = require('./src/models');

// Items 39-145 extraídos del documento "Necesidades Mínimas por Estado 2026-2027"
// protectionTypeId: 1 = EPP (Personal) | 2 = EPC (Colectiva/Herramientas)
const newCategories = [
  // --- PÁGINA 2 (39-75) ---
  { id: 39,  name: 'MASCARA MEDIA CARA C/ENTRADA P/2 CART.',                          protectionTypeId: 1, description: 'PIEZAS' },
  { id: 40,  name: 'PREFILTRO PROTECCION RESPIR CONTRA POLVO',                         protectionTypeId: 1, description: 'PIEZAS' },
  { id: 41,  name: 'CARTUCHO PLASTICO C/CINTA BLANCO',                                 protectionTypeId: 1, description: 'PIEZAS' },
  { id: 42,  name: 'CARTUCHO FILTRO RESP. C/CINTA NEGRO',                              protectionTypeId: 1, description: 'PIEZAS' },
  { id: 43,  name: 'LENTE DE SEGURIDAD OSCUROS',                                       protectionTypeId: 1, description: 'PIEZAS' },
  { id: 44,  name: 'LENTE DE SEGURIDAD CLARO',                                         protectionTypeId: 1, description: 'PIEZAS' },
  { id: 45,  name: 'CHALECO REFLECT AMA-NAR CINTA REFL',                               protectionTypeId: 1, description: 'PIEZAS' },
  { id: 46,  name: 'PERTIGA MANOMECANICA 4 PIES C/BOLSO',                              protectionTypeId: 2, description: 'PIEZAS' },
  { id: 47,  name: "PERTIGA MANOMECANICA 8' C/BOLSO",                                  protectionTypeId: 2, description: 'PIEZAS' },
  { id: 48,  name: "PERTIGA MANOMECANICA 12'",                                         protectionTypeId: 2, description: 'PIEZAS' },
  { id: 49,  name: 'PERTIGA UNIVERSAL DE 1-1/4"X14\'',                                 protectionTypeId: 2, description: 'PIEZAS' },
  { id: 50,  name: "PERTIGA UNIVERSAL 1-1/4\"X8' (2.40M) 75KV",                       protectionTypeId: 2, description: 'PIEZAS' },
  { id: 51,  name: 'ROMPE CARGA P/SECC 15KV 200A',                                     protectionTypeId: 2, description: 'EQUIPO' },
  { id: 52,  name: 'KIT D/REPUESTO P/ROMPECARGA 13.8KV',                               protectionTypeId: 2, description: 'KIT'    },
  { id: 53,  name: 'COND PVC 70CM (28") BANDA REFLECTIVA',                             protectionTypeId: 2, description: 'PIEZAS' },
  { id: 54,  name: 'CINTA DELIMITAD PELIGRO NO PASE 3" AMARILLA',                      protectionTypeId: 2, description: 'PIEZAS' },
  { id: 55,  name: 'ANTEJO TIPO COPA PARA SOLDADOR',                                   protectionTypeId: 1, description: 'PIEZAS' },
  { id: 56,  name: 'CARETA CON VISOR PARA SOLDADOR',                                   protectionTypeId: 1, description: 'PIEZAS' },
  { id: 57,  name: 'PROTECCION FACIAL PARA ESMERILLAR',                                protectionTypeId: 1, description: 'PIEZAS' },
  { id: 58,  name: 'MANGAS CUERO SOLDADORES CON CORREA',                               protectionTypeId: 1, description: 'PARES'  },
  { id: 59,  name: 'GUANTE DE NITRILO CONTRA PRODUCTOS QUIMICO',                       protectionTypeId: 1, description: 'PARES'  },
  { id: 60,  name: 'GUANTE DE CUERO PARA SOLDADOR',                                    protectionTypeId: 1, description: 'PARES'  },
  { id: 61,  name: 'DELANTAL CUERO SOLDADORES',                                        protectionTypeId: 1, description: 'PIEZAS' },
  { id: 62,  name: 'POLAINE SOLDADORES',                                                protectionTypeId: 1, description: 'PIEZAS' },
  { id: 63,  name: 'CAPUCHA DE PROTECCION CONTRA ARCO ELECTRICO',                      protectionTypeId: 1, description: 'PIEZAS' },
  { id: 64,  name: 'CALCETINES CONDUCTIVO',                                             protectionTypeId: 1, description: 'PARES'  },
  { id: 65,  name: 'GUANTE CONDUCTIVO',                                                 protectionTypeId: 1, description: 'PARES'  },
  { id: 66,  name: 'BOTA CONDUCTIVA P/ TRABAJO EN CALIENTE',                           protectionTypeId: 1, description: 'PIEZAS' },
  { id: 67,  name: 'TRAJE CONDUCTIVO P/ TRABAJO EN CALIENTE',                          protectionTypeId: 1, description: 'JUEGO'  },
  { id: 68,  name: 'LINEA VIDA CON BOLSO 15M',                                         protectionTypeId: 1, description: 'JUEGO'  },
  { id: 69,  name: 'LINEA VIDA CON BOLSO 35M',                                         protectionTypeId: 1, description: 'JUEGO'  },
  { id: 70,  name: 'CUNAS DE SEGURIDAD',                                                protectionTypeId: 1, description: 'PIEZAS' },
  { id: 71,  name: 'BOTIQUIN DE PRIMEROS AUXILIOS TIPO PORTATIL',                      protectionTypeId: 2, description: 'KIT'    },
  { id: 72,  name: 'EQUIPO DE RESCATE EN ALTURA CON BOLSA',                            protectionTypeId: 2, description: 'JUEGO'  },
  { id: 73,  name: 'LAMPARA FRONTAL PARA CASCO DE SEGURIDAD',                          protectionTypeId: 1, description: 'PIEZAS' },
  { id: 74,  name: 'NAVAJA PICO DE LORO',                                               protectionTypeId: 2, description: 'PIEZAS' },
  { id: 75,  name: 'CINCHA DE NYLON CON BOLSO',                                        protectionTypeId: 1, description: 'PARES'  },

  // --- PÁGINA 3 (76-113) ---
  { id: 76,  name: 'ROLLO DE 600 PIES MECATE POLIDACRON 5/8 PULG',                    protectionTypeId: 2, description: 'ROLLO'  },
  { id: 77,  name: 'ROLLO DE 600 PIES MECATE POLIDACRON 1/2 PULG',                    protectionTypeId: 2, description: 'ROLLO'  },
  { id: 78,  name: 'LLAVE AJUSTABLE 10 PULG MANGO AISLADO 1000V',                     protectionTypeId: 2, description: 'PIEZA'  },
  { id: 79,  name: 'LLAVE AJUSTABLE 12 PULG MANGO AISLADO 1000V',                     protectionTypeId: 2, description: 'PIEZA'  },
  { id: 80,  name: 'LLAVE AJUSTABLE 8 PULG MANGO AISLADO 1000V',                      protectionTypeId: 2, description: 'PIEZA'  },
  { id: 81,  name: 'TENSORES DE LINEA PARA CONDUCTOR 1/0-4/0',                        protectionTypeId: 2, description: 'PIEZA'  },
  { id: 82,  name: 'TENSORES DE LINEA PARA CONDUCTOR 6-1/0',                          protectionTypeId: 2, description: 'PIEZA'  },
  { id: 83,  name: 'TENSORES PARA CABLE DE GUAYA',                                     protectionTypeId: 2, description: 'PIEZA'  },
  { id: 84,  name: 'JITON 120 PIES MECATE POLIDACRON 1/2 Y TRIPLE ROLDANA',           protectionTypeId: 2, description: 'JUEGO'  },
  { id: 85,  name: 'SEÑORITAS 3/4 TONELADAS TIPO RACHET',                              protectionTypeId: 2, description: 'EQUIPO' },
  { id: 86,  name: 'SEÑORITAS 1-1/2 TONELADAS TIPO RACHET',                            protectionTypeId: 2, description: 'EQUIPO' },
  { id: 87,  name: 'ALICATE DIELECTRICO DE 8 PULG',                                   protectionTypeId: 2, description: 'PIEZA'  },
  { id: 88,  name: 'VOLTIOAMPERIMETRO DIGITAL',                                         protectionTypeId: 2, description: 'EQUIPO' },
  { id: 89,  name: 'PRENSA TERMINAL HIDRAULICA PARA DISTRIBUCION',                     protectionTypeId: 2, description: 'EQUIPO' },
  { id: 90,  name: 'ESCALERA FIBRA EXTENSIBLE 32 PELDAÑOS DIELECTRICA C/GANCHOS',     protectionTypeId: 2, description: 'PIEZA'  },
  { id: 91,  name: 'ESCALERA FIBRA EXTENSIBLE 12 PELDAÑOS DIELECTRICA C/GANCHOS',     protectionTypeId: 2, description: 'PIEZA'  },
  { id: 92,  name: 'ALICATE DE PRESION AJUSTABLE',                                     protectionTypeId: 2, description: 'PIEZA'  },
  { id: 93,  name: 'MARTILLO DE BOLA PARA LINIERO',                                    protectionTypeId: 2, description: 'PIEZA'  },
  { id: 94,  name: 'MARTILLO DE OREJERA DE 1 LB',                                      protectionTypeId: 2, description: 'PIEZA'  },
  { id: 95,  name: 'ESLINGA DE CARGA CILINDRICA PARA 3 TONELADAS',                    protectionTypeId: 2, description: 'PIEZA'  },
  { id: 96,  name: 'VENTILADOR EXTRACTOR PARA SOTANO',                                 protectionTypeId: 2, description: 'EQUIPO' },
  { id: 97,  name: 'BOMBA DE ACHIQUE',                                                  protectionTypeId: 2, description: 'EQUIPO' },
  { id: 98,  name: 'PALA DE SERVICIO',                                                  protectionTypeId: 2, description: 'PIEZA'  },
  { id: 99,  name: 'GIZELA CORTE CABLE DE 2/0 HASTA 4/0',                              protectionTypeId: 2, description: 'EQUIPO' },
  { id: 100, name: 'GIZELA TIPO RATCHET',                                               protectionTypeId: 2, description: 'EQUIPO' },
  { id: 101, name: 'GIZELA CORTE NORMAL',                                               protectionTypeId: 2, description: 'EQUIPO' },
  { id: 102, name: 'LINTERNA CON ESTUCHE PROTECTOR',                                   protectionTypeId: 2, description: 'PIEZA'  },
  { id: 103, name: 'CORTACABLES HIDRAULICA A BATERIA CON ESTUCHE',                     protectionTypeId: 2, description: 'EQUIPO' },
  { id: 104, name: 'CEPILLO DE ALAMBRE DE ACERO',                                      protectionTypeId: 2, description: 'PIEZA'  },
  { id: 105, name: 'MANDARIA 10 KG',                                                    protectionTypeId: 2, description: 'PIEZA'  },
  { id: 106, name: 'JUEGO DE DESTORNILLADORES EXAGONALES HUECO',                       protectionTypeId: 2, description: 'JUEGO'  },
  { id: 107, name: 'JUEGO DE LLAVES COMBINADAS',                                        protectionTypeId: 2, description: 'JUEGO'  },
  { id: 108, name: 'FARO PILOTO',                                                        protectionTypeId: 2, description: 'PIEZA'  },
  { id: 109, name: 'BINOCULARES CON ESTUCHE PROTECTOR',                                protectionTypeId: 2, description: 'PIEZA'  },
  { id: 110, name: 'BALDE PORTA HERRAMIENTA',                                           protectionTypeId: 2, description: 'PIEZA'  },
  { id: 111, name: 'PRENSA HIDRAULICA A BATERIA P/MONTAJE CONECTORES TIPO CUÑA',       protectionTypeId: 2, description: 'EQUIPO' },
  { id: 112, name: 'PRENSA HIDRAULICA A BATERIA DE CONEXION A COMPRENSION',            protectionTypeId: 2, description: 'EQUIPO' },
  { id: 113, name: 'JUEGO DE DADOS AISLADOS',                                           protectionTypeId: 2, description: 'JUEGO'  },

  // --- PÁGINA 4 (114-145) ---
  { id: 114, name: 'JUEGO DE LLAVES DE ESTRIAS CROMADA 15 GRADOS',                    protectionTypeId: 2, description: 'JUEGO'  },
  { id: 115, name: 'JUEGO LLAVES DE ESTRIA CROMADA 45 GRADOS',                        protectionTypeId: 2, description: 'JUEGO'  },
  { id: 116, name: 'JUEGO LLAVE ALLEN HEXAGONALES',                                    protectionTypeId: 2, description: 'JUEGO'  },
  { id: 117, name: 'MALETIN C/DESTORNILLADORES PLANO/ESTRIA',                         protectionTypeId: 2, description: 'JUEGO'  },
  { id: 118, name: 'KIT HERRAMIENTA AISL MANO PARA PERSONAL DE DISTRIBUCION',         protectionTypeId: 2, description: 'JUEGO'  },
  { id: 119, name: 'DESTORNILLADOR AISLADO PLANO 1/4X3-3/4 (MEDIANO)',                protectionTypeId: 2, description: 'PIEZA'  },
  { id: 120, name: 'DESTORNILLADOR AISLADO PLANO 3/16X6 (FINO)',                      protectionTypeId: 2, description: 'PIEZA'  },
  { id: 121, name: 'DESTORNILLADOR AISLADO PLANO 3/8X10 (GRANDE)',                    protectionTypeId: 2, description: 'PIEZA'  },
  { id: 122, name: 'DESTORNILLADOR PUNTA CRUCIFORME N°2 DE 1/4" HASTA 1\'',           protectionTypeId: 2, description: 'JUEGO'  },
  { id: 123, name: 'LLAVE DE TUBO CON ABERTURA HASTA 2"',                             protectionTypeId: 2, description: 'JUEGO'  },
  { id: 124, name: 'LLAVE PARA DESTAPAR TANQUILLAS',                                   protectionTypeId: 2, description: 'PIEZA'  },
  { id: 125, name: 'CINCEL PLANO DE 3/8 X 6"',                                        protectionTypeId: 2, description: 'PIEZA'  },
  { id: 126, name: 'MACHETE DE 22" 3 CANALES',                                        protectionTypeId: 2, description: 'PIEZA'  },
  { id: 127, name: 'ARCO DE SEGUETA',                                                   protectionTypeId: 2, description: 'PIEZA'  },
  { id: 128, name: 'HOJA DE SEGUETAS 12"X1/2"/18 DIENTES',                            protectionTypeId: 2, description: 'PIEZA'  },
  { id: 129, name: 'TERMO PLASTICO CAP 7 LITROS',                                      protectionTypeId: 2, description: 'PIEZA'  },
  { id: 130, name: 'ROTADOR',                                                            protectionTypeId: 2, description: 'PIEZA'  },
  { id: 131, name: 'PIEDRA DE AMOLAR',                                                  protectionTypeId: 2, description: 'PIEZA'  },
  { id: 132, name: 'PALETA DE ALBANIL MEDIANA 7-1/2 PULO',                             protectionTypeId: 2, description: 'PIEZA'  },
  { id: 133, name: 'CINTA METRICA 1/2 DE ANCHO X 3M LARGO',                           protectionTypeId: 2, description: 'PIEZA'  },
  { id: 134, name: 'CINTA DE ACERO O FIBRA 1/4X1/6X100 PIES',                         protectionTypeId: 2, description: 'PIEZA'  },
  { id: 135, name: 'LIMA PLANA DE 10" DE LONGITUD',                                   protectionTypeId: 2, description: 'PIEZA'  },
  { id: 136, name: 'LIMA REDONDA FINA 12" DE LONGITUD',                                protectionTypeId: 2, description: 'PIEZA'  },
  { id: 137, name: 'LIMA TRIANGULAR FINA 10" DE LONGITUD',                             protectionTypeId: 2, description: 'PIEZA'  },
  { id: 138, name: 'ALICATE DE 6" DE CORTE DIAGONAL',                                 protectionTypeId: 2, description: 'PIEZA'  },
  { id: 139, name: 'LLAVE FIJA DE TORCION DE LAS CONEXIONES MODULARES',               protectionTypeId: 2, description: 'JUEGO'  },
  { id: 140, name: 'PICO',                                                               protectionTypeId: 2, description: 'PIEZA'  },
  { id: 141, name: 'CABO PARA PICO',                                                    protectionTypeId: 2, description: 'PIEZA'  },
  { id: 142, name: 'BARRA',                                                              protectionTypeId: 2, description: 'PIEZA'  },
  { id: 143, name: 'PALIN',                                                              protectionTypeId: 2, description: 'PIEZA'  },
  { id: 144, name: 'PALA PUNTA CUADRADA CON CABO DE MADERA',                           protectionTypeId: 2, description: 'PIEZA'  },
  { id: 145, name: 'PATA DE CARRA',                                                     protectionTypeId: 2, description: 'PIEZA'  },
];

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos.');

    let created = 0;
    let skipped = 0;

    for (const item of newCategories) {
      const [record, wasCreated] = await ProtectionEquipmentCategory.findOrCreate({
        where: { id: item.id },
        defaults: item,
      });
      if (wasCreated) {
        console.log(`✅ [${item.id.toString().padStart(3)}] ${item.name}`);
        created++;
      } else {
        console.log(`⚠️  [${item.id.toString().padStart(3)}] Ya existe: ${record.name}`);
        skipped++;
      }
    }

    console.log(`\n🎉 Completado: ${created} creados, ${skipped} ya existían.`);
    console.log(`Total de categorías: 38 existentes + ${created} nuevas = ${38 + created}`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sequelize.close();
  }
}

run();

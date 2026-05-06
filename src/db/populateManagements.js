const { Management } = require('../models');

async function run() {
  try {
    console.log('--- 🛡️ Iniciando Carga de Gerencias (Modo Seguro) ---');
    // Crea la tabla si no existe, no toca las demás
    await Management.sync(); 
    
    const count = await Management.count();
    if (count > 0) {
      console.log('ℹ️ Las gerencias ya existen en la base de datos.');
      process.exit(0);
    }

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

    console.log('✅ Gerencias cargadas exitosamente. No se han modificado otros datos.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cargar gerencias:', error);
    process.exit(1);
  }
}

run();

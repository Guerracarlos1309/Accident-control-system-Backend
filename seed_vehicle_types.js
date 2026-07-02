const { sequelize, VehicleType } = require('./src/models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos.');

    const newTypes = [
      { name: 'Camión Cesta',        description: 'Camión con plataforma tipo cesta' },
      { name: 'Camión Chasis Largo', description: 'Camión de chasis largo' },
      { name: 'Van / Furgoneta',     description: 'Vanes y furgonetas de carga o pasajeros' },
      { name: 'Camión Cisterna',     description: 'Camión con tanque para líquidos' },
      { name: 'Liviano',             description: 'Vehículo liviano de uso general' },
      { name: 'Hembrita',            description: 'Camioneta de cabina sencilla (hembrita)' },
      { name: 'Otros',               description: 'Otro tipo de vehículo (especificar)' },
    ];

    for (const t of newTypes) {
      const [record, created] = await VehicleType.findOrCreate({
        where: { name: t.name },
        defaults: t,
      });
      console.log(`${created ? '✅ Creado' : '⚠️  Ya existe'}: ${record.name}`);
    }

    console.log('\n🎉 Tipos de vehículo actualizados correctamente.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

run();

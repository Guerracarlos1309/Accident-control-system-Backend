require('dotenv').config({ path: 'c:/Users/usuario/OneDrive/Documentos/9no semestre/Sistema/Accident-control-system-Backend/.env' });
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

async function fix() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    console.log('Añadiendo columna inspection_number a la tabla inspection...');
    await queryInterface.addColumn('inspection', 'inspection_number', {
      type: DataTypes.STRING(20),
      allowNull: true
    });
    console.log('¡Columna añadida con éxito!');
    process.exit(0);
  } catch (err) {
    if (err.name === 'SequelizeDatabaseError' && err.message.includes('already exists')) {
      console.log('La columna ya existe.');
      process.exit(0);
    }
    console.error('Error al migrar:', err);
    process.exit(1);
  }
}

fix();

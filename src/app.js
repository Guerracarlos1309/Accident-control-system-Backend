const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const stateRoutes = require('./routes/stateRoutes');
const cityRoutes = require('./routes/cityRoutes');
const parishRoutes = require('./routes/parishRoutes');
const locationRoutes = require('./routes/locationRoutes');
const lookupRoutes = require('./routes/lookupRoutes');
const accidentRoutes = require('./routes/accidentRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const protectionRoutes = require('./routes/protectionRoutes');

const app = express();

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/parishes', parishRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/lookups', lookupRoutes);
app.use('/api/accidents', accidentRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/protection', protectionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Accident Control System API is running' });
});

// Temporary Sync Route (Remove after use)
app.get('/api/sync-database', async (req, res) => {
  try {
    const { sequelize } = require('./models');
    
    // Intento quirúrgico: Añadir solo la columna status si no existe
    await sequelize.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facility' AND column_name='status') THEN
          ALTER TABLE facility ADD COLUMN status INTEGER DEFAULT 1;
        END IF;
      END $$;
    `);

    res.status(200).json({ 
      status: 'SUCCESS', 
      message: 'Base de datos actualizada quirúrgicamente. La columna "status" ha sido verificada/añadida.' 
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  let message = err.message || 'Error interno del servidor';
  let status = err.status || 500;
  
  // Interceptar errores de Multer (como tamaño excedido)
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'La imagen es demasiado pesada. El tamaño máximo permitido es de 5MB.';
    status = 400;
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Se ha recibido un archivo inesperado o en un campo incorrecto.';
    status = 400;
  }
  
  res.status(status).json({
    message: message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;

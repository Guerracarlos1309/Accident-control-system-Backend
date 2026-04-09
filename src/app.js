const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
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
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;

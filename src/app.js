const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const employeeRoutes = require("./routes/employeeRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const stateRoutes = require("./routes/stateRoutes");
const cityRoutes = require("./routes/cityRoutes");
const parishRoutes = require("./routes/parishRoutes");
const locationRoutes = require("./routes/locationRoutes");
const lookupRoutes = require("./routes/lookupRoutes");
const accidentRoutes = require("./routes/accidentRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const protectionRoutes = require("./routes/protectionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const facilityCodeRoutes = require("./routes/facilityCodeRoutes");

const app = express();

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/parishes", parishRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/lookups", lookupRoutes);
app.use("/api/accidents", accidentRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/protection", protectionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/facility-codes", facilityCodeRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Accident Control System API is running" });
});

// Admin Backup Route
const { protect, authorize } = require("./middlewares/authMiddleware");
const fs = require("fs");

app.get("/api/admin/backup-database", protect, authorize("Administrador"), (req, res) => {
  try {
    const dbPath = path.resolve(process.env.DB_STORAGE || "./database.sqlite");
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ message: "Base de datos no encontrada" });
    }
    const backupFilename = `backup_sistema_${new Date().toISOString().slice(0, 10)}.sqlite`;
    const tempBackupPath = path.resolve(`./temp_${backupFilename}`);
    
    // Copiar el archivo para evitar bloqueos
    fs.copyFileSync(dbPath, tempBackupPath);
    
    res.download(tempBackupPath, backupFilename, (err) => {
      // Eliminar el archivo temporal después de la descarga
      try {
        if (fs.existsSync(tempBackupPath)) {
          fs.unlinkSync(tempBackupPath);
        }
      } catch (unlinkErr) {
        console.error("Error al eliminar backup temporal:", unlinkErr);
      }
      
      if (err && !res.headersSent) {
        res.status(500).json({ message: "Error al descargar el respaldo" });
      }
    });
  } catch (error) {
    console.error("Error al generar backup:", error);
    res.status(500).json({ message: "Error al generar el respaldo de la base de datos" });
  }
});

// Temporary Sync Route (Remove after use)
app.get("/api/sync-database", async (req, res) => {
  try {
    const { sequelize } = require("./models");

    // Sincronización completa: añade columnas faltantes y ajusta tipos de datos
    // Usamos force:false y alter:true para no borrar datos existentes
    await sequelize.sync({ alter: true });

    // FORZAR COLUMNAS FALTANTES (Por si acaso alter:true falló)
    try {
      await sequelize.query(
        'ALTER TABLE "accident" ADD COLUMN IF NOT EXISTS "description" TEXT;',
      );
      await sequelize.query(
        'ALTER TABLE "accident" ADD COLUMN IF NOT EXISTS "accident_code" VARCHAR(50);',
      );
      await sequelize.query(
        'ALTER TABLE "management" ADD COLUMN IF NOT EXISTS "description" TEXT;',
      );
    } catch (e) {
      console.log(
        "Las columnas description ya existen o hubo un error al crearlas.",
      );
    }

    // Seed de datos iniciales para Centros Médicos (solo si no existen)
    const { MedicalCenter, Parish } = require("./models");
    const centersCount = await MedicalCenter.count();

    if (centersCount === 0) {
      // Intentamos buscar una parroquia existente para vincular (opcional)
      const parish = await Parish.findOne();
      await MedicalCenter.bulkCreate([
        {
          name: "Hospital Dr. Rafael Calles Sierra",
          address: "Av. Rafael González, Punto Fijo",
          parishId: parish ? parish.id : null,
        },
        {
          name: "Clínica de la Familia",
          address: "Calle Comercio, Caja de Agua",
          parishId: parish ? parish.id : null,
        },
        {
          name: "Seguro Social (IVSS)",
          address: "Sector Chimpire, Santa Ana d Coro",
          parishId: parish ? parish.id : null,
        },
      ]);
    }

    // REPARAR SECUENCIAS (Para evitar errores de ID duplicado)
    const tables = [
      "management",
      "accident",
      "medical_center",
      "employee",
      "parish",
      "city",
      "state",
    ];
    for (const table of tables) {
      try {
        await sequelize.query(`
          SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id), 0) + 1, false)
          FROM "${table}";
        `);
      } catch (e) {
        // Ignorar si la tabla o secuencia no existe
      }
    }

    res.status(200).json({
      status: "SUCCESS",
      message:
        "Base de datos sincronizada y secuencias reparadas exitosamente.",
    });
  } catch (error) {
    console.error("ERROR EN SYNC:", error);
    res.status(500).json({ status: "ERROR", message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  let message = err.message || "Error interno del servidor";
  let status = err.status || 500;

  // Interceptar errores de Multer (como tamaño excedido)
  if (err.code === "LIMIT_FILE_SIZE") {
    message =
      "La imagen es demasiado pesada. El tamaño máximo permitido es de 5MB.";
    status = 400;
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    message = "Se ha recibido un archivo inesperado o en un campo incorrecto.";
    status = 400;
  }

  res.status(status).json({
    message: message,
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

module.exports = app;

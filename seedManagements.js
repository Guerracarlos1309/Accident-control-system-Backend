const { Management } = require('./src/models');

const descriptions = {
  "Distribución y Comercialización": "Responsable de la operación, mantenimiento de redes de media/baja tensión y la gestión de procesos comerciales con usuarios finales.",
  "Transmisión": "Encargada del transporte masivo de energía eléctrica a alta tensión desde los centros de generación hasta las subestaciones de distribución.",
  "Generación": "Gestión, operación y mantenimiento de las centrales hidroeléctricas y termoeléctricas para la producción de energía eléctrica.",
  "Programación y Control de Vegetación": "Coordinación y ejecución de labores de desmalezamiento y poda preventiva para garantizar la continuidad del servicio en líneas eléctricas.",
  "Bienes y Servicios": "Gestión de la infraestructura física, servicios generales, flota vehicular y logística operativa de la corporación.",
  "Talento Humano": "Planificación y gestión del capital humano, procesos de nómina, capacitación continua y bienestar integral del trabajador.",
  "Prevención y Protección (P&P)": "Garantiza la seguridad física de las instalaciones críticas y la protección de los bienes patrimoniales de la empresa.",
  "Ambiente, Seguridad e Higiene Ocupacional (ASHO)": "Supervisión de normativas de salud laboral, prevención de accidentes industriales y mitigación del impacto ambiental."
};

async function updateDescriptions() {
  try {
    for (const [name, description] of Object.entries(descriptions)) {
      await Management.update(
        { description },
        { where: { name } }
      );
      console.log(`Updated: ${name}`);
    }
    console.log("All descriptions updated successfully.");
  } catch (error) {
    console.error("Error updating descriptions:", error);
  } finally {
    process.exit();
  }
}

updateDescriptions();

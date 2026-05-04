const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { State, City, Parish } = require('./src/models');

const venezuelaData = [
  {
    name: "Táchira",
    cities: [
      {
        name: "San Cristóbal",
        parishes: ["La Concordia", "San Juan Bautista", "Pedro María Morantes", "San Sebastián", "Francisco Romero Lobo"]
      },
      {
        name: "Táriba (Cárdenas)",
        parishes: ["Táriba", "Amenodoro Rangel Lamús", "La Florida"]
      },
      {
        name: "Rubio (Junín)",
        parishes: ["Rubio", "Bramón", "La Petrolea", "Quinimarí"]
      },
      {
        name: "San Antonio (Bolívar)",
        parishes: ["San Antonio del Táchira", "Juan Vicente Gómez", "Isaías Medina Angarita", "Palotal"]
      },
      {
        name: "Ureña (Pedro María Ureña)",
        parishes: ["Ureña", "Nueva Arcadia"]
      },
      {
        name: "Colón (Ayacucho)",
        parishes: ["Colón", "Rivas Berti", "San Pedro del Río"]
      },
      {
        name: "La Fría (García de Hevia)",
        parishes: ["La Fría", "Boca de Grita", "José Antonio Páez"]
      },
      {
        name: "Palmira (Guásimos)",
        parishes: ["Palmira"]
      },
      {
        name: "Capacho Nuevo (Independencia)",
        parishes: ["Capacho Nuevo", "Juan Germán Roscio", "Román Cárdenas"]
      },
      {
        name: "Capacho Viejo (Libertad)",
        parishes: ["Capacho Viejo", "Cipriano Castro", "Manuel Felipe Rugeles"]
      },
      {
        name: "Michelena",
        parishes: ["Michelena"]
      },
      {
        name: "Lobatera",
        parishes: ["Lobatera", "Constitución"]
      },
      {
        name: "La Grita (Jáuregui)",
        parishes: ["La Grita", "Emilio Constantino Guerrero", "Monseñor Miguel Antonio Salas"]
      },
      {
        name: "San José de Bolívar (Francisco de Miranda)",
        parishes: ["San José de Bolívar"]
      },
      {
        name: "Queniquea (Sucre)",
        parishes: ["Queniquea", "Eleazar López Contreras", "San Pablo"]
      }
    ]
  },
  {
    name: "Zulia",
    cities: [
      {
        name: "Maracaibo",
        parishes: ["Olegario Villalobos", "Juana de Ávila", "Coquivacoa", "Chiquinquirá"]
      },
      {
        name: "Cabimas",
        parishes: ["Ambrosio", "Carmen Herrera", "Germán Ríos Linares"]
      }
    ]
  },
  {
    name: "Falcón",
    cities: [
      {
        name: "Coro",
        parishes: ["Santa Ana", "Guzmán Guillermo"]
      },
      {
        name: "Punto Fijo",
        parishes: ["Carirubana", "Punta Cardón", "Santa Ana"]
      }
    ]
  },
  {
    name: "Distrito Capital",
    cities: [
      {
        name: "Caracas",
        parishes: ["El Recreo", "Catedral", "La Candelaria", "Sucre (Catia)"]
      }
    ]
  }
];

async function seedGeographicData() {
  try {
    for (const stateData of venezuelaData) {
      const [state] = await State.findOrCreate({ where: { name: stateData.name } });
      console.log(`State: ${state.name}`);

      for (const cityData of stateData.cities) {
        const [city] = await City.findOrCreate({ 
          where: { name: cityData.name, stateId: state.id } 
        });
        console.log(`  City: ${city.name}`);

        for (const parishName of cityData.parishes) {
          await Parish.findOrCreate({ 
            where: { name: parishName, cityId: city.id } 
          });
        }
      }
    }
    console.log("Geographic data seeded successfully.");
  } catch (error) {
    console.error("Error seeding geographic data:", error);
  }
}

seedGeographicData();

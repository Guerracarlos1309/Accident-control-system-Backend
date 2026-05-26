const { Accident, Facility, AccidentType, Period, EmployeeAccident, InspectionStatus, Management } = require('./src/models');
const sequelize = require('./src/config/database');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    const accidents = await Accident.findAll({
      include: [
        { 
          model: Facility, 
          as: "facility",
          include: ["location", "installationType"]
        },
        { model: AccidentType, as: "type" },
        { model: Period, as: "period" },
        { 
          model: EmployeeAccident, 
          as: "involvedEmployees",
          include: ["employee"]
        },
        { model: InspectionStatus, as: "processStatus" },
        { model: Management, as: "management" }
      ]
    });
    console.log(`Successfully fetched ${accidents.length} accidents!`);
    accidents.forEach(a => {
      console.log(`- Accident ID: ${a.id}, Date: ${a.accidentDate}, Type: ${a.type?.name}, Affected employees count: ${a.involvedEmployees?.length}`);
    });
  } catch (err) {
    console.error('Error fetching accidents:', err);
  } finally {
    await sequelize.close();
  }
}

test();

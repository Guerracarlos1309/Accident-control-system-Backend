require('dotenv').config({ path: __dirname + '/.env' });
const { Facility, Location, Parish, City, State, FacilityImage, InstallationType } = require('./src/models');

async function dumpData() {
  try {
    const facilities = await Facility.findAll({
      include: [
        {
          model: Location,
          as: 'location',
          include: [
            {
              model: Parish,
              as: 'parish',
              include: [
                {
                  model: City,
                  as: 'city',
                  include: [{ model: State, as: 'state' }]
                }
              ]
            }
          ]
        },
        { model: InstallationType, as: 'installationType' },
        { model: FacilityImage, as: 'images' }
      ]
    });

    console.log(JSON.stringify(facilities, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error dumping data:', error);
    process.exit(1);
  }
}

dumpData();

const { AccidentType } = require('./src/models');
const sequelize = require('./src/config/database');

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/lookups/accident-types');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();

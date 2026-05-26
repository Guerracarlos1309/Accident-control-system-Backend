const { sequelize } = require('./src/models');

async function check() {
  try {
    const [types] = await sequelize.query(`SELECT * FROM accident_type`);
    console.log(JSON.stringify(types, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();

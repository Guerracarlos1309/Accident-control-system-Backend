require('dotenv').config();
const { sequelize } = require('../src/models');

async function run() {
  try {
    const [rows] = await sequelize.query("SELECT * FROM management");
    console.log("MANAGEMENT ROWS:");
    console.table(rows);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();

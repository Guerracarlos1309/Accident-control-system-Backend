const sequelize = require('./src/config/database');
const { ProtectionEquipmentCategory } = require('./src/models');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    const cats = await ProtectionEquipmentCategory.findAll();
    console.log(`Found ${cats.length} categories:`);
    cats.forEach(c => {
      console.log(`- ID: ${c.id}, Name: ${c.name}, Description: ${c.description}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

main();

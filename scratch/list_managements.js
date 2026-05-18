const { Management } = require('../src/models');

async function listManagements() {
  try {
    const managements = await Management.findAll();
    console.log(JSON.stringify(managements, null, 2));
  } catch (error) {
    console.error('Error fetching managements:', error);
  } finally {
    process.exit();
  }
}

listManagements();

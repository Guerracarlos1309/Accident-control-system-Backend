const { User, Role } = require('../src/models');

async function inspect() {
  try {
    const users = await User.findAll({
      include: [{ model: Role, as: 'role' }]
    });
    console.log('--- ALL USERS IN DB ---');
    users.forEach(u => {
      console.log(`ID: ${u.id} | Username: "${u.username}" | Role: "${u.role ? u.role.name : 'None'}" | Name: "${u.firstName} ${u.lastName}"`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

inspect();

const { Role, User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function run() {
  try {
    console.log('--- Ensuring Analista Role and User exist ---');
    
    // Find or create Role
    let [role, createdRole] = await Role.findOrCreate({
      where: { id: 3 },
      defaults: {
        name: 'Analista',
        description: 'Visualiza datos y reportes'
      }
    });
    
    if (createdRole) {
      console.log('✅ Created role: Analista (ID: 3)');
    } else {
      // Just double check name is 'Analista'
      if (role.name !== 'Analista') {
        role.name = 'Analista';
        role.description = 'Visualiza datos y reportes';
        await role.save();
        console.log('🔄 Updated role ID 3 to Analista');
      } else {
        console.log('ℹ️ Role Analista already exists');
      }
    }

    // Find or create User analista1
    const existingUser = await User.findOne({ where: { username: 'ANALISTA1' } });
    if (!existingUser) {
      // Create analyst user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        username: 'analista1',
        password: hashedPassword,
        roleId: 3,
        firstName: 'Ana',
        lastName: 'Lista'
      });
      console.log('✅ Created user: analista1 (password: password123)');
    } else {
      console.log('ℹ️ User analista1 already exists');
      // Ensure it has roleId = 3
      if (existingUser.roleId !== 3) {
        existingUser.roleId = 3;
        await existingUser.save();
        console.log('🔄 Updated user analista1 role to 3 (Analista)');
      }
    }

    console.log('🎉 Done checking/creating Analista role and user.');
  } catch (error) {
    console.error('❌ Error running script:', error);
  } finally {
    process.exit();
  }
}

run();

const { Role, User, sequelize } = require('./src/models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // 1. Ensure Roles exist
    console.log('Checking roles...');
    await Role.findOrCreate({ where: { id: 1 }, defaults: { name: 'Administrador', description: 'Acceso total' } });
    await Role.findOrCreate({ where: { id: 2 }, defaults: { name: 'Inspector', description: 'Realiza inspecciones y registros' } });
    await Role.findOrCreate({ where: { id: 3 }, defaults: { name: 'Analista', description: 'Visualiza datos y reportes' } });
    console.log('✅ Roles verified.');

    // 2. Admin User
    console.log('Checking Admin User...');
    const adminUser = await User.findOne({ where: { username: 'ADMIN' } });
    if (!adminUser) {
      await User.create({
        username: 'admin',
        password: 'admin123', // plain text, hooks hash it!
        roleId: 1,
        firstName: 'SISTEMA',
        lastName: 'ADMINISTRADOR'
      });
      console.log('✅ Created user: admin (password: admin123)');
    } else {
      adminUser.roleId = 1;
      adminUser.password = 'admin123'; // plain text, hooks will detect change and hash it!
      await adminUser.save();
      console.log('🔄 Reset/Updated user: admin (password reset to: admin123)');
    }

    // 3. Operator/Inspector User
    console.log('Checking Operator/Inspector User...');
    const opUser = await User.findOne({ where: { username: 'USUARIO1' } });
    if (!opUser) {
      await User.create({
        username: 'usuario1',
        password: 'password123', // plain text, hooks hash it!
        roleId: 2,
        firstName: 'CARLOS',
        lastName: 'GUERRA'
      });
      console.log('✅ Created user: usuario1 (password: password123)');
    } else {
      opUser.roleId = 2;
      opUser.password = 'password123'; // plain text, hooks will detect change and hash it!
      await opUser.save();
      console.log('🔄 Reset/Updated user: usuario1 (password reset to: password123)');
    }

    // 4. Analyst User
    console.log('Checking Analyst User...');
    const analistaUser = await User.findOne({ where: { username: 'ANALISTA1' } });
    if (!analistaUser) {
      await User.create({
        username: 'analista1',
        password: 'password123', // plain text, hooks hash it!
        roleId: 3,
        firstName: 'ANA',
        lastName: 'LISTA'
      });
      console.log('✅ Created user: analista1 (password: password123)');
    } else {
      analistaUser.roleId = 3;
      analistaUser.password = 'password123'; // plain text, hooks will detect change and hash it!
      await analistaUser.save();
      console.log('🔄 Reset/Updated user: analista1 (password reset to: password123)');
    }

    console.log('🎉 All users configured and successfully hashed by hooks!');
  } catch (error) {
    console.error('❌ Error configuring users:', error);
  } finally {
    process.exit(0);
  }
}

run();

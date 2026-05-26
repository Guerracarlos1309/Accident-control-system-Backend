const { sequelize, DamageAgent, ContactType } = require('./src/models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Clear old agents and contact types
    console.log('Cleaning old records...');
    await DamageAgent.destroy({ truncate: { cascade: true }, force: true }).catch(() => DamageAgent.destroy({ where: {} }));
    await ContactType.destroy({ truncate: { cascade: true }, force: true }).catch(() => ContactType.destroy({ where: {} }));

    console.log('Seeding Damage Agents...');
    await DamageAgent.bulkCreate([
      { id: 1, code: 'FIS', name: 'Físico', parent_id: null },
      { id: 2, code: 'ELE', name: 'Eléctrico', parent_id: null },
      { id: 3, code: 'MEC', name: 'Mecánico', parent_id: null },
      { id: 4, code: 'FAU', name: 'Fauna / Ambiente', parent_id: null },
      { id: 20, code: 'ELEC', name: 'Electricidad', parent_id: 2 }
    ]);

    console.log('Seeding Contact Types...');
    await ContactType.bulkCreate([
      { id: 1, code: 'GOL', name: 'Golpeado por/contra', parent_id: null },
      { id: 2, code: 'CON', name: 'Contacto Eléctrico', parent_id: null },
      { id: 30, code: 'ELEC', name: 'Arco Eléctrico', parent_id: 2 },
      { id: 41, code: 'CDIF', name: 'Caída a Distinto Nivel', parent_id: 1 }
    ]);

    // Sync serial sequence
    if (sequelize.getDialect() === 'postgres') {
      await sequelize.query(`SELECT setval(pg_get_serial_sequence('"damage_agent"', 'id'), (SELECT MAX(id) FROM "damage_agent"));`);
      await sequelize.query(`SELECT setval(pg_get_serial_sequence('"contact_type"', 'id'), (SELECT MAX(id) FROM "contact_type"));`);
      console.log('Sequence synced.');
    }

    console.log('🎉 Successfully seeded master lookup tables for Damage Agent and Contact Type!');
  } catch (err) {
    console.error('Error seeding lookups:', err);
  } finally {
    await sequelize.close();
  }
}

run();

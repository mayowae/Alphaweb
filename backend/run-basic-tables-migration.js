const { Sequelize } = require('sequelize');
const migration = require('./migrations/016_create_basic_tables.js');

async function runMigration() {
  const sequelize = new Sequelize('postgres://postgres:password@localhost:5432/Charles');
  
  try {
    console.log('Starting migration...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    await migration.up({
      sequelize,
      createTable: queryInterface.createTable.bind(queryInterface),
      addIndex: queryInterface.addIndex.bind(queryInterface),
      dropTable: queryInterface.dropTable.bind(queryInterface)
    }, Sequelize);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();

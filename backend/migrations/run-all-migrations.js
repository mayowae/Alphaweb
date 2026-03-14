require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const db = require('../models');

const sequelize = db.sequelize;

async function runAllMigrations() {
  try {
    console.log('🚀 Starting database migration...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    const migrationsDir = path.join(__dirname);
    
    // Core JS migrations that must run FIRST
    const coreJsFirstList = [
      '002-create-users-table.js',
      '016_create_basic_tables.js',
      '015_ensure_sql_prereqs.js',
      '023_create_roles_and_staff_tables.js',
      '20240209-create-accounting-tables.js',
      '20260103120000-add-super-admin-tables.js',
      '20260106-create-plans-table.js',
      '20260107000000-add-admin-staff-roles-tables.js',
      '20260107190000-create-support-tables.js'
    ];
    
    const jsAll = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'migrate.js' && file !== 'run-all-migrations.js')
      .sort();

    for (const coreJsFirst of coreJsFirstList) {
      if (jsAll.includes(coreJsFirst)) {
        console.log('\n📦 Running core JavaScript migration first: ' + coreJsFirst);
        try {
          const coreMigration = require(path.join(migrationsDir, coreJsFirst));
          if (coreMigration.up) {
            await coreMigration.up(sequelize.getQueryInterface(), Sequelize);
            console.log('✅ JavaScript migration ' + coreJsFirst + ' completed successfully');
          }
        } catch (error) {
          if (String(error.message).includes('already exists') || String(error.message).includes('duplicate key')) {
            console.log('⚠️  Core migration ' + coreJsFirst + ' skipped (already exists)');
          } else {
            console.error('❌ Error in ' + coreJsFirst + ':', error.message);
            throw error;
          }
        }
      }
    }

    console.log('\n📄 Running SQL migrations...');
    const sqlMigrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of sqlMigrationFiles) {
      console.log('\n🔄 Running SQL migration: ' + file);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      try {
        await sequelize.query(sqlContent);
        console.log('  ✅ Executed SQL migration: ' + file);
      } catch (error) {
        if (String(error.message).includes('already exists') || String(error.message).includes('duplicate key')) {
          console.log('  ⚠️  Skipped (already exists): ' + file);
        } else {
          console.error('❌ Error in ' + file + ':', error.message);
          throw error;
        }
      }
    }

    console.log('\n📦 Running remaining JavaScript migrations...');
    const jsRemainder = jsAll.filter(f => !coreJsFirstList.includes(f));
    for (const file of jsRemainder) {
      console.log('\n🔄 Running JavaScript migration: ' + file);
      const migration = require(path.join(migrationsDir, file));
      if (migration.up) {
        try {
          await migration.up(sequelize.getQueryInterface(), Sequelize);
          console.log('✅ JavaScript migration ' + file + ' completed successfully');
        } catch (error) {
          if (String(error.message).includes('already exists') || String(error.message).includes('duplicate key')) {
            console.log('⚠️  JavaScript migration ' + file + ' skipped (already exists)');
          } else {
            console.error('❌ Error in ' + file + ':', error.message);
            throw error;
          }
        }
      }
    }

    console.log('\n🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed.');
    process.exit(1);
  }
}

runAllMigrations();

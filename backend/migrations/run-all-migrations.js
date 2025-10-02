const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const db = require('../models');

// Use shared Sequelize instance configured via .env
const sequelize = db.sequelize;

async function runAllMigrations() {
  try {
    console.log('🚀 Starting database migration...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    const migrationsDir = path.join(__dirname);
    
    // Phase 1: run core base JS migration first (ensures core tables like branches/agents/customers)
    const coreJsFirst = '016_create_basic_tables.js';
    const jsAll = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'migrate.js' && file !== 'run-all-migrations.js')
      .sort();

    if (jsAll.includes(coreJsFirst)) {
      console.log(`\n📦 Running core JavaScript migration first: ${coreJsFirst}`);
      try {
        const coreMigration = require(path.join(migrationsDir, coreJsFirst));
        if (coreMigration.up) {
          await coreMigration.up(sequelize.getQueryInterface(), Sequelize);
          console.log(`✅ JavaScript migration ${coreJsFirst} completed successfully`);
        }
      } catch (error) {
        if (String(error.message).includes('already exists')) {
          console.log(`⚠️  Core migration ${coreJsFirst} skipped (already exists): ${error.message}`);
        } else {
          throw error;
        }
      }
    }

    // Phase 2: run SQL migrations next
    console.log('\n📄 Running SQL migrations...');
    const sqlMigrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${sqlMigrationFiles.length} SQL migration files`);

    for (const file of sqlMigrationFiles) {
      console.log(`\n🔄 Running SQL migration: ${file}`);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      try {
        await sequelize.query(sqlContent);
        console.log(`  ✅ Executed SQL migration: ${file}`);
      } catch (error) {
        if (String(error.message).includes('already exists') ||
            String(error.message).includes('duplicate key') ||
            (String(error.message).includes('relation') && String(error.message).includes('already exists'))) {
          console.log(`  ⚠️  Skipped (already exists): ${file}`);
        } else {
          throw error;
        }
      }
      console.log(`✅ SQL migration ${file} completed successfully`);
    }

    // Phase 3: run remaining JS migrations (excluding core already run)
    console.log('\n📦 Running remaining JavaScript migrations...');
    const jsRemainder = jsAll.filter(f => f !== coreJsFirst);
    for (const file of jsRemainder) {
      console.log(`\n🔄 Running JavaScript migration: ${file}`);
      const migration = require(path.join(migrationsDir, file));
      if (migration.up) {
        try {
          await migration.up(sequelize.getQueryInterface(), Sequelize);
          console.log(`✅ JavaScript migration ${file} completed successfully`);
        } catch (error) {
          if (String(error.message).includes('already exists') || 
              String(error.message).includes('duplicate key') ||
              (String(error.message).includes('column') && String(error.message).includes('already exists'))) {
            console.log(`⚠️  JavaScript migration ${file} skipped (already exists): ${error.message}`);
          } else {
            throw error;
          }
        }
      }
    }


    console.log('\n🎉 All migrations completed successfully!');
    console.log('\n📊 Database tables created:');
    console.log('  - investment_applications');
    console.log('  - loan_applications');
    console.log('  - loans');
    console.log('  - repayments');
    console.log('  - Plus any existing tables from JavaScript migrations');
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

// Run migrations
runAllMigrations();

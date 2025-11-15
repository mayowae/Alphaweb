const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Database configuration
const sequelize = new Sequelize('alphacollect_db', 'root', 'UJYmFcc5WNXZRmfApWfswlVUmtWYFnfW', {
  host: 'dpg-d2phh3mr433s73dakm90-a.oregon-postgres.render.com',
  port: 5432,
  dialect: 'postgres',
  logging: console.log, // Enable logging to see SQL queries
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function runAllMigrations() {
  try {
    console.log('🚀 Starting database migration...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    const migrationsDir = path.join(__dirname);
    
    // Run JavaScript migrations first
    console.log('\n📦 Running JavaScript migrations...');
    const jsMigrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'migrate.js' && file !== 'run-all-migrations.js')
      .sort();

    console.log(`Found ${jsMigrationFiles.length} JavaScript migration files`);

    for (const file of jsMigrationFiles) {
      console.log(`\n🔄 Running JavaScript migration: ${file}`);
      const migration = require(path.join(migrationsDir, file));

      if (migration.up) {
        try {
          await migration.up(sequelize.getQueryInterface(), Sequelize);
          console.log(`✅ JavaScript migration ${file} completed successfully`);
        } catch (error) {
          // Handle common migration errors gracefully
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('column') && error.message.includes('already exists')) {
            console.log(`⚠️  JavaScript migration ${file} skipped (already exists): ${error.message}`);
          } else {
            throw error;
          }
        }
      }
    }

    // Run SQL migrations
    console.log('\n📄 Running SQL migrations...');
    const sqlMigrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${sqlMigrationFiles.length} SQL migration files`);

    for (const file of sqlMigrationFiles) {
      console.log(`\n🔄 Running SQL migration: ${file}`);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute the entire SQL file as one transaction
      try {
        await sequelize.query(sqlContent);
        console.log(`  ✅ Executed SQL migration: ${file}`);
      } catch (error) {
        // Some statements might fail if tables already exist, which is okay
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate key') ||
            error.message.includes('relation') && error.message.includes('already exists')) {
          console.log(`  ⚠️  Skipped (already exists): ${file}`);
        } else {
          throw error;
        }
      }
      
      console.log(`✅ SQL migration ${file} completed successfully`);
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

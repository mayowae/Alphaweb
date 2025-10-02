const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Database configuration
const sequelize = new Sequelize('alphacollect_db', 'root', 'UJYmFcc5WNXZRmfApWfswlVUmtWYFnfW', {
  host: 'dpg-d2phh3mr433s73dakm90-a.oregon-postgres.render.com',
  port: 5432,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function runMigrations() {
  try {
    console.log('Starting database migration...');

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Read migration files
    const migrationsDir = path.join(__dirname);
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'migrate.js')
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(migrationsDir, file));

      if (migration.up) {
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        console.log(`✅ Migration ${file} completed successfully`);
      }
    }

    console.log('All migrations completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Database configuration
let sequelize;

if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL from .env');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  console.log('Using fallback credentials');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'alphacollect_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'UJYmFcc5WNXZRmfApWfswlVUmtWYFnfW',
    {
      host: process.env.DB_HOST || 'dpg-d2phh3mr433s73dakm90-a.oregon-postgres.render.com',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  );
}

async function runMigration() {
  try {
    console.log('Starting support tables migration...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    const migrationFile = '20260107190000-create-support-tables.js';
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    
    console.log(`Running migration: ${migrationFile}`);
    const migration = require(migrationPath);

    if (migration.up) {
      await migration.up(sequelize.getQueryInterface(), Sequelize);
      console.log(`✅ Migration ${migrationFile} completed successfully`);
    }

    console.log('Support tables migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

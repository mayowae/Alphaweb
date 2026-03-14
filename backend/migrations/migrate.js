require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const databaseUrl = process.env.DATABASE_URL;
const useSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true';

let sequelize;
if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSsl ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  });
} else {
  const database = process.env.DB_NAME || 'alphacollect_db';
  const username = process.env.DB_USER || 'alpha_admin';
  const password = process.env.DB_PASSWORD || 'AlphaWeb2026!';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;

  sequelize = new Sequelize(database, username, password, {
    host,
    port: Number(port),
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSsl ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  });
}

async function runMigrations() {
  try {
    console.log('Starting database migration...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    const migrationsDir = path.join(__dirname);
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'migrate.js')
      .sort();

    console.log('Found ' + migrationFiles.length + ' migration files');

    for (const file of migrationFiles) {
      console.log('Running migration: ' + file);
      const migration = require(path.join(migrationsDir, file));
      if (migration.up) {
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        console.log('✅ Migration ' + file + ' completed successfully');
      }
    }

    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

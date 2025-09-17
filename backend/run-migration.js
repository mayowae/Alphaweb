const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'dpg-d2phh3mr433s73dakm90-a.oregon-postgres.render.com',
  user: 'root',
  password: 'UJYmFcc5WNXZRmfApWfswlVUmtWYFnfW',
  database: 'alphacollect_db',
  port: 5432,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('Starting migration...');
    
    // First, create the customer_wallets table if it doesn't exist
    const createTableSQL = fs.readFileSync('migrations/008_create_customer_wallets_table.sql', 'utf8');
    console.log('Creating customer_wallets table...');
    await pool.query(createTableSQL);
    console.log('Table created successfully');
    
    // Then, ensure all required columns exist
    const ensureColumnsSQL = fs.readFileSync('migrations/009_ensure_customer_wallets_columns.sql', 'utf8');
    console.log('Ensuring all required columns exist...');
    await pool.query(ensureColumnsSQL);
    console.log('Columns ensured successfully');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();

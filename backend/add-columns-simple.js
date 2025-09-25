const { Pool } = require('pg');

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

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to customer_wallets table...');
    
    // Add created_at and updated_at columns if they don't exist
    const addColumnsSQL = `
      ALTER TABLE customer_wallets 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `;
    
    await pool.query(addColumnsSQL);
    console.log('Columns added successfully!');
    
  } catch (error) {
    console.error('Error adding columns:', error.message);
  } finally {
    await pool.end();
  }
}

addMissingColumns();

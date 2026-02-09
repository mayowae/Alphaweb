const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password',
  database: 'Charles'
});

async function verifyTables() {
  try {
    await client.connect();
    console.log('Connected to Charles database');
    
    // Check all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n=== ALL TABLES ===');
    tablesResult.rows.forEach(row => console.log(`✓ ${row.table_name}`));
    
    // Check specific tables that were causing errors
    const importantTables = ['agents', 'investments', 'customers', 'merchants', 'packages', 'repayments', 'loans', 'wallet_transactions'];
    
    console.log('\n=== TABLE STATUS ===');
    for (const tableName of importantTables) {
      if (tablesResult.rows.some(row => row.table_name === tableName)) {
        console.log(`✓ ${tableName} - EXISTS`);
      } else {
        console.log(`✗ ${tableName} - MISSING`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyTables();

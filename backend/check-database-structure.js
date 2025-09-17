const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password',
  database: 'Charles'
});

async function checkDatabaseStructure() {
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
    
    console.log('\n=== EXISTING TABLES ===');
    tablesResult.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    // Check specific tables mentioned in errors
    const importantTables = ['agents', 'investments', 'customers', 'customer_wallets', 'merchants'];
    
    for (const tableName of importantTables) {
      if (tablesResult.rows.some(row => row.table_name === tableName)) {
        console.log(`\n=== ${tableName.toUpperCase()} TABLE STRUCTURE ===`);
        
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);
        
        columnsResult.rows.forEach(row => {
          console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
        });
      } else {
        console.log(`\n=== ${tableName.toUpperCase()} TABLE ===`);
        console.log(`✗ Table '${tableName}' does not exist`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabaseStructure();

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://root:UJYmFcc5WNXZRmfApWfswlVUmtWYFnfW@dpg-d2phh3mr433s73dakm90-a.oregon-postgres.render.com:5432/alphacollect_db', {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function runInvestmentTransactionMigration() {
  try {
    console.log('🚀 Starting investment transaction table creation...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Create the investment_transactions table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS investment_transactions (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        customer VARCHAR(255) NOT NULL,
        account_number VARCHAR(255),
        package VARCHAR(255),
        amount DECIMAL(15,2) NOT NULL,
        branch VARCHAR(255),
        agent VARCHAR(255),
        transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'interest', 'penalty')),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
        notes TEXT,
        merchant_id INTEGER NOT NULL REFERENCES merchants(id),
        transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Add indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_investment_transactions_customer_id ON investment_transactions(customer_id);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_investment_transactions_merchant_id ON investment_transactions(merchant_id);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_investment_transactions_transaction_type ON investment_transactions(transaction_type);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_investment_transactions_status ON investment_transactions(status);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_investment_transactions_transaction_date ON investment_transactions(transaction_date);
    `);

    console.log('✅ Investment transactions table created successfully!');
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

// Run migration
runInvestmentTransactionMigration();

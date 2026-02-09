const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://root:UJYmFcc5WNXZRmfApWfswlVUmtWYFnfW@dpg-d2phh3mr433s73dakm90-a.oregon-postgres.render.com:5432/alphacollect_db', {
	dialect: 'postgres',
	logging: console.log,
	dialectOptions: {
		ssl: { require: true, rejectUnauthorized: false }
	}
});

async function runCreateCollectionsTable() {
	try {
		console.log('🚀 Creating collections table if not exists...');
		await sequelize.authenticate();
		console.log('✅ Database connection established.');

		await sequelize.query(`
			CREATE TABLE IF NOT EXISTS collections (
				id SERIAL PRIMARY KEY,
				customer_id INTEGER NOT NULL REFERENCES customers(id),
				customer_name VARCHAR(255) NOT NULL,
				amount DECIMAL(15,2) NOT NULL,
				due_date TIMESTAMPTZ NOT NULL,
				type VARCHAR(100) NOT NULL,
				status VARCHAR(50) DEFAULT 'Pending',
				merchant_id INTEGER NOT NULL REFERENCES merchants(id),
				date_created TIMESTAMPTZ DEFAULT NOW(),
				collected_date TIMESTAMPTZ,
				amount_collected DECIMAL(15,2),
				description TEXT,
				collection_notes TEXT,
				priority VARCHAR(20) DEFAULT 'Medium',
				reminder_sent BOOLEAN DEFAULT FALSE,
				reminder_date TIMESTAMPTZ,
				-- New cycle/package fields
				cycle INTEGER NOT NULL DEFAULT 31,
				cycle_counter INTEGER NOT NULL DEFAULT 1,
				package_id INTEGER,
				package_name VARCHAR(255),
				package_amount DECIMAL(15,2),
				is_first_collection BOOLEAN NOT NULL DEFAULT FALSE
			);
		`);

		await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_collections_customer_id ON collections(customer_id);`);
		await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_collections_merchant_id ON collections(merchant_id);`);
		await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_collections_status ON collections(status);`);
		await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_collections_due_date ON collections(due_date);`);

		console.log('✅ Collections table is ready.');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Creation failed:', error);
		console.error('\nError details:', error.message);
		process.exit(1);
	}
}

runCreateCollectionsTable();

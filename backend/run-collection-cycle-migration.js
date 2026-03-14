const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration (reuse same style as existing migration)
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

async function runCollectionCycleMigration() {
	try {
		console.log('🚀 Starting collections cycle columns migration...');

		// Test connection
		await sequelize.authenticate();
		console.log('✅ Database connection established.');

		// Add columns if they don't exist
		await sequelize.query(`
			DO $$
			BEGIN
				IF NOT EXISTS (
					SELECT 1 FROM information_schema.columns 
					WHERE table_name='collections' AND column_name='cycle'
				) THEN
					ALTER TABLE collections ADD COLUMN cycle INTEGER NOT NULL DEFAULT 31;
				END IF;
			END $$;
		`);

		await sequelize.query(`
			DO $$
			BEGIN
				IF NOT EXISTS (
					SELECT 1 FROM information_schema.columns 
					WHERE table_name='collections' AND column_name='cycle_counter'
				) THEN
					ALTER TABLE collections ADD COLUMN cycle_counter INTEGER NOT NULL DEFAULT 1;
				END IF;
			END $$;
		`);

		await sequelize.query(`
			DO $$
			BEGIN
				IF NOT EXISTS (
					SELECT 1 FROM information_schema.columns 
					WHERE table_name='collections' AND column_name='package_id'
				) THEN
					ALTER TABLE collections ADD COLUMN package_id INTEGER;
				END IF;
			END $$;
		`);

		await sequelize.query(`
			DO $$
			BEGIN
				IF NOT EXISTS (
					SELECT 1 FROM information_schema.columns 
					WHERE table_name='collections' AND column_name='package_name'
				) THEN
					ALTER TABLE collections ADD COLUMN package_name VARCHAR(255);
				END IF;
			END $$;
		`);

		await sequelize.query(`
			DO $$
			BEGIN
				IF NOT EXISTS (
					SELECT 1 FROM information_schema.columns 
					WHERE table_name='collections' AND column_name='package_amount'
				) THEN
					ALTER TABLE collections ADD COLUMN package_amount DECIMAL(15,2);
				END IF;
			END $$;
		`);

		await sequelize.query(`
			DO $$
			BEGIN
				IF NOT EXISTS (
					SELECT 1 FROM information_schema.columns 
					WHERE table_name='collections' AND column_name='is_first_collection'
				) THEN
					ALTER TABLE collections ADD COLUMN is_first_collection BOOLEAN NOT NULL DEFAULT false;
				END IF;
			END $$;
		`);

		console.log('✅ Collections cycle columns migration completed!');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Migration failed:', error);
		console.error('\nError details:', error.message);
		process.exit(1);
	}
}

runCollectionCycleMigration();

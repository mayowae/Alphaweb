import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

# Use absolute paths for everything and run from the backend directory
test_script = """
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}
console.log('Testing connection to:', databaseUrl.split('@')[1]);

const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: (msg) => console.log('[Sequelize]:', msg)
});

async function test() {
    try {
        console.log('Attempting to authenticate...');
        await sequelize.authenticate();
        console.log('SUCCESS: Connection has been established successfully.');
        const [results] = await sequelize.query('SELECT NOW()');
        console.log('Query result:', results);
    } catch (error) {
        console.error('FAILURE: Unable to connect to the database:');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

test();
"""

stdin, stdout, stderr = client.exec_command("cat > /home/mayowae/public_html/alphaweb/backend/test_db_direct.js << 'EOF'\n" + test_script + "\nEOF")
stdin, stdout, stderr = client.exec_command("cd /home/mayowae/public_html/alphaweb/backend && node test_db_direct.js")

print("--- Test Results ---")
print(stdout.read().decode('utf-8'))
print(stderr.read().decode('utf-8'))

client.close()

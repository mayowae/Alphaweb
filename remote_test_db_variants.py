import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

# Experiment with different SSL configs
test_script = """
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const databaseUrl = process.env.DATABASE_URL;

async function runTest(label, options) {
    console.log(`--- Testing ${label} ---`);
    const sequelize = new Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: false,
        ...options
    });
    try {
        await sequelize.authenticate();
        console.log(`SUCCESS: ${label}`);
    } catch (error) {
        console.log(`FAILURE: ${label} - ${error.message}`);
    } finally {
        await sequelize.close();
    }
}

async function main() {
    // 1. Current config
    await runTest('Current Config', {
        dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
    });

    // 2. Simple SSL: true
    await runTest('SSL: true', {
        dialectOptions: { ssl: true }
    });

    // 3. No SSL (should fail differently)
    await runTest('No SSL', {});
    
    // 4. Increase timeouts
    await runTest('Long Timeout', {
        dialectOptions: { 
            ssl: { require: true, rejectUnauthorized: false },
            connectionTimeoutMillis: 10000
        },
        pool: { acquire: 30000 }
    });
}

main();
"""

stdin, stdout, stderr = client.exec_command("cat > /home/mayowae/public_html/alphaweb/backend/test_db_variants.js << 'EOF'\n" + test_script + "\nEOF")
stdin, stdout, stderr = client.exec_command("cd /home/mayowae/public_html/alphaweb/backend && node test_db_variants.js")

print("--- Test Results ---")
print(stdout.read().decode('utf-8'))
print(stderr.read().decode('utf-8'))

client.close()

import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

test_script = """
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '/home/mayowae/public_html/alphaweb/backend/.env' });

const databaseUrl = process.env.DATABASE_URL;
console.log('Testing connection to:', databaseUrl.split('@')[1]);

const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: console.log
});

async function test() {
    try {
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

stdin, stdout, stderr = client.exec_command("cat > /tmp/test_db.js << 'EOF'\n" + test_script + "\nEOF")
stdin, stdout, stderr = client.exec_command("cd /home/mayowae/public_html/alphaweb/backend && node /tmp/test_db.js")

print("--- Test Results ---")
print(stdout.read().decode('utf-8'))
print(stderr.read().decode('utf-8'))

client.close()

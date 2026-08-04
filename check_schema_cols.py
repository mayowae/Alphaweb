import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='ignore'), stderr.read().decode('utf-8', errors='ignore')

# Check if global underscored is set in models/index.js
print("--- Searching for 'underscored' in models/index.js ---")
out, _ = run("grep -n 'underscored' /home/mayowae/public_html/alphaweb/backend/models/index.js")
print(out or "(not found)")

# Check the actual columns in the merchants table via node
test_script = r"""
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Sequelize } = require('sequelize');
const databaseUrl = process.env.DATABASE_URL;

const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    logging: false
});

async function main() {
    try {
        const [rows] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'merchants' ORDER BY ordinal_position;");
        console.log('COLUMNS:', JSON.stringify(rows, null, 2));
    } catch(e) {
        console.error('ERROR:', e.message);
    } finally {
        await sequelize.close();
    }
}
main();
"""

out, _ = run(f"cat > /home/mayowae/public_html/alphaweb/backend/check_cols.js << 'SCRIPTEOF'\n{test_script}\nSCRIPTEOF")
out, err = run("cd /home/mayowae/public_html/alphaweb/backend && node check_cols.js")
print("--- Actual DB Columns ---")
print(out)
if err:
    print("ERR:", err)

client.close()

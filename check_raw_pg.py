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

# Check each model for underscored setting
print("--- Searching for 'underscored' across all models ---")
out, _ = run("grep -rn 'underscored' /home/mayowae/public_html/alphaweb/backend/models/")
print(out or "(not found)")

# Check if pg-native is installed (can cause SSL issues)
print("--- Check pg-native ---")
out, _ = run("ls /home/mayowae/public_html/alphaweb/backend/node_modules/pg-native 2>/dev/null || echo 'not installed'")
print(out)

# Get the exact version of pg installed
print("--- pg version ---")
out, _ = run("cat /home/mayowae/public_html/alphaweb/backend/node_modules/pg/package.json | grep '\"version\"'")
print(out)

# Try to connect using pg directly with a simpler config (not via sequelize)
test_raw = r"""
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Client } = require('pg');

const url = process.env.DATABASE_URL;
console.log('Connecting to:', url.split('@')[1]);

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('RAW PG CONNECTED!');
    return client.query('SELECT version()');
  })
  .then(res => {
    console.log('Server version:', res.rows[0].version);
    return client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'merchants' ORDER BY ordinal_position");
  })
  .then(res => {
    console.log('COLUMNS:', JSON.stringify(res.rows));
    client.end();
  })
  .catch(err => {
    console.error('RAW PG ERROR:', err.message, err.code, err.routine);
    client.end();
  });
"""

run(f"cat > /home/mayowae/public_html/alphaweb/backend/test_raw_pg.js << 'SCRIPTEOF'\n{test_raw}\nSCRIPTEOF")
out, err = run("cd /home/mayowae/public_html/alphaweb/backend && node test_raw_pg.js 2>&1")
print("--- Raw PG Test ---")
print(out or err)

client.close()

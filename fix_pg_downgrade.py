import paramiko
import os

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

print("=== Step 1: Downgrade pg to 8.8.0 (was working before) ===")
out, err = run("cd /home/mayowae/public_html/alphaweb/backend && npm install pg@8.8.0 --save 2>&1")
print(out[-500:] if len(out) > 500 else out)

print("\n=== Step 2: Verify pg version ===")
out, err = run("cat /home/mayowae/public_html/alphaweb/backend/node_modules/pg/package.json | grep '\"version\"'")
print(out)

print("\n=== Step 3: Test DB connection with old pg ===")
test_script = r"""
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Client } = require('pg');

const url = process.env.DATABASE_URL;
const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('SUCCESS: Connected!');
    return client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'merchants' ORDER BY ordinal_position");
  })
  .then(res => {
    console.log('MERCHANTS COLUMNS:', res.rows.map(r => r.column_name).join(', '));
    client.end();
  })
  .catch(err => {
    console.error('FAILED:', err.message);
    client.end();
  });
"""

run(f"cat > /home/mayowae/public_html/alphaweb/backend/test_conn.js << 'SCRIPTEOF'\n{test_script}\nSCRIPTEOF")
out, err = run("cd /home/mayowae/public_html/alphaweb/backend && timeout 15 node test_conn.js 2>&1")
print(out or err)

# Step 4: If connected, fix the merchant model to match actual DB columns
print("\n=== Step 4: Restart backend ===")
out, err = run("pm2 restart alphaweb-backend && sleep 3 && pm2 list | grep alphaweb")
print(out[:500])

client.close()

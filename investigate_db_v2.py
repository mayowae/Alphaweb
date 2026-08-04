import paramiko
import sys
import io

# Force UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

# Restart backend
run("pm2 restart alphaweb-backend")
print("Backend restarted.")

# Check when DB last worked
print("\n=== Last 'Database connection' message in out log ===")
out, _ = run("grep -n 'Database connection' /root/.pm2/logs/alphaweb-backend-out.log | tail -5")
print(out or "(none found)")

# Get latest backend log lines
print("\n=== Latest backend out log (last 20 lines) ===")
out, _ = run("tail -20 /root/.pm2/logs/alphaweb-backend-out.log")
print(out)

# Check local postgres
print("\n=== Local PostgreSQL databases ===")
out, err = run("psql -U postgres -l 2>&1")
print(out or err)

# Check if the server's NODE_OPTIONS might help
print("\n=== Current NODE_OPTIONS env ===")
out, _ = run("pm2 env 0 2>&1 | grep NODE")
print(out or "(none)")

# Try with NODE_OPTIONS set to force legacy SSL
print("\n=== Test with --openssl-legacy-provider ===")
test_script = r"""
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Client } = require('pg');
const url = process.env.DATABASE_URL;
const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
client.connect()
  .then(() => { console.log('CONNECTED!'); return client.query('SELECT NOW()'); })
  .then(r => { console.log('Time:', r.rows[0].now); client.end(); })
  .catch(e => { console.log('FAILED:', e.message, e.code); client.end(); });
"""
run(f"cat > /home/mayowae/public_html/alphaweb/backend/test_conn2.js << 'SCRIPTEOF'\n{test_script}\nSCRIPTEOF")
out, err = run("cd /home/mayowae/public_html/alphaweb/backend && NODE_OPTIONS='--tls-min-v1.0' timeout 15 node test_conn2.js 2>&1")
print(out or err)

client.close()

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

# Try with no SSL at all using the external DB URL 
# Render requires SSL, but let's confirm what happens
test_nossl = r"""
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Client } = require('pg');

const url = process.env.DATABASE_URL;

// Append sslmode=require explicitly  
const connString = url + (url.includes('?') ? '&' : '?') + 'sslmode=require';

console.log('URL (redacted):', url.replace(/:\/\/.*?@/, '://***@'));
console.log('Node TLS Version:', process.version);

// Try with ssl: true
const c1 = new Client({ connectionString: url, ssl: true });
c1.connect()
  .then(() => { console.log('ssl:true -> CONNECTED'); c1.end(); })
  .catch(e => {
    console.log('ssl:true -> FAILED:', e.message);
    
    // Try with ssl: false (will likely fail for Render, but reveals firewall vs DB rejection)
    const c2 = new Client({ connectionString: url, ssl: false });
    c2.connect()
      .then(() => { console.log('ssl:false -> CONNECTED'); c2.end(); })
      .catch(e2 => { console.log('ssl:false -> FAILED:', e2.message); });
  });
"""

run(f"cat > /home/mayowae/public_html/alphaweb/backend/test_ssl_modes.js << 'SCRIPTEOF'\n{test_nossl}\nSCRIPTEOF")
out, err = run("cd /home/mayowae/public_html/alphaweb/backend && timeout 15 node test_ssl_modes.js 2>&1")
print("--- SSL Mode Test ---")
print(out or err)

# Check if outbound port 5432 is actually reachable  
out2, err2 = run("timeout 5 bash -c 'echo > /dev/tcp/35.227.164.209/5432' 2>&1 && echo OPEN || echo BLOCKED")
print("--- Port 5432 reachability ---")
print(out2 or err2)

client.close()

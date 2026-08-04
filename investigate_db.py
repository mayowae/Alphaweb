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

# Restart backend
out, err = run("pm2 restart alphaweb-backend 2>&1")
print("Restart result (truncated):", out[:200])

# The problem is NOT the pg version - it's the Render DB itself.
# The DB may have been suspended/deleted. Let's check timestamps of when it last worked.
print("\n=== Last successful DB operation in backend OUT log ===")
out, err = run("grep -n 'Database connection' /root/.pm2/logs/alphaweb-backend-out.log | tail -5")
print(out or "(no DB success message found)")

print("\n=== Latest backend out log (last 30 lines) ===")
out, err = run("tail -30 /root/.pm2/logs/alphaweb-backend-out.log")
print(out)

# Check if the Render database could be replaced with the local postgres 
# that's already running on the server (port 5432 local)
print("\n=== Local PostgreSQL check ===")
out, err = run("psql -U postgres -c 'SELECT version();' 2>&1")
print(out or err)

# List local databases
out, err = run("psql -U postgres -l 2>&1")
print(out or err)

client.close()

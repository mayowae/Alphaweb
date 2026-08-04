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

# New local database URL
new_db_url = "postgresql://alpha_admin:AlphaW3b%40Local2024@127.0.0.1:5432/alphacollect_db"

print("=== Updating .env to use local database ===")
env_path = "/home/mayowae/public_html/alphaweb/backend/.env"

# Use sed to update DATABASE_URL and ensure DB_SSL is false
run(f"sed -i 's|^DATABASE_URL=.*|DATABASE_URL={new_db_url}|' {env_path}")
run(f"sed -i 's|^DB_SSL=.*|DB_SSL=false|' {env_path}")

# If DB_SSL doesn't exist, append it
out, _ = run(f"grep '^DB_SSL=' {env_path}")
if not out:
    run(f"echo 'DB_SSL=false' >> {env_path}")

print("Updated .env successfully.")

# Restart backend
print("\n=== Restarting backend process ===")
run("pm2 restart alphaweb-backend")

# Verify logs for connection success
import time
time.sleep(3)
print("\n=== Checking backend logs for database connection status ===")
out, _ = run("tail -n 50 /root/.pm2/logs/alphaweb-backend-out.log")
print(out)

client.close()

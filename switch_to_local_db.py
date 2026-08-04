import paramiko
import sys
import io

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

NEW_PASS = "AlphaW3b@Local2024"

# Step 1: Reset the alpha_admin password
print("=== Step 1: Reset alpha_admin password ===")
out, err = run(f"sudo -u postgres psql -c \"ALTER USER alpha_admin WITH PASSWORD '{NEW_PASS}';\" 2>&1")
print(out or err)

# Step 2: Update pg_hba.conf to allow password auth from localhost
print("\n=== Step 2: Check pg_hba.conf ===")
out, err = run("cat /var/lib/pgsql/data/pg_hba.conf | grep -v '^#' | grep -v '^$'")
print(out or err)

# Step 3: Ensure md5/password auth is allowed for local TCP connections
print("\n=== Step 3: Update pg_hba.conf for password auth ===")
# Check if there's already a line for alphacollect_db
out, err = run("grep 'alphacollect_db\\|alpha_admin\\|md5\\|scram\\|127.0.0.1' /var/lib/pgsql/data/pg_hba.conf")
print(out or err)

# Step 4: Test connection with new password
print("\n=== Step 4: Test connection with new password ===")
out, err = run(f"PGPASSWORD='{NEW_PASS}' psql -h 127.0.0.1 -U alpha_admin -d alphacollect_db -c 'SELECT COUNT(*) FROM merchants;' 2>&1")
print(out or err)

client.close()

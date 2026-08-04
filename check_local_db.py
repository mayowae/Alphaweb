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

# The database alphacollect_db already exists! Let's check its owner and connect to it
print("=== alphacollect_db owner and user info ===")
out, err = run("sudo -u postgres psql -c \"SELECT usename, passwd IS NOT NULL as has_pass FROM pg_user WHERE usename = 'alpha_admin';\" 2>&1")
print(out or err)

# Check tables in alphacollect_db
print("\n=== Tables in alphacollect_db ===")
out, err = run("sudo -u postgres psql -d alphacollect_db -c \"\\dt\" 2>&1")
print(out or err)

# Check the merchants table columns
print("\n=== merchants table columns ===")
out, err = run("sudo -u postgres psql -d alphacollect_db -c \"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'merchants' ORDER BY ordinal_position;\" 2>&1")
print(out or err)

# Update the backend .env to use local database
print("\n=== Current DATABASE_URL in .env ===")
out, err = run("grep DATABASE_URL /home/mayowae/public_html/alphaweb/backend/.env")
print(out or err)

client.close()

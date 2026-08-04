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

# Step 1: Check if we can access local postgres as root (via peer auth override)
print("=== Step 1: Access local postgres ===")
out, err = run("sudo -u postgres psql -c \"SELECT version();\" 2>&1")
print(out or err)

# Step 2: Create the database and user
print("\n=== Step 2: Create alphaweb database and user ===")
setup_sql = """
CREATE DATABASE alphaweb_db;
CREATE USER alphaweb_user WITH ENCRYPTED PASSWORD 'AlphaWeb2024!Secure';
GRANT ALL PRIVILEGES ON DATABASE alphaweb_db TO alphaweb_user;
GRANT ALL ON SCHEMA public TO alphaweb_user;
ALTER DATABASE alphaweb_db OWNER TO alphaweb_user;
"""
out, err = run(f"sudo -u postgres psql -c \"{setup_sql}\" 2>&1")
print(out or err)

# Step 3: Verify the database was created
print("\n=== Step 3: Verify database list ===")
out, err = run("sudo -u postgres psql -l 2>&1")
print(out or err)

client.close()

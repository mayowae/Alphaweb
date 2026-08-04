import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run_sql(sql):
    # Run in /tmp to avoid permission errors
    cmd = f"cd /tmp && sudo -u postgres psql -d alphacollect_db -c \"{sql}\""
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8').strip()
    err = stderr.read().decode('utf-8').strip()
    return out, err

# Check what ENUM types exist for remittances
out, err = run_sql("SELECT typname FROM pg_type WHERE typname LIKE '%remittance%';")
print("Remittance ENUM types:", out or err)

out, err = run_sql("SELECT typname FROM pg_type WHERE typname LIKE '%collection%';")
print("Collection ENUM types:", out or err)

# Check what the remittances.status type is (it shows as USER-DEFINED)
out, err = run_sql("SELECT udt_name FROM information_schema.columns WHERE table_name='remittances' AND column_name='status';")
print("Remittances status type:", out or err)

client.close()

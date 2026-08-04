import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run_sql(sql):
    cmd = f'sudo -u postgres psql -d alphacollect_db -c "{sql}"'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8').strip()
    err = stderr.read().decode('utf-8').strip()
    return out, err

# remittances is still missing source. Add it properly.
# The enum_remittances_source type exists (from previous run), so use it directly
out, err = run_sql("ALTER TABLE remittances ADD COLUMN IF NOT EXISTS source enum_remittances_source NOT NULL DEFAULT 'Web';")
print("Add source to remittances:", out or err)

# Verify
out, _ = run_sql("SELECT column_name, udt_name FROM information_schema.columns WHERE table_name='remittances' AND column_name='source';")
print("Verify remittances.source:", out)

client.close()

import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run_sql(sql):
    cmd = f"cd /tmp && sudo -u postgres psql -d alphacollect_db -c \"{sql}\""
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8').strip()
    err = stderr.read().decode('utf-8').strip()
    return out, err

# The ENUM type for remittances source doesn't exist, but collections_source does
# Let's create one for remittances and add it
print("=== Creating enum_remittances_source ===")
out, err = run_sql("CREATE TYPE enum_remittances_source AS ENUM ('Mobile', 'Web', 'API');")
print("Create enum:", out or err)

print("\n=== Adding source column to remittances ===")
out, err = run_sql("ALTER TABLE remittances ADD COLUMN IF NOT EXISTS source enum_remittances_source NOT NULL DEFAULT 'Web';")
print("Add column:", out or err)

print("\n=== Verify ===")
out, _ = run_sql("SELECT column_name, udt_name FROM information_schema.columns WHERE table_name='remittances' AND column_name='source';")
print("remittances.source:", out)

out, _ = run_sql("SELECT column_name, udt_name FROM information_schema.columns WHERE table_name='collections' AND column_name='source';")
print("collections.source:", out)

client.close()

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

print("=== Applying missing column migrations ===\n")

# 1. Add 'source' to collections as ENUM
out, err = run_sql("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_collections_source') THEN CREATE TYPE enum_collections_source AS ENUM ('Mobile', 'Web', 'API'); END IF; END$$;")
print("Create enum_collections_source:", out or err)

out, err = run_sql("ALTER TABLE collections ADD COLUMN IF NOT EXISTS source enum_collections_source NOT NULL DEFAULT 'Web';")
print("Add source to collections:", out or err)

# 2. Add 'source' to remittances as ENUM  
out, err = run_sql("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_remittances_source') THEN CREATE TYPE enum_remittances_source AS ENUM ('Mobile', 'Web', 'API'); END IF; END$$;")
print("Create enum_remittances_source:", out or err)

out, err = run_sql("ALTER TABLE remittances ADD COLUMN IF NOT EXISTS source enum_remittances_source NOT NULL DEFAULT 'Web';")
print("Add source to remittances:", out or err)

# 3. Verify the changes
print("\n=== Verifying collections schema ===")
out, _ = run_sql("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='collections' ORDER BY ordinal_position;")
print(out)

print("\n=== Verifying remittances schema ===")
out, _ = run_sql("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='remittances' ORDER BY ordinal_position;")
print(out)

client.close()

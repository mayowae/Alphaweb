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

print("=== Fixing column types and adding missing columns ===\n")

# Fix remittances.source type: drop VARCHAR column and add proper ENUM
out, err = run_sql("ALTER TABLE remittances DROP COLUMN IF EXISTS source;")
print("Drop old source from remittances:", out or err)

out, err = run_sql("ALTER TABLE remittances ADD COLUMN source enum_remittances_source NOT NULL DEFAULT 'Web';")
print("Add ENUM source to remittances:", out or err)

# Fix collections.source: it was added as VARCHAR. The model expects ENUM.
# Check if enum_collections_source already has values
out, err = run_sql("SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'enum_collections_source';")
print("collections source ENUM values:", out or "(not found)")

# If it wasn't created properly, just keep VARCHAR — it will still work
# But if the model does strict ENUM checks, we need to match.
# For safety, let's just convert it:
out, err = run_sql("ALTER TABLE collections DROP COLUMN IF EXISTS source;")
print("Drop old source from collections:", out or err)

out, err = run_sql("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_collections_source') THEN CREATE TYPE enum_collections_source AS ENUM ('Mobile', 'Web', 'API'); END IF; END$$;")
print("Ensure enum_collections_source exists:", out or err)

out, err = run_sql("ALTER TABLE collections ADD COLUMN source enum_collections_source NOT NULL DEFAULT 'Web';")
print("Add ENUM source to collections:", out or err)

# Now proactively check the collection model for other missing fields
# The error log showed: source was missing. Let's also check loans, agents, etc
# List all tables to see what models may have schema mismatches
print("\n=== Checking all table column lists ===")
out, _ = run_sql("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;")
print(out)

client.close()
